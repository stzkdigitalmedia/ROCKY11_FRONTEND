import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { useToastContext } from '../App';
import { Plus, Trash2, Save } from 'lucide-react';

const ReferralEarning = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [days, setDays] = useState([
    { dayNumber: 1, maxAmount: 0, percentage: 0, isActive: true },
  ]);

  const fetchCriteria = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/referralEarning/criteria');
      const data = response?.data?.days || response?.days || response?.data || [];
      if (Array.isArray(data) && data.length > 0) setDays(data);
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch criteria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const handleDayChange = (index, field, value) => {
    const updated = [...days];
    updated[index][field] = field === 'isActive' ? value : field === 'dayNumber' ? Number(value) : Number(value);
    setDays(updated);
  };

  const addDay = () => {
    setDays([...days, { dayNumber: days.length + 1, maxAmount: 0, percentage: 0, isActive: true }]);
  };

  const removeDay = (index) => {
    if (days.length === 1) return;
    const updated = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(updated);
  };

  const saveCriteria = async () => {
    setSaveLoading(true);
    try {
      const cleanDays = days.map(({ _id, __v, ...rest }) => rest);
      const res = await apiHelper.post('/referralEarning/criteria', { days: cleanDays });
      toast.success(res?.message || 'Criteria saved successfully!');
      fetchCriteria();
    } catch (error) {
      toast.error(error?.message || 'Failed to save criteria');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    navigate(userRole === 'SA' || userRole === 'SubAdmin' ? '/suprime/super-admin' : '/login', { replace: true });
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard', overview: '/overview', games: '/games',
      allinreq: '/allinreq', quickpayreq: '/quickpayreq', panels: '/panels',
      'balance-logs': '/balance-logs', 'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs', 'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp', bonuses: '/sa-bonuses', referral: '/referral',
      settings: '/settings', 'referral-earning': '/referral-earning',
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="referral-earning" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Refer & Earn" subtitle="Configure referral earning criteria per day" />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Day-wise Earning Criteria</h3>
              <div className="flex gap-3">
                <button
                  onClick={addDay}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> Add Day
                </button>
                <button
                  onClick={saveCriteria}
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                  ) : (
                    <><Save size={16} /> Save Criteria</>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '36px', height: '36px' }}></div>
                <p className="text-gray-600">Loading criteria...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Day</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Max Amount (₹)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Percentage (%)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                            {day.dayNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={day.maxAmount}
                            onChange={(e) => handleDayChange(index, 'maxAmount', e.target.value)}
                            className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onWheel={(e) => e.target.blur()}
                            min={0}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={day.percentage}
                            onChange={(e) => handleDayChange(index, 'percentage', e.target.value)}
                            className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onWheel={(e) => e.target.blur()}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.isActive}
                              onChange={(e) => handleDayChange(index, 'isActive', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className={`ml-2 text-xs font-medium ${day.isActive ? 'text-green-600' : 'text-red-500'}`}>
                              {day.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeDay(index)}
                            disabled={days.length === 1}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
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
    </div>
  );
};

export default ReferralEarning;
