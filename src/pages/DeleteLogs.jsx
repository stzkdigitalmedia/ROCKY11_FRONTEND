import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { Search, Calendar, RotateCcw, ArrowLeft } from 'lucide-react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DeleteLogs = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToastContext();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      case 'games':
        navigate('/games');
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

  const fetchDeleteLogs = async (page = 1, clientName = '', startDate = null, endDate = null) => {
    setLoading(true);
    try {
      const start = startDate || new Date();
      const end = endDate || new Date();
      
      const payload = {
        page,
        limit: 10,
        clientName,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      };

      const response = await apiHelper.post('/deletelog/getDeleteLogs', payload);
      
      setLogs(response?.data || []);
      setTotalPages(response?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to fetch delete logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDeleteLogs(1, searchTerm, dateRange[0].startDate, dateRange[0].endDate);
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const applyDateFilter = () => {
    setCurrentPage(1);
    fetchDeleteLogs(1, searchTerm, dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  const resetFilters = () => {
    const today = new Date();
    setDateRange([{
      startDate: today,
      endDate: today,
      key: 'selection'
    }]);
    setSearchTerm('');
    setCurrentPage(1);
    fetchDeleteLogs(1, '', today, today);
  };

  const handlePageChange = (page) => {
    fetchDeleteLogs(page, searchTerm, dateRange[0].startDate, dateRange[0].endDate);
  };

  useEffect(() => {
    fetchDeleteLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="" setActiveTab={handleNavigation} onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          title="Delete Logs"
          subtitle="View deleted account logs"
        />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            
            {/* Filters */}
            <div className="gaming-card p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Client Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter client name..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
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
                    <div className="absolute right-0 top-16 z-50 bg-white shadow-lg rounded-lg border">
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="gaming-card p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading delete logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No delete logs found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr key={log._id || index} className="table-row border-b border-gray-100">
                          <td className="py-4 px-4">
                            <p className="text-sm font-medium text-gray-900">{((currentPage - 1) * 10) + index + 1}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{log.clientName || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{log.action || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN', { hour12: true }) : 'N/A'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm bg-gray-100 rounded-lg">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default DeleteLogs;