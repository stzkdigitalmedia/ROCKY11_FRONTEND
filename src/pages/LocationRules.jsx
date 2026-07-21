import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { apiHelper } from '../utils/apiHelper';
import { MapPin, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useToastContext } from '../App';

const CreateRuleModal = ({ onClose, onSuccess }) => {
  const toast = useToastContext();
  const [form, setForm] = useState({ latitude: '', longitude: '', radiusKm: '', isActive: true, userId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await apiHelper.get('/user/getCompulsaryLocation_user');
        setUsers(res?.data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    (u.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  );

  const handleUserSelect = (u) => {
    setSearch(`${u.clientName} — ${u.phone}`);
    setDropdownOpen(false);
    setForm(f => ({
      ...f,
      userId: u._id,
      latitude: u.latitude != null ? String(u.latitude) : f.latitude,
      longitude: u.longitude != null ? String(u.longitude) : f.longitude,
    }));
  };

  const handleNumericInput = (field, value) => {
    if (/^-?\d*\.?\d*$/.test(value)) setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiHelper.post('/location-rules/createLocationRule', {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radiusKm: Number(form.radiusKm),
        isActive: form.isActive,
        ...(form.userId && { userId: form.userId }),
      });
      toast.success('Location rule created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create location rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Create Location Rule</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              placeholder={usersLoading ? 'Loading users...' : 'Search by name or phone...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); setForm(f => ({ ...f, userId: '' })); }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoComplete="off"
            />
            {dropdownOpen && filteredUsers.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <li
                    key={u._id}
                    onMouseDown={() => handleUserSelect(u)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                  >
                    {u.clientName} — {u.phone}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="text" inputMode="decimal" value={form.latitude} onChange={(e) => handleNumericInput('latitude', e.target.value)}
              placeholder="e.g. 24.4750" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="text" inputMode="decimal" value={form.longitude} onChange={(e) => handleNumericInput('longitude', e.target.value)}
              placeholder="e.g. 74.8750" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
            <input type="number" step="any" value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
              placeholder="e.g. 3" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Is Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditRuleModal = ({ rule, onClose, onSuccess }) => {
  const toast = useToastContext();
  const [form, setForm] = useState({
    latitude: String(rule.latitude),
    longitude: String(rule.longitude),
    radiusKm: String(rule.radiusKm),
    isActive: rule.isActive,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleNumericInput = (field, value) => {
    if (/^-?\d*\.?\d*$/.test(value)) setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiHelper.patch(`/location-rules/updateLocationRule/${rule._id}`, {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radiusKm: Number(form.radiusKm),
        isActive: form.isActive,
      });
      toast.success('Location rule updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update location rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Edit Location Rule</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors"><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="text" inputMode="decimal" value={form.latitude} onChange={(e) => handleNumericInput('latitude', e.target.value)}
              placeholder="e.g. 24.4750" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="text" inputMode="decimal" value={form.longitude} onChange={(e) => handleNumericInput('longitude', e.target.value)}
              placeholder="e.g. 74.8750" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
            <input type="number" step="any" value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
              placeholder="e.g. 3" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="editIsActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">Is Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ rule, onClose, onSuccess }) => {
  const toast = useToastContext();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiHelper.delete(`/location-rules/deleteLocationRule/${rule._id}`);
      toast.success('Location rule deleted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete location rule');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Delete Location Rule</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors"><X size={22} /></button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-1">Are you sure you want to delete this rule?</p>
          <p className="text-gray-800 text-sm font-medium">Lat: {rule.latitude}, Lng: {rule.longitude}, Radius: {rule.radiusKm} km</p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LocationRules = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [deleteRule, setDeleteRule] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const limit = 10;

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    navigate(userRole === 'SA' || userRole === 'SubAdmin' ? '/suprime/super-admin' : '/login', { replace: true });
  };

  const handleToggle = async (rule) => {
    setTogglingId(rule._id);
    try {
      await apiHelper.patch(`/location-rules/toggleLocationRuleStatus/${rule._id}`);
      setRules(prev => prev.map(r => r._id === rule._id ? { ...r, isActive: !r.isActive } : r));
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const fetchRules = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiHelper.get(`/location-rules/getAllLocationRules?page=${currentPage}&limit=${limit}`);
      setRules(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch location rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules(page);
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="location-rules" setActiveTab={(tab) => navigate(`/${tab}`)} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Location Rules" subtitle="Manage location-based rules" />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus size={16} />
              Create Rule
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
              <p className="text-gray-600">Loading location rules...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No location rules found</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-auto min-w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">#</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Latitude</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Longitude</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Radius (km)</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Is Active</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Created At</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule, index) => (
                      <tr key={rule._id || index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-6 text-sm">{(page - 1) * limit + index + 1}</td>
                        <td className="py-3 px-6 text-sm font-medium">{rule.latitude ?? 'N/A'}</td>
                        <td className="py-3 px-6 text-sm">{rule.longitude ?? 'N/A'}</td>
                        <td className="py-3 px-6 text-sm">{rule.radiusKm ?? 'N/A'}</td>
                        <td className="py-3 px-6 text-sm">
                          <button
                            onClick={() => handleToggle(rule)}
                            disabled={togglingId === rule._id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                              rule.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                              rule.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-600">
                          {rule.createdAt ? new Date(rule.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </td>
                        <td className="py-3 px-6 text-sm">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditRule(rule)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                              <Pencil size={13} /> Edit
                            </button>
                            <button onClick={() => setDeleteRule(rule)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50">Prev</button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showCreateModal && (
        <CreateRuleModal onClose={() => setShowCreateModal(false)} onSuccess={() => fetchRules(page)} />
      )}
      {editRule && (
        <EditRuleModal rule={editRule} onClose={() => setEditRule(null)} onSuccess={() => fetchRules(page)} />
      )}
      {deleteRule && (
        <DeleteConfirmModal rule={deleteRule} onClose={() => setDeleteRule(null)} onSuccess={() => fetchRules(page)} />
      )}
    </div>
  );
};

export default LocationRules;
