import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersList from './UsersList';
import AddUserForm from './AddUserForm';
import { Users, Plus, Calendar, RotateCcw, RefreshCw } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import axios from 'axios';

const DashboardStats = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [dashSummary, setDashSummary] = useState(null);
  const [gameDashboardSummary, setGameDashboardSummary] = useState(null);
  const [externalStats, setExternalStats] = useState(null);
  const [activeUsercount, setActiveUsercount] = useState(null);
  const [profitLoss, setProfitLoss] = useState({ amount: 0, status: 'Profit' });
  const [deleteIdsCount, setDeleteIdsCount] = useState(0);
  const [todayDepositCount, setTodayDepositCount] = useState(0);
  const [todayWithdrawalCount, setTodayWithdrawalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ftdPendingLoading, setFtdPendingLoading] = useState(false);
  const [ftdCompleteLoading, setFtdCompleteLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const hasFetched = useRef(false);
  const toast = useToastContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const refreshUsers = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const fetchDashboardSummary = async (startDate, endDate) => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    try {
      const start = startDate || new Date();
      const end = endDate || new Date();

      // Format dates for API calls
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();

      // Make all API calls in parallel except FTD pending and complete
      const [payInOutResponse, statusWiseResponse, userRegResponse, bonusResponse, referralResponse, gameResponse, deleteIdsResponse, activeUserResponse, todayDepositResponse, todayWithdrawalResponse, profitLossResponse] = await Promise.all([
        apiHelper.get(`/transaction/dash-transaction-DW-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-transaction-statusWise-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-user-registration-count-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-bonus-summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/dash-referral-earning-summary?startDate=${startUTC}&endDate=${endUTC}`),
        // apiHelper.get(`/game/games/dashboard/summary?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/game/games/dashboard/summary`),
        apiHelper.post('/deletelog/getCount_of_DeleteId', {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        }),
        apiHelper.post('/user/getActiveUserLogsCount', {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        }),
        apiHelper.get(`/transaction/getDeposit_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get(`/transaction/getWithdraw_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`),
        apiHelper.get('/transaction/profit_and_loss_for_SuperAdmin')
      ]);

      // Extract data from responses
      const payInOutData = payInOutResponse?.data || payInOutResponse;
      const statusWiseData = statusWiseResponse?.data || statusWiseResponse;
      const userRegData = userRegResponse?.data || userRegResponse;
      const bonusData = bonusResponse?.data || bonusResponse;
      const referralData = referralResponse?.data || referralResponse;
      const gameData = gameResponse?.data || gameResponse;

      // Set all state data except FTD data
      const combinedSummary = {
        transactionsDetails: {
          totalDeposit: payInOutData?.transactionsDetails?.totalDeposit || 0,
          depositCount: payInOutData?.transactionsDetails?.depositCount || 0,
          totalWithdrawal: payInOutData?.transactionsDetails?.totalWithdrawal || 0,
          withdrawalCount: payInOutData?.transactionsDetails?.withdrawalCount || 0
        },
        userRegistrationsCount: userRegData?.userRegistrationsCount || 0,
        userRegistrationsNoTranxCount: 0, // Will be loaded on demand
        ftd_users_count: 0, // Will be loaded on demand
        statusWiseBreakdown: statusWiseData?.statusWiseBreakdown || {},
        totalBonus: {
          totalAmount: bonusData?.totalBonus?.totalAmount || 0,
          count: bonusData?.totalBonus?.count || 0
        },
        totalRefereEarning: {
          totalAmount: referralData?.totalRefereEarning?.totalAmount || referralData?.totalAmount || 0,
          count: referralData?.totalRefereEarning?.count || referralData?.count || 0
        }
      };
      
      setDashSummary(combinedSummary);
      setGameDashboardSummary(gameData);
      setExternalStats({});
      setDeleteIdsCount(deleteIdsResponse?.data || 0);
      setActiveUsercount(activeUserResponse);
      setTodayDepositCount(todayDepositResponse?.userCount || 0);
      setTodayWithdrawalCount(todayWithdrawalResponse?.userCount || 0);
      
      const profitData = profitLossResponse?.data || profitLossResponse;
      setProfitLoss({ amount: profitData?.amount || 0, status: profitData?.status || 'Profit' });
    } catch (error) {
      toast.error('Failed to fetch dashboard summary: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch FTD pending data
  const fetchFtdPendingData = async () => {
    if (ftdPendingLoading) return;
    setFtdPendingLoading(true);
    try {
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      
      const ftdPendingResponse = await apiHelper.get(`/transaction/dash-user-registered-no-tranx-count-summary?startDate=${startUTC}&endDate=${endUTC}`);
      const ftdPendingData = ftdPendingResponse?.data || ftdPendingResponse;
      
      setDashSummary(prev => ({
        ...prev,
        userRegistrationsNoTranxCount: ftdPendingData?.userRegistrationsNoTranxCount || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch FTD pending data: ' + error.message);
    } finally {
      setFtdPendingLoading(false);
    }
  };

  // Separate function to fetch FTD complete data
  const fetchFtdCompleteData = async () => {
    if (ftdCompleteLoading) return;
    setFtdCompleteLoading(true);
    try {
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();
      
      const ftdCompleteResponse = await apiHelper.get(`/transaction/dash-ftd-summary?startDate=${startUTC}&endDate=${endUTC}`);
      const ftdCompleteData = ftdCompleteResponse?.data || ftdCompleteResponse;
      
      setDashSummary(prev => ({
        ...prev,
        ftd_users_count: ftdCompleteData?.ftd_users_count || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch FTD complete data: ' + error.message);
    } finally {
      setFtdCompleteLoading(false);
    }
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const applyDateFilter = () => {
    fetchDashboardSummary(dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  const resetFilter = () => {
    const today = new Date();
    setDateRange([{
      startDate: today,
      endDate: today,
      key: 'selection'
    }]);
    fetchDashboardSummary(today, today);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Initial': return 'text-blue-600';
      case 'Pending': return 'text-yellow-600';
      case 'Accept': return 'text-green-600';
      case 'Reject': return 'text-red-600';
      default: return 'text-gray-900';
    }
  };

  const handleStatusClick = (status) => {
    navigate(`/status-details?status=${status}`);
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardSummary();
    }
  }, []);

  return (
    <div>
      {/* Date Filter */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Summary</h1>
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

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/deposit-transactions')}
          >
            <h3 className="text-sm font-medium text-gray-500">PayIn Amount</h3>
            <p className="text-2xl font-bold text-green-600">₹{dashSummary?.transactionsDetails?.totalDeposit?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Count: {dashSummary?.transactionsDetails?.depositCount || 0}</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/withdrawal-transactions')}
          >
            <h3 className="text-sm font-medium text-gray-500">PayOut Amount</h3>
            <p className="text-2xl font-bold text-red-600">₹{dashSummary?.transactionsDetails?.totalWithdrawal?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Count: {dashSummary?.transactionsDetails?.withdrawalCount || 0}</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/user-registrations')}
          >
            <h3 className="text-sm font-medium text-gray-500">New User Registrations</h3>
            <p className="text-2xl font-bold text-blue-600">{dashSummary?.userRegistrationsCount || 0}</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => navigate('/ftd-complete-users')}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchFtdCompleteData();
              }}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
              disabled={ftdCompleteLoading}
            >
              <RefreshCw size={14} className={ftdCompleteLoading ? 'animate-spin' : ''} />
            </button>
            <h3 className="text-sm font-medium text-gray-500">FTD Complete User</h3>
            <p className="text-2xl font-bold text-green-600">{dashSummary?.ftd_users_count || 0}</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => navigate('/no-transaction-users')}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchFtdPendingData();
              }}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
              disabled={ftdPendingLoading}
            >
              <RefreshCw size={14} className={ftdPendingLoading ? 'animate-spin' : ''} />
            </button>
            <h3 className="text-sm font-medium text-gray-500">FTD Pending User</h3>
            <p className="text-2xl font-bold text-orange-600">{dashSummary?.userRegistrationsNoTranxCount || 0}</p>
          </div>
          {user?.role !== 'TierRole' && (
            <div
              className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/active-users')}
            >
              <h3 className="text-sm font-medium text-gray-500">Active User</h3>
              <p className="text-2xl font-bold text-green-600">{activeUsercount?.totalActiveUsers || 0}</p>
            </div>
          )}
        </>
      </div>

      {/* Casino Summary */}
      {gameDashboardSummary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Casino Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Bets</h3>
            <p className="text-2xl font-bold text-blue-600">₹{gameDashboardSummary?.bets?.total?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Count: {gameDashboardSummary?.bets?.count || 0}</p>
          </div>
          <div className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Wins</h3>
            <p className="text-2xl font-bold text-green-600">₹{gameDashboardSummary?.wins?.total?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Count: {gameDashboardSummary?.wins?.count || 0}</p>
          </div>
          <div className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">{gameDashboardSummary?.ggr?.label || 'House Profit'}</h3>
            <p className="text-2xl font-bold text-purple-600">₹{gameDashboardSummary?.ggr?.total?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">GGR</p>
          </div>
          <div className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Rollbacks</h3>
            <p className="text-2xl font-bold text-orange-600">₹{gameDashboardSummary?.rollbacks?.total?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Count: {gameDashboardSummary?.rollbacks?.count || 0}</p>
          </div>
          <div className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Lost Rounds</h3>
            <p className="text-2xl font-bold text-red-600">{gameDashboardSummary?.lostRounds?.count || 0}</p>
          </div>
          </div>
        </div>
      )}

      {/* Status Wise Breakdown */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Wise Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">Bonus</h3>
            <p className="text-xl font-bold text-green-600">₹{dashSummary?.totalBonus?.totalAmount?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{dashSummary?.totalBonus?.count || 0} transactions</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <h3 className="text-sm font-medium text-gray-500">Refer & Earn</h3>
            <p className="text-xl font-bold text-green-600">₹{dashSummary?.totalRefereEarning?.totalAmount?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{dashSummary?.totalRefereEarning?.count || 0} transactions</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatusClick('Initial')}
          >
            <h3 className="text-sm font-medium text-gray-500">Initial</h3>
            <p className="text-xl font-bold text-blue-600">₹{dashSummary?.statusWiseBreakdown?.Initial?.amount?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{dashSummary?.statusWiseBreakdown?.Initial?.count || 0} transactions</p>
            <p className="text-xs text-gray-500">{dashSummary?.statusWiseBreakdown?.Initial?.users || 0} users</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatusClick('Pending')}
          >
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-xl font-bold text-yellow-600">₹{dashSummary?.statusWiseBreakdown?.Pending?.amount?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{dashSummary?.statusWiseBreakdown?.Pending?.count || 0} transactions</p>
            <p className="text-xs text-gray-500">{dashSummary?.statusWiseBreakdown?.Pending?.users || 0} users</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatusClick('Accept')}
          >
            <h3 className="text-sm font-medium text-gray-500">Accept</h3>
            <p className="text-xl font-bold text-green-600">₹{dashSummary?.statusWiseBreakdown?.Accept?.amount?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{dashSummary?.statusWiseBreakdown?.Accept?.count || 0} transactions</p>
            <p className="text-xs text-gray-500">{dashSummary?.statusWiseBreakdown?.Accept?.users || 0} users</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStatusClick('Reject')}
          >
            <h3 className="text-sm font-medium text-gray-500">Reject</h3>
            <p className="text-xl font-bold text-red-600">₹{dashSummary?.statusWiseBreakdown?.Reject?.amount?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{dashSummary?.statusWiseBreakdown?.Reject?.count || 0} transactions</p>
            <p className="text-xs text-gray-500">{dashSummary?.statusWiseBreakdown?.Reject?.users || 0} users</p>
          </div>
        </div>
      </div>

      {/* Overall User Data */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall User Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <>
            {/* <h2 className="text-xl font-semibold text-gray-900 mb-4 w-full">Status Wise Breakdown</h2> */}
            <div className="gaming-card p-4 pb-4 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Users</h3>
              <p className="text-xl font-bold text-green-600">{usersCount}</p>
            </div>
            <div className="gaming-card p-4 pb-4 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Wallet Balance</h3>
              <p className="text-xl font-bold text-green-600">₹{totalBalance.toLocaleString()}</p>
            </div>
            {
              console.log(profitLoss.amount.toLocaleString())
            }
            {/* <div className="gaming-card p-4 pb-4 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-sm font-medium text-gray-500">Profit & Loss</h3>
              <p className={`text-xl font-bold ${profitLoss.status === 'Profit' ? 'text-green-600' : 'text-red-600'}`}>
                ₹{profitLoss.amount.toLocaleString()}
              </p>
            </div> */}
            <div className="gaming-card p-4 pb-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/deposit-transactions')}>
              <h3 className="text-sm font-medium text-gray-500">Today Deposit Requests</h3>
              <p className="text-xl font-bold text-green-600">{todayDepositCount}</p>
            </div>
            <div className="gaming-card p-4 pb-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/withdrawal-transactions')}>
              <h3 className="text-sm font-medium text-gray-500">Today Withdrawal Requests</h3>
              <p className="text-xl font-bold text-red-600">{todayWithdrawalCount}</p>
            </div>
          </>
        </div>
      </div>


      {/* Users Management Section */}
      <div className="gaming-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: '#1477b0' }} />
              User Management
            </h2>
            <p className="text-gray-600 text-sm mt-1">Manage and monitor all platform users</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* <div className="flex items-center gap-3">
              <div className="px-4 py-6 rounded-md text-xl font-semibold border" style={{ color: 'black' }}>
                {usersCount} Users
              </div>
              <div className="px-4 py-6 rounded-md text-xl font-semibold border" style={{ color: 'black' }}>
                ₹{totalBalance.toLocaleString()} Total Balance
              </div>
            </div> */}
            <button
              onClick={() => setShowAddUser(true)}
              className="gaming-btn flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">Add User</span>
            </button>
          </div>
        </div>

        <UsersList
          key={refreshTrigger}
          onUserDeleted={refreshUsers}
          onUsersCountChange={setUsersCount}
          onBalanceSumChange={setTotalBalance}
        />
      </div>

      {showAddUser && (
        <AddUserForm
          onClose={() => setShowAddUser(false)}
          onSuccess={() => {
            refreshUsers();
            setShowAddUser(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardStats;