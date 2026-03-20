import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import { Calendar, RotateCcw, Users, Clock, Download } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const ActiveUsers = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  }]);

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    if (userRole === 'SA' || userRole === 'SubAdmin') {
      navigate('/suprime/super-admin', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard',
      games: '/games',
      panels: '/panels',
      'balance-logs': '/balance-logs',
      'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs',
      'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp',
      settings: '/settings',
      bonuses: '/sa-bonuses'
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  const fetchActiveUsers = async (startDate, endDate) => {
    setLoading(true);
    try {
      const payload = {
        page: 1,
        limit: 5000,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
      const response = await apiHelper.post('/user/getActiveUserLogs', payload);
      setUsers(response?.data || response || []);
    } catch (error) {
      console.error('Failed to fetch active users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers(dateRange[0].startDate, dateRange[0].endDate);
  }, []);

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const applyDateFilter = () => {
    setShowDatePicker(false);
    fetchActiveUsers(dateRange[0].startDate, dateRange[0].endDate);
  };

  const downloadExcel = () => {
    const rows = users.map((u, i) => ({
      '#': i + 1,
      Username: u.clientUserName || 'N/A',
      Phone: u.phone || 'N/A',
      'Login Time': u.loginAt ? new Date(u.loginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ActiveUsers');
    XLSX.writeFile(wb, `active-users-${dateRange[0].startDate.toISOString().split('T')[0]}-to-${dateRange[0].endDate.toISOString().split('T')[0]}.xlsx`);
  };

  const resetFilter = () => {
    const today = new Date();
    setDateRange([{ startDate: today, endDate: today, key: 'selection' }]);
    fetchActiveUsers(today, today);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="dashboard" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Active Users" subtitle="View and track active users by date range" />

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Active Users</p>
                  <p className="text-4xl font-bold">{users.length}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-full">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Date Range</p>
                  <p className="text-lg font-semibold">
                    {dateRange[0].startDate.toLocaleDateString('en-IN')} - {dateRange[0].endDate.toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-full">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Calendar size={18} />
                  <span className="font-medium">
                    {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
                      ? dateRange[0].startDate.toDateString()
                      : `${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`
                    }
                  </span>
                </button>
                {showDatePicker && (
                  <div className="absolute left-0 top-14 z-50 bg-white shadow-2xl rounded-xl border border-gray-200">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleDateRangeChange}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      months={2}
                      direction="horizontal"
                    />
                    <div className="p-4 border-t flex justify-end gap-3">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={applyDateFilter}
                        className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={resetFilter}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
              >
                <RotateCcw size={18} />
                <span className="font-medium">Reset</span>
              </button>
              <button
                onClick={downloadExcel}
                disabled={users.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                <span className="font-medium">Download Excel</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
              <p className="text-gray-600 font-medium">Loading active users...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Login Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium text-lg">No active users found</p>
                          <p className="text-gray-400 text-sm mt-1">Try adjusting your date range</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr key={user._id || index} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm text-gray-600 font-medium">{index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.clientUserName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{user.clientUserName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-700 font-medium">{user.phone || 'N/A'}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {user.loginAt ? new Date(user.loginAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              }) : 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveUsers;
