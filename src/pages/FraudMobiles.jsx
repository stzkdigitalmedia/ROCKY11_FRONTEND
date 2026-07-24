import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '../hooks/useAuth';
import { Smartphone, Search, Filter, RefreshCw, Plus, X, Pencil, Trash2 } from 'lucide-react';

const initialFilters = {
  search: '',
  status: 'all',
  page: 1,
  limit: 20,
};

const FraudMobiles = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    mobileNumber: '',
    remark: '',
    isActive: true,
  });

  const fetchFraudMobiles = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
      });

      if (filters.search.trim()) {
        params.set('search', filters.search.trim());
      }

      if (filters.status !== 'all') {
        params.set('isActive', filters.status === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/fraudMobile/getAllFraudMobiles?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load fraud mobiles');
      }

      const list = data?.data || data?.results || data?.items || data?.fraudMobiles || [];
      const pageInfo = data?.pagination || data?.meta || data?.pageInfo || null;

      setMobiles(Array.isArray(list) ? list : []);
      setPagination(pageInfo);
    } catch (err) {
      console.error('Failed to fetch fraud mobiles', err);
      setError(err?.message || 'Failed to load fraud mobiles');
      setMobiles([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudMobiles();
  }, [filters.page, filters.limit, filters.status]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchFraudMobiles();
  };

  const openCreateModal = () => {
    setSubmitError('');
    setForm({ mobileNumber: '', remark: '', isActive: true });
    setShowCreateModal(true);
  };

  const handleCreateFraudMobile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        mobileNumber: form.mobileNumber.trim(),
        remark: form.remark.trim(),
        isActive: form.isActive,
      };

      if (!payload.mobileNumber) {
        throw new Error('Mobile number is required');
      }

      if (!/^\d{10}$/.test(payload.mobileNumber)) {
        throw new Error('Mobile number must be 10 digits');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/fraudMobile/addFraudMobile`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to add fraud mobile');
      }

      setShowCreateModal(false);
      setForm({ mobileNumber: '', remark: '', isActive: true });
      fetchFraudMobiles();
    } catch (err) {
      console.error('Failed to create fraud mobile', err);
      setSubmitError(err?.message || 'Failed to add fraud mobile');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setSubmitError('');
    setForm({
      mobileNumber: item?.mobileNumber || '',
      remark: item?.remark || '',
      isActive: item?.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleUpdateFraudMobile = async (e) => {
    e.preventDefault();
    if (!selectedItem?._id) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        mobileNumber: form.mobileNumber.trim(),
        remark: form.remark.trim(),
        isActive: form.isActive,
      };

      if (!payload.mobileNumber) {
        throw new Error('Mobile number is required');
      }

      if (!/^\d{10}$/.test(payload.mobileNumber)) {
        throw new Error('Mobile number must be 10 digits');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/fraudMobile/updateFraudMobile/${selectedItem._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update fraud mobile');
      }

      setShowEditModal(false);
      setSelectedItem(null);
      setForm({ mobileNumber: '', remark: '', isActive: true });
      fetchFraudMobiles();
    } catch (err) {
      console.error('Failed to update fraud mobile', err);
      setSubmitError(err?.message || 'Failed to update fraud mobile');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteFraudMobile = async () => {
    if (!selectedItem?._id) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/fraudMobile/deleteFraudMobile/${selectedItem._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete fraud mobile');
      }

      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchFraudMobiles();
    } catch (err) {
      console.error('Failed to delete fraud mobile', err);
      setSubmitError(err?.message || 'Failed to delete fraud mobile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const itemId = item?._id || item?.id;
    if (!itemId) return;

    const nextValue = !(item.isActive === true || item.status === 'active');
    setTogglingId(itemId);
    setSubmitError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/fraudMobile/toggleActiveStatus/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: nextValue }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update status');
      }

      setMobiles((prev) => prev.map((entry) => {
        const entryId = entry?._id || entry?.id;
        return entryId === itemId ? { ...entry, isActive: nextValue } : entry;
      }));
    } catch (err) {
      console.error('Failed to toggle fraud mobile status', err);
      setSubmitError(err?.message || 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors and proceed
    }
    logout();
    navigate('/suprime/super-admin', { replace: true });
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard',
      overview: '/overview',
      games: '/games',
      allinreq: '/allinreq',
      quickpayreq: '/quickpayreq',
      panels: '/panels',
      'balance-logs': '/balance-logs',
      'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs',
      'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp',
      bonuses: '/sa-bonuses',
      referral: '/referral',
      notifications: '/notifications',
      'fraud-mobiles': '/fraud-mobiles',
    };

    if (routes[tab]) navigate(routes[tab]);
  };

  const totalPages = pagination?.pages || pagination?.totalPages || 1;
  const totalItems = pagination?.total || pagination?.count || mobiles.length;

  const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab="fraud-mobiles" setActiveTab={handleNavigation} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Fraud Mobiles" subtitle="Manage and filter fraud mobile records" />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Fraud Mobile Records</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Mark Fraud
                </button>

                <form onSubmit={handleSubmitSearch} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={filters.search}
                    onChange={handleSearch}
                    placeholder="Search mobile or details"
                    className="bg-transparent outline-none text-sm w-full sm:w-56"
                  />
                </form>

                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className="bg-transparent outline-none text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setFilters(initialFilters);
                    setTimeout(() => fetchFraudMobiles(), 0);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-sm text-gray-600">
              <p>Showing {mobiles.length} records</p>
              {totalItems > 0 && <p>Total items: {totalItems}</p>}
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="loading-spinner mx-auto mb-3" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-500 text-sm">Loading fraud mobiles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-600">{error}</div>
            ) : mobiles.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No fraud mobile records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Mobile Number</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Remark</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Created By</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Added On</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mobiles.map((item, index) => {
                      const itemId = item?._id || item?.id;
                      const mobileValue = item.mobileNumber || item.mobile || item.phone || item.phoneNumber || item.number || '-';
                      const remarkValue = item.remark || item.details || item.reason || item.note || item.description || '-';
                      const createdByValue = item.createdBy || item.createdByName || item.userName || item.fullName || '-';
                      const isActive = item.isActive === true || item.status === 'active';
                      const statusValue = isActive ? 'Active' : 'Inactive';
                      const createdAt = formatDateTime(item.timestamp || item.createdAt || item.updatedAt || item.created_on || item.date);

                      return (
                        <tr key={itemId || index} className="hover:bg-gray-50 border-b last:border-0">
                          <td className="px-4 py-3 text-gray-500">{(filters.page - 1) * filters.limit + index + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{mobileValue}</td>
                          <td className="px-4 py-3 text-gray-700 max-w-xs">{remarkValue}</td>
                          <td className="px-4 py-3 text-gray-700">{createdByValue}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item)}
                                disabled={togglingId === itemId}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300'} ${togglingId === itemId ? 'opacity-70' : ''}`}
                                aria-pressed={isActive}
                                title={statusValue}
                              >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                              </button>
                              <span className={`text-xs font-semibold ${isActive ? 'text-green-700' : 'text-red-700'}`}>{statusValue}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{createdAt}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteModal(item)}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                <p className="text-sm text-gray-600">Page {filters.page} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={filters.page === 1}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= totalPages}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mark Fraud Mobile</h3>
                <p className="text-sm text-gray-500">Add a new fraud mobile entry</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFraudMobile} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  value={form.mobileNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  placeholder="e.g. 9123848162"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Remark</label>
                <textarea
                  rows="3"
                  value={form.remark}
                  onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
                  placeholder="Fraud User"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active by default
              </label>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Fraud Mobile</h3>
                <p className="text-sm text-gray-500">Update an existing fraud mobile entry</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                  setSubmitError('');
                }}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateFraudMobile} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  value={form.mobileNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  placeholder="e.g. 9123848162"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Remark</label>
                <textarea
                  rows="3"
                  value={form.remark}
                  onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
                  placeholder="Fraud User"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    setSubmitError('');
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-5">
            <h3 className="text-lg font-semibold text-gray-900">Delete Fraud Mobile</h3>
            <p className="mt-2 text-sm text-gray-600">
              Kya aap is fraud mobile record ko delete karna chahte hain? Is action ko wapas nahi kiya ja sakta.
            </p>
            {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                  setSubmitError('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFraudMobile}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudMobiles;
