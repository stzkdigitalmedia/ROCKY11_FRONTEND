import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, RotateCcw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from 'axios';

const TodayWithdrawalRequests = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToastContext();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const handleLogout = async () => {
    try {
      await apiHelper.get('/auth/logout');
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      navigate('/login', { replace: true });
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
      case 'panels':
        navigate('/panels');
        break;
      case 'tier-management':
        navigate('/tier-management');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const fetchData = async (page = 1, startDate, endDate) => {
    setLoading(true);
    try {
      const start = startDate || dateRange[0].startDate;
      const end = endDate || dateRange[0].endDate;
      
      // Format date as DD-MM-YYYY
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };
      
      const payload = {
        startDate: formatDate(start),
        endDate: formatDate(end),
        page: page.toString(),
        limit: "50",
        platefrom: "GHI_PAY"
      };
      
      const response = await axios.post('https://www.powerdreams.co/api/online/request/getTodayPowerPay_Withdraw_UserDetails', payload);
      setData(response?.data?.users || []);
      setTotalPages(response?.data?.pagination?.totalPages || 1);
      setCurrentPage(response?.data?.pagination?.currentPage || page);
    } catch (error) {
      toast.error('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const applyDateFilter = () => {
    fetchData(1, dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  const resetFilter = () => {
    const today = new Date();
    setDateRange([{
      startDate: today,
      endDate: today,
      key: 'selection'
    }]);
    setSearchTerm('');
    setCurrentPage(1);
    fetchData(1, today, today);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    item?.clientUserName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="" setActiveTab={handleNavigation} onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          title="Today Withdrawal Requests"
          subtitle="Users with withdrawal requests today"
        />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Calendar size={16} />
                  {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString() 
                    ? dateRange[0].startDate.toDateString()
                    : `${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`
                  }
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-lg border">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleDateRangeChange}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      months={2}
                      direction="horizontal"
                    />
                    <div className="p-3 border-t flex justify-end gap-2">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={applyDateFilter}
                        className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={resetFilter}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          <div className="gaming-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-red-600">
                Today Withdrawal Requests
              </h2>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                {filteredData.length} requests
              </span>
              <div className="ml-auto">
                <input
                  type="text"
                  placeholder="Search by client name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{width: '32px', height: '32px'}}></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No requests found</p>
                <p className="text-sm">No withdrawal requests for the selected date range</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Username</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Requests</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{(currentPage - 1) * 50 + index + 1}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm font-medium text-gray-900">{item?.clientUserName || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{item?.totalRequests || 0}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-red-600 font-medium">₹{item?.amount || 0}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchData(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => fetchData(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayWithdrawalRequests;