import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';

const SettingsPanel = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();
  const { user } = useAuth(true);

  useEffect(() => {
    if (user?.isAvailable !== undefined) {
      setMaintenanceMode(user.isAvailable);
    }
  }, [user]);

  const handleMaintenanceToggle = async () => {
    if (!user?._id) {
      toast.error('User not found');
      return;
    }

    setLoading(true);
    try {
      await apiHelper.patch(`/user/changeAvailableStatus/${user._id}`);
      const newMaintenanceMode = !maintenanceMode;
      setMaintenanceMode(newMaintenanceMode);
      toast.success(`System ${newMaintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update maintenance mode: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="gaming-card p-6">
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" style={{width: '32px', height: '32px'}}></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gaming-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" style={{color: '#1477b0'}} />
          System Settings
        </h3>
        <p className="text-gray-600 text-sm mt-1">Configure system maintenance mode</p>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div>
          <label className="text-lg font-medium text-gray-900">Maintenance Mode</label>
          <p className="text-sm text-gray-500 mt-1">
            {maintenanceMode ? 'System is available for users' : 'System is in maintenance mode'}
          </p>
        </div>
        <button 
          onClick={handleMaintenanceToggle}
          disabled={loading}
          className={`w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
            maintenanceMode ? 'bg-gray-300' : ''
          }`}
          style={!maintenanceMode ? {backgroundColor: '#1477b0'} : {}}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            maintenanceMode ? 'translate-x-1' : 'translate-x-6'
          }`} />
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;