import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { ArrowLeft, Calendar, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from 'axios';

const WithdrawalTransactions = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToastContext();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
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
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const fetchWithdrawalTransactions = async (startDate, endDate) => {
    setLoading(true);
    try {
      const start = startDate || new Date();
      const end = endDate || new Date();

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // const payload = {
      //   startDate: formatDate(start),
      //   endDate: formatDate(end),
      //   status: 'Accept',
      //   transactionType: 'Withdrawal',
      //   platefrom: "PowerPay"
      // };

      // const response = await axios.post('https://powerdreams.org/api/online/transaction/getDeposit_WithdrawalTransaction_RRPay', payload);
      // const transactionData = response?.data?.data?.requests_Data || [];
      
      const response = await apiHelper.get(`/transaction/getWithdraw_Users_Transaction_forDashboard?startDate=${formatDate(start)}&endDate=${formatDate(end)}`);
      const transactionData = response?.users || [];
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
    } catch (error) {
      toast.error('Failed to fetch withdrawal transactions: ' + error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const applyDateFilter = () => {
    fetchWithdrawalTransactions(dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  const resetFilter = () => {
    const today = new Date();
    setDateRange([{
      startDate: today,
      endDate: today,
      key: 'selection'
    }]);
    fetchWithdrawalTransactions(today, today);
  };

  useEffect(() => {
    fetchWithdrawalTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Withdrawal Transactions"
          subtitle="All withdrawal transactions"
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
                Withdrawal Transactions
              </h2>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                {transactions.length} transactions
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No transactions found</p>
                <p className="text-sm">No withdrawal transactions for the selected date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deposit</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deposit Count</th>
                      {/* <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th> */}
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={transaction?.userId || index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{index + 1}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{transaction?.clientName || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.phone || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-red-600">₹{transaction?.totalDepositAmount || 0}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.depositCount || 0}</p>
                        </td>
                        {/* <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">₹{transaction?.balance || 0}</p>
                        </td> */}
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.branchName || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.lastTxnDate ? new Date(transaction.lastTxnDate).toLocaleString() : 'N/A'}</p>
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

export default WithdrawalTransactions;