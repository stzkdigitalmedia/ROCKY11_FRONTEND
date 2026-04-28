import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import SettingsPanel from '../components/SettingsPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { Edit, X } from 'lucide-react';

const Settings = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [systemSettings, setSystemSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ demoAnnouncement: '', userAnnouncement: '', isActive: true, bannerImageUrl: null, bannerVideoUrl: null });
  const [announcementUpdateLoading, setAnnouncementUpdateLoading] = useState(false);
  const [isBanner, setIsBanner] = useState(false);
  const [bannerToggleLoading, setBannerToggleLoading] = useState(false);
  const [isShowVideo, setIsShowVideo] = useState(false);
  const [videoToggleLoading, setVideoToggleLoading] = useState(false);
  const toast = useToastContext();

  const fetchAnnouncement = async () => {
    setAnnouncementLoading(true);
    try {
      const response = await apiHelper.get('/announcement/getAnnouncement');
      const data = response?.data || response;
      setAnnouncement(data);
      setIsBanner(data?.isBanner ?? false);
      setIsShowVideo(data?.isShowVideo ?? false);
    } catch (error) {
      toast.error('Failed to fetch announcement');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const openEditAnnouncementModal = () => {
    setAnnouncementForm({
      demoAnnouncement: announcement?.demoAnnouncement || '',
      userAnnouncement: announcement?.userAnnouncement || '',
      isActive: announcement?.isActive ?? true,
      bannerImageUrl: null,
      bannerVideoUrl: null,
    });
    setShowEditAnnouncementModal(true);
  };

  const updateAnnouncement = async () => {
    setAnnouncementUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append('demoAnnouncement', announcementForm.demoAnnouncement);
      formData.append('userAnnouncement', announcementForm.userAnnouncement);
      formData.append('isActive', announcementForm.isActive);
      if (announcementForm.bannerImageUrl) {
        formData.append('bannerImageUrl', announcementForm.bannerImageUrl);
      }
      if (announcementForm.bannerVideoUrl) {
        formData.append('bannerVideo', announcementForm.bannerVideoUrl);
      }
      await apiHelper.putFormData('/announcement/updateAnnouncement', formData);
      toast.success('Announcement updated successfully!');
      setShowEditAnnouncementModal(false);
      fetchAnnouncement();
    } catch (error) {
      toast.error('Failed to update announcement');
    } finally {
      setAnnouncementUpdateLoading(false);
    }
  };

  const toggleBanner = async (val) => {
    setBannerToggleLoading(true);
    try {
      const formData = new FormData();
      formData.append('isBanner', val);
      await apiHelper.putFormData('/announcement/updateAnnouncement', formData);
      setIsBanner(val);
      toast.success('Banner updated!');
    } catch (error) {
      toast.error('Failed to update banner');
    } finally {
      setBannerToggleLoading(false);
    }
  };

  const toggleShowVideo = async (val) => {
    setVideoToggleLoading(true);
    try {
      const formData = new FormData();
      formData.append('isShowVideo', val);
      await apiHelper.putFormData('/announcement/updateAnnouncement', formData);
      setIsShowVideo(val);
      toast.success('Video visibility updated!');
    } catch (error) {
      toast.error('Failed to update video visibility');
    } finally {
      setVideoToggleLoading(false);
    }
  };

  const fetchTiers = async () => {
    try {
      const response = await apiHelper.get('/tier/getAll_Active_Tiers_WithoutPagination');
      const tiersData = response?.data?.tiers || [];
      setTiers(tiersData);
    } catch (error) {
      toast.error('Failed to fetch tiers');
    }
  };

  const openEditModal = (setting) => {
    setEditingSetting(setting);
    setSelectedTierId(setting.teirId);
    setShowEditModal(true);
    fetchTiers();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSetting(null);
    setSelectedTierId('');
  };

  const updateSystemSetting = async () => {
    if (!selectedTierId || !editingSetting) {
      toast.error('Please select a tier');
      return;
    }

    setUpdateLoading(true);
    try {
      const payload = {
        teirId: selectedTierId,
        isActive: true
      };
      await apiHelper.put(`/systemSetting/updateSystemSetting/${editingSetting._id}`, payload);
      toast.success('System setting updated successfully!');
      closeEditModal();
      fetchSystemSettings();
    } catch (error) {
      toast.error('Failed to update system setting');
    } finally {
      setUpdateLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/systemSetting/getSystemSetting');
      const settingsData = response?.data;
      setSystemSettings(settingsData ? [settingsData] : []);
      console.log(settingsData)
    } catch (error) {
      toast.error('Failed to fetch system settings');
      setSystemSettings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemSettings();
    fetchAnnouncement();
  }, []);

  const handleLogout = async () => {
    try {
      const userRole = localStorage.getItem('userRole') || user?.role;
      await apiHelper.get('/auth/logout');
      logout();
      if (userRole === 'SA' || userRole === 'SubAdmin') {
        navigate('/suprime/super-admin', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      const userRole = localStorage.getItem('userRole') || user?.role;
      logout();
      if (userRole === 'SA' || userRole === 'SubAdmin') {
        navigate('/suprime/super-admin', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  };

  const handleNavigation = (tab) => {
    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'overview':
        navigate('/overview');
        break;
      case 'games':
        navigate('/games');
        break;
      case 'allinreq':
        navigate('/allinreq');
        break;
      case 'quickpayreq':
        navigate('/quickpayreq');
        break;
      case 'panels':
        navigate('/panels');
        break;
      case 'balance-logs':
        navigate('/balance-logs');
        break;
      case 'transaction-history':
        navigate('/transaction-history');
        break;
      case 'transaction-logs':
        navigate('/transaction-logs');
        break;
      case 'tier-management':
        navigate('/tier-management');
        break;
      case 'system-setting':
        navigate('/system-setting');
        break;
      case 'telegram-otp':
        navigate('/telegram-otp');
        break;
      case 'bonuses':
        navigate('/sa-bonuses');
        break;
      case 'referral':
        navigate('/referral');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab="settings" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="System Settings"
          subtitle="Configure system settings and preferences"
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <SettingsPanel />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcement</h3>
              {announcementLoading ? (
                <div className="text-center py-4">
                  <div className="loading-spinner mx-auto mb-2" style={{ width: '24px', height: '24px' }}></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              ) : announcement ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Demo Announcement</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">User Announcement</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Popup Image</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Popup Video</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Action</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Image</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Video</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{announcement.demoAnnouncement || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-900">{announcement.userAnnouncement || 'N/A'}</td>
                        <td className="px-4 py-3">
                          {announcement.bannerImage ? (
                            <img src={announcement.bannerImage} alt="Banner" className="h-16 rounded-lg object-cover" />
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {announcement.bannerVideo ? (
                            <video src={announcement.bannerVideo} autoPlay
                              muted
                              loop
                              playsInline alt="Banner" className="h-16 rounded-lg object-cover">
                            </video>
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {announcement.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={openEditAnnouncementModal}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Announcement"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isBanner}
                              onChange={(e) => toggleBanner(e.target.checked)}
                              disabled={bannerToggleLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isShowVideo}
                              onChange={(e) => toggleShowVideo(e.target.checked)}
                              disabled={videoToggleLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No announcement found.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tier System Settings</h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : systemSettings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No system settings found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {systemSettings.map((setting, index) => (
                    <div key={setting._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Tier ID: {setting.teirId}</h4>
                          <p className="text-sm text-gray-500">{new Date(setting.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(setting)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Setting"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {setting.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {showEditAnnouncementModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Announcement</h3>
              <button onClick={() => setShowEditAnnouncementModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demo Announcement</label>
                <input
                  type="text"
                  value={announcementForm.demoAnnouncement}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, demoAnnouncement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Announcement</label>
                <input
                  type="text"
                  value={announcementForm.userAnnouncement}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, userAnnouncement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, bannerImageUrl: e.target.files[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {announcement?.bannerImage && !announcementForm.bannerImageUrl && (
                  <img src={announcement.bannerImage} alt="Current Banner" className="mt-2 h-16 rounded-lg object-cover" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, bannerVideoUrl: e.target.files[0] || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {announcement?.bannerVideo && !announcementForm.bannerVideoUrl && (
                  <video src={announcement.bannerVideo} className="mt-2 h-16 rounded-lg object-cover" muted />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={announcementForm.isActive}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditAnnouncementModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateAnnouncement}
                  disabled={announcementUpdateLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {announcementUpdateLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit System Setting</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tier
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a tier...</option>
                  {tiers.map((tier) => (
                    <option key={tier._id} value={tier._id}>
                      {tier.teirName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSystemSetting}
                  disabled={updateLoading || !selectedTierId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;