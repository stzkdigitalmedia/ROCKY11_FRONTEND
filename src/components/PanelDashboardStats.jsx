import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const PanelDashboardStats = ({ dateRange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].startDate.toISOString().split('T')[0];
      const endDate = dateRange[0].endDate.toISOString().split('T')[0];

      const response = await apiHelper.get(`/transaction/getPanel_Dash_Summary?startDate=${startDate}&endDate=${endDate}`);
      setStats(response?.data || response);
    } catch (error) {
      toast.error('Failed to fetch stats: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Stats Display */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : stats ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">DASHBOARD SUMMARY</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.transactionsDetails && Object.entries(stats.transactionsDetails).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-xl font-bold text-gray-900">{value || 0}</p>
              </div>
            ))}
            {stats.sub_userRegistrationsCount !== undefined && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">User Registrations</p>
                <p className="text-xl font-bold text-gray-900">{stats.sub_userRegistrationsCount || 0}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No data available</div>
      )}
    </div>
  );
};

export default PanelDashboardStats;
