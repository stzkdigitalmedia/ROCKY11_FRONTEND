import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';

const CasinoSettlement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ amount: '', type: 'Loss', remarks: '' });
  const [creating, setCreating] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', type: 'Loss', remarks: '' });
  const [editing, setEditing] = useState(false);
  const limit = 10;

  const fetchSettlements = async (currentPage = 1) => {
    setLoading(true);
    try {
      const [res, plRes] = await Promise.all([
        apiHelper.get(`/casinoSettlement/getSettlements?page=${currentPage}&limit=${limit}`),
        apiHelper.get('/getProfitLoss'),
      ]);
      const data = res?.data || res;
      setSettlements(data?.settlements || data?.data || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || data?.pagination?.totalPages || 1);
      setTotal(data?.total || data?.pagination?.total || 0);
      if (res?.totals?.settled_profit !== undefined || res?.totals?.settled_loss !== undefined) {
        setSummary({ settled_profit: res?.totals?.settled_profit ?? 0, settled_loss: res?.totals?.settled_loss ?? 0 });
      }
      const plData = plRes?.data || plRes;
      if (plData) setProfitLoss(plData);
    } catch (error) {
      toast.error('Failed to fetch settlements: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettlements(page); }, [page]);

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    navigate(userRole === 'SA' || userRole === 'SubAdmin' ? '/suprime/super-admin' : '/login', { replace: true });
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard', 'manual-dash': '/manual-dash', overview: '/overview',
      games: '/games', allinreq: '/allinreq', quickpayreq: '/quickpayreq',
      panels: '/panels', 'balance-logs': '/balance-logs',
      'transaction-history': '/transaction-history', 'transaction-logs': '/transaction-logs',
      'tier-management': '/tier-management', 'telegram-otp': '/telegram-otp',
      bonuses: '/sa-bonuses', referral: '/referral', notifications: '/notifications',
      'casino-settlement': '/casino-settlement',
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  const currentType = profitLoss?.ggr?.label;

  const handleCreateSettlement = async () => {
    if (!createForm.amount) { toast.error('Please enter amount'); return; }
    setCreating(true);
    try {
      await apiHelper.post('/casinoSettlement/createSettlement', {
        amount: parseFloat(createForm.amount),
        type: createForm.type,
        remarks: createForm.remarks,
      });
      toast.success('Settlement created successfully!');
      setCreateModal(false);
      setCreateForm({ amount: '', type: 'Loss', remarks: '' });
      fetchSettlements(page);
    } catch (error) {
      toast.error('Failed to create settlement: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditSettlement = async () => {
    if (!editForm.amount) { toast.error('Please enter amount'); return; }
    setEditing(true);
    try {
      await apiHelper.patch(`/casinoSettlement/editSettlement/${editModal}`, {
        amount: parseFloat(editForm.amount),
        type: editForm.type,
        remarks: editForm.remarks,
      });
      toast.success('Settlement updated successfully!');
      setEditModal(null);
      fetchSettlements(page);
    } catch (error) {
      toast.error('Failed to update settlement: ' + error.message);
    } finally {
      setEditing(false);
    }
  };

  const keys = settlements.length > 0 ? Object.keys(settlements[0]).filter(k => k !== '_id' && k !== '__v') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab="casino-settlement" setActiveTab={handleNavigation} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Casino Settlement" subtitle="All casino settlement records" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-end mb-4">
            <button onClick={() => { setCreateModal(true); setCreateForm({ amount: '', type: currentType, remarks: '' }); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
              + Create Settlement
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            {(summary || profitLoss) && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`${profitLoss?.ggr?.label === 'Loss' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-xl p-4 text-center`}>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${profitLoss?.ggr?.label === 'Loss' ? 'text-red-600' : 'text-green-600'}`}>Profit / Loss</p>
                  <p className={`text-2xl font-bold ${profitLoss?.ggr?.label === 'Loss' ? 'text-red-700' : 'text-green-700'}`}>
                    ₹{Math.abs((profitLoss?.ggr?.total ?? 0) + (profitLoss?.ggr?.label === 'Loss' ? (summary?.settled_loss ?? 0) : -(summary?.settled_profit ?? 0))).toLocaleString()}
                  </p>
                  {profitLoss?.ggr?.label && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${profitLoss.ggr.label === 'Loss' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {profitLoss.ggr.label}
                    </span>
                  )}
                </div>
                <div className={`${profitLoss?.ggr?.label === 'Loss' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-xl p-4 text-center`}>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${profitLoss?.ggr?.label === 'Loss' ? 'text-red-600' : 'text-green-600'}`}></p>
                  <p className={`text-2xl font-bold ${profitLoss?.ggr?.label === 'Loss' ? 'text-red-700' : 'text-green-700'}`}>
                    ₹{Math.abs((profitLoss?.ggr?.total ?? 0) + (profitLoss?.ggr?.label === 'Loss' ? (summary?.settled_loss ?? 0) : -(summary?.settled_profit ?? 0))).toLocaleString()}
                  </p>
                  {profitLoss?.ggr?.label && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${profitLoss.ggr.label === 'Loss' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {profitLoss.ggr.label}
                    </span>
                  )}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Settled Profit</p>
                  <p className="text-2xl font-bold text-green-700">₹{(summary?.settled_profit ?? 0)?.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Settled Loss</p>
                  <p className="text-2xl font-bold text-red-700">₹{(summary?.settled_loss ?? 0)?.toLocaleString()}</p>
                </div>
                {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Total Win</p>
                  <p className="text-2xl font-bold text-blue-700">₹{(profitLoss?.totalWin ?? 0).toLocaleString()}</p>
                </div> */}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-3" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No settlements found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">#</th>
                      {keys.map(k => (
                        <th key={k} className="text-left px-4 py-3 font-semibold text-gray-600 border-b capitalize whitespace-nowrap">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((s, i) => (
                      <tr key={s._id || i} className="hover:bg-gray-50 border-b last:border-0">
                        <td className="px-4 py-3 text-gray-500">{((page - 1) * limit) + i + 1}</td>
                        {keys.map(k => (
                          <td key={k} className="px-4 py-3 text-gray-700">
                            {s[k] === null || s[k] === undefined ? 'N/A'
                              : typeof s[k] === 'boolean' ? (s[k] ? 'Yes' : 'No')
                              : typeof s[k] === 'object' ? JSON.stringify(s[k])
                              : String(s[k]).match(/^\d{4}-\d{2}-\d{2}T/) ? new Date(s[k]).toLocaleString('en-IN')
                              : s[k]}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setEditModal(s._id); setEditForm({ amount: s.amount || '', type: s.type || 'Loss', remarks: s.remarks || '' }); }}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Page {page} of {totalPages} {total ? `(Total: ${total})` : ''}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1 || loading} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages || loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Settlement</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                <input type="number" value={createForm.amount} onChange={(e) => setCreateForm(p => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={createForm.type} onChange={(e) => setCreateForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={currentType}>{currentType}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                <input type="text" value={createForm.remarks} onChange={(e) => setCreateForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Enter remarks" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setCreateModal(false); setCreateForm({ amount: '', type: 'Loss', remarks: '' }); }} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateSettlement} disabled={creating} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Settlement</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                <input type="number" value={editForm.amount} onChange={(e) => setEditForm(p => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={editForm.type} onChange={(e) => setEditForm(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Loss">Loss</option>
                  <option value="Profit">Profit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                <input type="text" value={editForm.remarks} onChange={(e) => setEditForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Enter remarks" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditModal(null)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleEditSettlement} disabled={editing} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {editing ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoSettlement;
