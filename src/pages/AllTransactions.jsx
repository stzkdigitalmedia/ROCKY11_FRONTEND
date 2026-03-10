import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { ArrowLeft, Calendar, RotateCcw, History, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const AllTransactions = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const toast = useToastContext();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalTransactions, setHistoryTotalTransactions] = useState(0);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

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
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const fetchAllTransactions = async (startDate, endDate) => {
    setLoading(true);
    try {
      const start = startDate || new Date();
      const end = endDate || new Date();
      
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      
      const response = await apiHelper.get(`/transaction/get_All_Deposit_Withdraw_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`);
      const transactionData = response?.users || response?.data || response;

      setTransactions(Array.isArray(transactionData) ? transactionData : []);
    } catch (error) {
      toast.error('Failed to fetch all transactions: ' + error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
    fetchAllTransactions(ranges.selection.startDate, ranges.selection.endDate);
    setShowDatePicker(false);
  };

  const resetFilter = () => {
    const today = new Date();
    setDateRange([{
      startDate: today,
      endDate: today,
      key: 'selection'
    }]);
    fetchAllTransactions(today, today);
  };

  const fetchUserHistory = async (userId, page = 1) => {
    setHistoryLoading(true);
    try {
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;
      
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      
      const response = await apiHelper.get(`/transaction/getUserTransactions/${userId}?page=${page}&limit=10&startDate=${startUTC}&endDate=${endUTC}`);
      const historyData = response?.data?.transactions || response?.transactions || [];
      const pagination = response?.data?.pagination || {};
      
      setUserHistory(Array.isArray(historyData) ? historyData : []);
      setHistoryCurrentPage(Number(pagination.currentPage) || page);
      setHistoryTotalPages(Number(pagination.totalPages) || 1);
      setHistoryTotalTransactions(Number(pagination.totalTransactions) || historyData.length);
    } catch (error) {
      toast.error('Failed to fetch user history: ' + error.message);
      setUserHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryClick = (user) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
    document.body.style.overflow = 'hidden';
    fetchUserHistory(user.userId);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setHistoryCurrentPage(1);
    setHistoryTotalPages(1);
    setHistoryTotalTransactions(0);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="" setActiveTab={handleNavigation} onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          title="All Transactions"
          subtitle="All deposit and withdrawal transactions"
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
              <h2 className="text-xl font-semibold text-gray-900">
                All Transactions
              </h2>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                {transactions.length} users
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{width: '32px', height: '32px'}}></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No transactions found</p>
                <p className="text-sm">No transactions for the selected date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction?.id || transaction?._id || index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{index + 1}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {(transaction?.clientName || transaction?.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction?.clientName || transaction?.fullName}</p>
                              <p className="text-sm text-gray-500">{transaction?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{transaction?.transactionAmount || 0}
                          </p>
                          <p className="text-xs text-gray-500">{transaction?.transactionCount || 0} transactions</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.branchName || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleHistoryClick(transaction)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                          >
                            <History size={14} />
                            History
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50" onClick={closeHistoryModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction History - {selectedUser?.clientName}
              </h3>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4" style={{width: '32px', height: '32px'}}></div>
                  <p className="text-gray-600">Loading history...</p>
                </div>
              ) : userHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No transactions found</p>
                  <p className="text-sm">No transaction history for the selected date range</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userHistory.map((history, index) => (
                        <tr key={history?.id || history?._id || index} className="border-b border-gray-100">
                          <td className="py-4 px-4">
                            <p className="text-sm font-medium text-gray-900">{((historyCurrentPage - 1) * 10) + index + 1}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              history?.transactionType === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {history?.transactionType || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className={`text-sm font-semibold ${
                              history?.transactionType === 'Deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₹{history?.amount || 0}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              history?.status === 'Accept' ? 'bg-green-100 text-green-800' :
                              history?.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              history?.status === 'Reject' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {history?.status || 'Initial'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">
                              {history?.createdAt ? new Date(history.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing page {historyCurrentPage} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchUserHistory(selectedUser?.userId, historyCurrentPage - 1)}
                        disabled={historyCurrentPage === 1 || historyLoading}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm bg-gray-100 rounded-lg">
                        Page {historyCurrentPage}
                      </span>
                      <button
                        onClick={() => fetchUserHistory(selectedUser?.userId, historyCurrentPage + 1)}
                        disabled={historyLoading}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTransactions;