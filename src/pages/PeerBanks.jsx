import React, { useEffect, useState } from 'react';
import PeerSidebar from '../components/peer/PeerSidebar';
import { useAuth } from '../hooks/useAuth';


const PeerBanks = () => {
  const { user } = useAuth();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [form, setForm] = useState({
    userId: user?._id ,
    upiId: '',
    bankName: '',
    accNo: '',
    accHolderName: '',
    ifscCode: '',
    isActive: true
  });

  const fetchBanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bank/getAllBanks_With_Pagination/${user?._id}?page=1&limit=20`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load banks');

      // API returns { data: [ ...banks ] } along with pagination metadata
      const list = data?.data || data?.results || data?.banks || (Array.isArray(data) ? data : []);
      setBanks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch banks', err);
      setError(err.message || 'Failed to fetch banks');
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const [toggling, setToggling] = useState({});

  const toggleBankStatus = async (bankId, current) => {
    const newStatus = !current;
    setToggling((s) => ({ ...s, [bankId]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bank/updateActiveBankStatus_forPeer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          bankId: bankId
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchBanks()
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to toggle bank status');

      setBanks((prev) => prev.map((b) => (b._id === bankId || b.id === bankId ? { ...b, isActive: newStatus } : b)));
    } catch (err) {
      console.error('Toggle failed', err);
      alert(err?.message || 'Failed to toggle bank status');
    } finally {
      setToggling((s) => ({ ...s, [bankId]: false }));
    }
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const submitCreate = async () => {
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bank/addBank`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create bank');

      setShowCreateModal(false);
      setForm({ ...form, bankName: '', accNo: '', accHolderName: '', ifscCode: '' });
      fetchBanks();
    } catch (err) {
      console.error('Create bank failed', err);
      setCreateError(err.message || 'Failed to create bank');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <PeerSidebar />
      <main className="flex-1 p-6 ml-64">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Banks</h1>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Bank</button>
        </div>

        {loading ? (
          <p>Loading banks...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">Bank Name</th>
                    <th className="py-2">UPI ID</th>
                    <th className="py-2">Account No</th>
                    <th className="py-2">Account Holder</th>
                    <th className="py-2">IFSC</th>
                    <th className="py-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.length === 0 ? (
                    <tr><td colSpan={8} className="py-4 text-center text-gray-500">No banks found</td></tr>
                  ) : (
                    banks.map((b, i) => (
                      <tr key={b._id || b.id || i} className="border-t">
                        <td className="py-2 align-top">{i + 1}</td>
                        <td className="py-2 align-top">{b.bankName || b.name || '-'}</td>
                        <td className="py-2 align-top">{b.upiId || '-'}</td>
                        <td className="py-2 align-top">{b.accNo || '-'}</td>
                        <td className="py-2 align-top">{b.accHolderName || '-'}</td>
                        <td className="py-2 align-top">{b.ifscCode || '-'}</td>
                        <td className="py-2 align-top">
                          <button
                            type="button"
                            onClick={() => !toggling[b._id || b.id] && toggleBankStatus(b._id || b.id, !!b.isActive)}
                            disabled={!!toggling[b._id || b.id]}
                            aria-pressed={!!b.isActive}
                            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${b.isActive ? 'bg-blue-600' : 'bg-gray-300'} ${toggling[b._id || b.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className={`inline-block h-4 w-4 bg-white rounded-full transform transition-transform ${b.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create Bank</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500">×</button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">UPI ID</label>
                  <input className="w-full p-2 border rounded" value={form.upiId} onChange={(e) => handleChange('upiId', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Bank Name</label>
                  <input className="w-full p-2 border rounded" value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Account Number</label>
                  <input className="w-full p-2 border rounded" value={form.accNo} onChange={(e) => handleChange('accNo', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Account Holder Name</label>
                  <input className="w-full p-2 border rounded" value={form.accHolderName} onChange={(e) => handleChange('accHolderName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">IFSC Code</label>
                  <input className="w-full p-2 border rounded" value={form.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
                  <label htmlFor="isActive" className="text-sm">Active</label>
                </div>

                {createError && <p className="text-sm text-red-600">{createError}</p>}

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={submitCreate} disabled={creating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{creating ? 'Creating...' : 'Create'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PeerBanks;
