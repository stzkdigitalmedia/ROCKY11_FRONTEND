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
  const toast = useToastContext();

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
      case 'games':
        navigate('/games');
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