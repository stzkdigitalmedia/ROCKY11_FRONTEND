import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersList from './UsersList';
import AddUserForm from './AddUserForm';
import { Users, Plus, Calendar, RotateCcw } from 'lucide-react';
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
  const [externalStats, setExternalStats] = useState(null);
  const [activeUsercount, setActiveUsercount] = useState(null);
  const [profitLoss, setProfitLoss] = useState({ amount: 0, status: 'Profit' });
  const [deleteIdsCount, setDeleteIdsCount] = useState(0);
  const [todayDepositCount, setTodayDepositCount] = useState(0);
  const [todayWithdrawalCount, setTodayWithdrawalCount] = useState(0);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const start = startDate || new Date();
      const end = endDate || new Date();

      // Local API call for New User Registrations and FTD Pending User
      const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString();
      const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() + 1)).toISOString();

      const localResponse = await apiHelper.get(`/transaction/dash-summary?startDate=${startUTC}&endDate=${endUTC}`);
      const summaryData = localResponse?.data || localResponse;
      setDashSummary(summaryData);

      // External API call for all other data
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const payload = {
        startDate: formatDate(start),
        endDate: formatDate(end),
        platefrom: "PowerPay"
      };
      const Mirrpayload = {
        startDate: formatDate(start),
        endDate: formatDate(end),
        platefrom: "PowerPay"
      };

      const externalResponse = await apiHelper.get(`/transaction/dash-summary?startDate=${startUTC}&endDate=${endUTC}`);
      setExternalStats(externalResponse?.data?.statusWiseBreakdown || externalResponse?.statusWiseBreakdown || {});

      // Fetch delete IDs count
      const deleteIdsPayload = {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      };
      const deleteIdsResponse = await apiHelper.post('/deletelog/getCount_of_DeleteId', deleteIdsPayload);
      setDeleteIdsCount(deleteIdsResponse?.data || 0);

      const activeUser = await apiHelper.post('/user/getActiveUserLogsCount', deleteIdsPayload);
      setActiveUsercount(activeUser)
      // console.log(activeUser)
      // Fetch today deposit requests count
      const todayDepositResponse = await apiHelper.get(`/transaction/getDeposit_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`);
      setTodayDepositCount(todayDepositResponse?.userCount || 0);

      // Fetch today withdrawal requests count
      const todayWithdrawalResponse = await apiHelper.get(`/transaction/getWithdraw_Users_Transaction_forDashboard?startDate=${startUTC}&endDate=${endUTC}`);
      setTodayWithdrawalCount(todayWithdrawalResponse?.userCount || 0);

      // Fetch profit & loss
      const profitLossResponse = await apiHelper.get('/transaction/profit_and_loss_for_SuperAdmin');
      const profitData = profitLossResponse?.data || profitLossResponse;
      setProfitLoss({ amount: profitData?.amount || 0, status: profitData?.status || 'Profit' });
    } catch (error) {
      toast.error('Failed to fetch dashboard summary: ' + error.message);
    } finally {
      setLoading(false);
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
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/ftd-complete-users')}
          >
            <h3 className="text-sm font-medium text-gray-500">FTD Complete User</h3>
            <p className="text-2xl font-bold text-green-600">{dashSummary?.ftd_users_count|| 0}</p>
          </div>
          <div
            className="gaming-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/no-transaction-users')}
          >
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
            {/* <button
              onClick={() => setShowAddUser(true)}
              className="gaming-btn flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">Add User</span>
            </button> */}
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