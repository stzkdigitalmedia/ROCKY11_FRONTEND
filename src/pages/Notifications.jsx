import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { Bell, Pencil, Upload, X } from 'lucide-react';

const Notifications = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', body: '', imageUrl: null, logoUrl: null, actionUrl: '', isActive: 'true' });
  const [previews, setPreviews] = useState({ imageUrl: '', logoUrl: '' });
  const [saving, setSaving] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/notification/getNotificationContents');
      const data = response?.data;
      setNotifications(data ? (Array.isArray(data) ? data : [data]) : []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    try {
      await apiHelper.get('/auth/logout');
      logout();
      navigate('/suprime/super-admin', { replace: true });
    } catch {
      logout();
      navigate('/suprime/super-admin', { replace: true });
    }
  };

  const openEdit = (n) => {
    setEditForm({ title: n.title || '', body: n.body || '', imageUrl: null, logoUrl: null, actionUrl: n.actionUrl || '', isActive: n.isActive ? 'true' : 'false' });
    setPreviews({ imageUrl: n.imageUrl || '', logoUrl: n.logoUrl || '' });
    setEditModal(n._id);
  };

  const handleFileChange = (field, file) => {
    setEditForm(p => ({ ...p, [field]: file }));
    setPreviews(p => ({ ...p, [field]: file ? URL.createObjectURL(file) : p[field] }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('body', editForm.body);
      fd.append('actionUrl', editForm.actionUrl);
      fd.append('isActive', editForm.isActive);
      if (editForm.imageUrl) fd.append('imageUrl', editForm.imageUrl);
      if (editForm.logoUrl) fd.append('logoUrl', editForm.logoUrl);
      await apiHelper.putFormData(`/notification/updateNotificationContent/${editModal}`, fd);
      toast.success('Notification updated');
      setEditModal(null);
      fetchNotifications();
    } catch {
      toast.error('Failed to update notification');
    } finally {
      setSaving(false);
    }
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard', overview: '/overview', games: '/games',
      allinreq: '/allinreq', quickpayreq: '/quickpayreq', panels: '/panels',
      'balance-logs': '/balance-logs', 'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs', 'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp', bonuses: '/sa-bonuses',
      referral: '/referral', notifications: '/notifications',
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab="notifications" setActiveTab={handleNavigation} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Notifications" subtitle="All notification contents" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notification Contents</h3>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="loading-spinner mx-auto mb-3" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No notifications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Title</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Body</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Image</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Logo</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Action URL</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((n, index) => (
                      <tr key={n._id || index} className="hover:bg-gray-50 border-b last:border-0">
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{n.title || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{n.body || 'N/A'}</td>
                        <td className="px-4 py-3">
                          {n.imageUrl ? (
                            <img src={n.imageUrl} alt="img" className="h-10 w-10 rounded object-cover" />
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {n.logoUrl ? (
                            <img src={n.logoUrl} alt="logo" className="h-10 w-10 rounded-full object-cover" />
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {n.actionUrl ? (
                            <a href={n.actionUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs truncate block max-w-[120px]">{n.actionUrl}</a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${n.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {n.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openEdit(n)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Notification</h3>
            <div className="space-y-3">
              {['title', 'body', 'actionUrl'].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
                  {field === 'body' ? (
                    <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm[field]} onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))} />
                  ) : (
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm[field]} onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))} />
                  )}
                </div>
              ))}
              {[{ field: 'imageUrl', label: 'Banner Image', shape: 'rounded' }, { field: 'logoUrl', label: 'Logo', shape: 'rounded-full' }].map(({ field, label, shape }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs text-gray-500 hover:text-blue-600">
                      <Upload className="w-4 h-4" />
                      <span>{editForm[field] ? editForm[field].name : 'Choose file'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(field, e.target.files[0])} />
                    </label>
                    {previews[field] ? (
                      <div className="relative">
                        <img src={previews[field]} alt={label} className={`h-12 w-12 object-cover border border-gray-200 ${shape}`} />
                        <button type="button" onClick={() => { setEditForm(p => ({ ...p, [field]: null })); setPreviews(p => ({ ...p, [field]: '' })); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className={`h-12 w-12 bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center ${shape}`}>
                        <Upload className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm.isActive} onChange={(e) => setEditForm(p => ({ ...p, isActive: e.target.value }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdate} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
