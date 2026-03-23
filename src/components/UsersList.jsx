import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { Eye, Trash2, X, Edit, History, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const UsersList = ({ onUserDeleted, onUsersCountChange, onBalanceSumChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userBalances, setUserBalances] = useState({});
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userSubAccounts, setUserSubAccounts] = useState([]);
  const [subAccountsLoading, setSubAccountsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subAccountBalances, setSubAccountBalances] = useState({});
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [editBalanceUser, setEditBalanceUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [historyUser, setHistoryUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [checkingPendingTransactions, setCheckingPendingTransactions] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalTransactions, setHistoryTotalTransactions] = useState(0);
  const [historyFilters, setHistoryFilters] = useState({
    status: '',
    transactionType: '',
    minAmount: '',
    maxAmount: ''
  });
  const [balanceSum, setBalanceSum] = useState(0);
  const [profitLossUser, setProfitLossUser] = useState(null);
  const [userProfitLoss, setUserProfitLoss] = useState({ amount: 0, status: 'Profit', totalDeposit: 0, totalWithdrawal: 0 });
  const [profitLossLoading, setProfitLossLoading] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [screenshotData, setScreenshotData] = useState(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [showDeleteLogs, setShowDeleteLogs] = useState(false);
  const [deleteLogsUser, setDeleteLogsUser] = useState(null);
  const [deleteLogs, setDeleteLogs] = useState([]);
  const [deleteLogsLoading, setDeleteLogsLoading] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusUser, setBonusUser] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusRemark, setBonusRemark] = useState('add manual bonus');
  // const [showAssignTier, setShowAssignTier] = useState(false);
  // const [assignTierUser, setAssignTierUser] = useState(null);
  // const [tiers, setTiers] = useState([]);
  // const [selectedTierId, setSelectedTierId] = useState('');
  // const [assignTierLoading, setAssignTierLoading] = useState(false);

  const toast = useToastContext();

  // const handleDeleteUser = async () => {
  //   if (!userToDelete) return;

  //   try {
  //     await apiHelper.delete(`/user/deleteUser/${userToDelete.id || userToDelete._id}`);
  //     toast.success('User deleted successfully!');
  //     setUserToDelete(null);
  //     document.body.classList.remove('modal-open');
  //     fetchUsers(page);
  //     if (onUserDeleted) onUserDeleted();
  //   } catch (error) {
  //     toast.error('Failed to delete user: ' + error.message);
  //   }
  // };

  // const openDeleteModal = (user) => {
  //   setUserToDelete(user);
  //   document.body.classList.add('modal-open');
  // };

  // const closeDeleteModal = () => {
  //   setUserToDelete(null);
  //   document.body.classList.remove('modal-open');
  // };

  const createBalanceLog = async (userId) => {
    try {
      await apiHelper.post('/balance/createBalanceLog', { userId });
      toast.info("waiting for balance update...");
    } catch (error) {
      console.error('Failed to create balance log:', error);
    }
  };

  const fetchSubUserBalance = async (subAccountId) => {
    try {
      const response = await apiHelper.get(`/balance/getBalanceLogBySubUserId/${subAccountId}`);
      const logData = response?.data || response || [];
      const latestLog = Array.isArray(logData) ? logData[0] : logData;

      if (latestLog?.status === 'Accept') {
        return latestLog?.CurrentBalance || 0;
      } else {
        // Keep trying if status is pending
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchSubUserBalance(subAccountId);
      }
    } catch (error) {
      console.error('Failed to fetch sub-user balance:', error);
      return 0;
    }
  };

  const handleViewSubAccounts = async (user) => {
    setViewingUser(user);
    setSubAccountsLoading(true);
    setSubAccountBalances({});
    document.body.classList.add('modal-open');
    try {
      const response = await apiHelper.get(`/subAccount/getSubAccountsByParentId/${user?.id || user?._id}`);
      const subAccounts = response?.subAccounts || response?.data || response || [];
      setUserSubAccounts(subAccounts);
      setSubAccountsLoading(false);

      // Fetch balances after showing sub-accounts
      const balances = {};
      for (const account of subAccounts) {
        try {
          // Only create balance log if status is not Reject
          if (account?.status !== 'Reject') {
            await createBalanceLog(account?.id || account?._id);
            const balance = await fetchSubUserBalance(account?.id || account?._id);
            balances[account?.id || account?._id] = balance;
          } else {
            balances[account?.id || account?._id] = 0;
          }
          setSubAccountBalances({ ...balances });
        } catch (error) {
          console.error(`Failed to fetch balance for account ${account?.id || account?._id}:`, error);
          balances[account?.id || account?._id] = 0;
          setSubAccountBalances({ ...balances });
        }
      }
    } catch (error) {
      toast.error('Failed to fetch sub accounts: ' + error.message);
      setUserSubAccounts([]);
      setSubAccountsLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewingUser(null);
    document.body.classList.remove('modal-open');
  };

  const updateUserPassword = async () => {
    if (!resetPasswordUser || !newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    try {
      const payload = {
        userId: resetPasswordUser.id || resetPasswordUser._id,
        newPassword: newPassword
      };
      await apiHelper.post('/user/updateUserPasswordBySuperAdmin', payload);
      toast.success('Password updated successfully!');
      closeResetPasswordModal();
    } catch (error) {
      toast.error('Failed to update password: ' + error.message);
    }
  };

  const openResetPasswordModal = (user) => {
    setResetPasswordUser(user);
    setNewPassword('');
    document.body.classList.add('modal-open');
  };

  const closeResetPasswordModal = () => {
    setResetPasswordUser(null);
    setNewPassword('');
    document.body.classList.remove('modal-open');
  };

  const updateUserBalance = async () => {
    if (!editBalanceUser || !newBalance.trim()) {
      toast.error('Please enter a balance amount');
      return;
    }

    try {
      const payload = {
        userId: editBalanceUser.id || editBalanceUser._id,
        balance: newBalance,
        reason: balanceReason || 'for manual cash'
      };
      await apiHelper.put('/user/updateUserBalanceBySuperAdmin', payload);
      toast.success('Balance updated successfully!');
      closeEditBalanceModal();
      fetchUsers(page, searchTerm);
    } catch (error) {
      toast.error('Failed to update balance: ' + error.message);
    }
  };

  const openEditBalanceModal = (user) => {
    setEditBalanceUser(user);
    setNewBalance(user?.balance || '0');
    setBalanceReason('');
    document.body.classList.add('modal-open');
  };

  const closeEditBalanceModal = () => {
    setEditBalanceUser(null);
    setNewBalance('');
    setBalanceReason('');
    document.body.classList.remove('modal-open');
  };

  const checkPendingTransactions = async (userId) => {
    setCheckingPendingTransactions(true);
    try {
      if (!userId) return;

      const transactionsResponse = await apiHelper.post(`/transaction/getUserTransactions/${userId}?page=1&limit=10`);
      const transactions = transactionsResponse?.data?.transactions || [];

      for (const transaction of transactions) {
        if (transaction?.status === 'Accept' && transaction?.mode == 'Wallet' && transaction?.transactionStatus != "Completed") {
          try {
            const statusResponse = await apiHelper.get(
              `/transaction/get_single_transactions/${transaction?._id}`
            );

            if (statusResponse?.data) {
              const currentStatus = statusResponse?.data?.status;

              let updatedStatus = 'Pending';
              if (currentStatus === 'Accept') {
                updatedStatus = 'Completed';
              } else if (currentStatus === 'Insufficent') {
                updatedStatus = 'Reject';
              } else if (currentStatus === 'Pending') {
                updatedStatus = 'Pending';
              }

              await apiHelper.patch(`/transaction/update_Wallet_Withdrawal_Transaction/${transaction?._id}`, {
                status: updatedStatus,
              });

              if (updatedStatus === 'Completed') {
                toast.success('Transaction completed successfully!');
              }
            }
          } catch (error) {
            console.log('Error updating transaction:', transaction?._id, error);
          }
        }
      }

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const firstThreeTransactions = transactions?.slice(0, 5);

      for (const transaction of firstThreeTransactions) {
        try {
          const statusResponse = await apiHelper.get(
            `/transaction/callCheckStatus/${transaction?._id}`
          );

          if (!statusResponse?.data?.success) continue;

          const newStatus = statusResponse?.data?.data?.status;

          if (
            transaction?.transactionType === "Withdrawal" &&
            newStatus === "Initial"
          ) {
            console.log(
              `Withdrawal ${transaction?._id} is still Initial → skipping update`
            );
            continue;
          }

          if (newStatus) {
            await apiHelper.patch(
              `/transaction/update_Transaction_Request_Data_of_Request/${transaction?._id}`,
              { status: newStatus }
            );

            if (newStatus === "Accept") {
              toast.success("Transaction completed successfully!");
            } else if (newStatus === "Reject") {
              toast.error("Transaction Rejected");
            } else if (newStatus === "Initial") {
              console.log(
                `Transaction ${transaction?._id} is still Initial...`
              );
            }
          }
        } catch (statusError) {
          console.log(
            "Status check error for transaction:",
            transaction?._id,
            statusError
          );
        }
      }

    } catch (error) {
      console.log('Background status check error:', error);
    } finally {
      setCheckingPendingTransactions(false);
    }
  };

  const fetchUserHistory = async (user, page = 1, filters = historyFilters) => {
    if (page === 1) {
      setHistoryUser(user);
      document.body.classList.add('modal-open');
      await checkPendingTransactions(user?.id || user?._id);
    }
    setTransactionsLoading(true);
    try {
      const payload = {
        page: page,
        limit: 10,
        ...filters
      };

      // Remove empty filters
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await apiHelper.post(`/transaction/getUserTransactions/${user?.id || user?._id}`, payload);
      setUserTransactions(response?.data?.transactions || []);
      setHistoryCurrentPage(page);
      setHistoryTotalPages(response?.data?.totalPages || 1);
      setHistoryTotalTransactions(response?.data?.totalTransactions || 0);
    } catch (error) {
      toast.error('Failed to fetch transaction history: ' + error.message);
      setUserTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryUser(null);
    setUserTransactions([]);
    setHistoryCurrentPage(1);
    setHistoryTotalPages(1);
    setHistoryTotalTransactions(0);
    setHistoryFilters({
      status: '',
      transactionType: '',
      minAmount: '',
      maxAmount: ''
    });
    document.body.classList.remove('modal-open');
  };

  const handleHistoryFilterChange = (key, value) => {
    setHistoryFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyHistoryFilters = () => {
    setHistoryCurrentPage(1);
    fetchUserHistory(historyUser, 1, historyFilters);
  };

  const clearHistoryFilters = () => {
    const clearedFilters = {
      status: '',
      transactionType: '',
      minAmount: '',
      maxAmount: ''
    };
    setHistoryFilters(clearedFilters);
    setHistoryCurrentPage(1);
    fetchUserHistory(historyUser, 1, clearedFilters);
  };

  const downloadExcel = async () => {
    try {
      // Fetch all transactions without pagination
      const payload = {
        page: 1,
        limit: 10000, // Large number to get all transactions
        ...historyFilters
      };

      // Remove empty filters
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await apiHelper.post(`/transaction/getUserTransactions/${historyUser?.id || historyUser?._id}`, payload);
      const allTransactions = response?.data?.transactions || [];

      if (allTransactions.length === 0) {
        toast.error('No transactions to download');
        return;
      }

      // Prepare data for Excel
      const excelData = allTransactions.map((transaction, index) => ({
        'S.No': index + 1,
        'Transaction Type': transaction?.transactionType || 'N/A',
        'Game Name': transaction?.gameName || 'N/A',
        'Mode': transaction?.mode || 'N/A',
        'Amount': transaction?.amount || 0,
        'Status': transaction?.status || 'Pending',
        'Created Date': transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-IN') : 'N/A',
        'Created Time': transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('en-IN') : 'N/A',
        'Updated Date': transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleDateString('en-IN') : 'N/A',
        'Updated Time': transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleTimeString('en-IN') : 'N/A'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Generate filename with user name and current date
      const fileName = `${historyUser?.clientName || 'User'}_Transactions_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel file: ' + error.message);
    }
  };

  const fetchUserProfitLoss = async (user) => {
    setProfitLossUser(user);
    setProfitLossLoading(true);
    document.body.classList.add('modal-open');
    try {
      const response = await apiHelper.get(`/transaction/profit_and_loss_for_User/${user?.id || user?._id}`);
      const profitData = response?.data || response;
      setUserProfitLoss({
        amount: profitData?.amount || 0,
        status: profitData?.status || 'Profit',
        totalDeposit: profitData?.totalDeposit || 0,
        totalWithdrawal: profitData?.totalWithdrawal || 0
      });
    } catch (error) {
      toast.error('Failed to fetch profit & loss: ' + error.message);
      setUserProfitLoss({ amount: 0, status: 'Profit', totalDeposit: 0, totalWithdrawal: 0 });
    } finally {
      setProfitLossLoading(false);
    }
  };

  const closeProfitLossModal = () => {
    setProfitLossUser(null);
    setUserProfitLoss({ amount: 0, status: 'Profit', totalDeposit: 0, totalWithdrawal: 0 });
    document.body.classList.remove('modal-open');
  };

  const fetchTransactionScreenshot = async (transactionId) => {
    setScreenshotLoading(true);
    try {
      const response = await apiHelper.get(`/transaction/fetch_powerPay_transaction_screenshot/${transactionId}`);
      setScreenshotData(response);
      setShowScreenshot(true);
    } catch (error) {
      toast.error('Failed to fetch screenshot: ' + error.message);
    } finally {
      setScreenshotLoading(false);
    }
  };

  const fetchDeleteLogs = async (user) => {
    setDeleteLogsUser(user);
    setDeleteLogsLoading(true);
    setShowDeleteLogs(true);
    document.body.classList.add('modal-open');
    try {
      const response = await apiHelper.post('/deletelog/getDeleteLogByClientName', {
        clientName: user?.clientName
      });
      setDeleteLogs(response?.data || []);
    } catch (error) {
      toast.error('Failed to fetch delete logs: ' + error.message);
      setDeleteLogs([]);
    } finally {
      setDeleteLogsLoading(false);
    }
  };

  // const fetchTiers = async () => {
  //   try {
  //     const response = await apiHelper.get('/tier/getAllTiers_WithoutPagination');
  //     setTiers(response?.data?.tiers || []);
  //   } catch (error) {
  //     console.error('Failed to fetch tiers:', error);
  //   }
  // };

  // const assignTierToUser = async () => {
  //   if (!selectedTierId || !assignTierUser) {
  //     toast.error('Please select a tier');
  //     return;
  //   }

  //   setAssignTierLoading(true);
  //   try {
  //     const payload = {
  //       teirId: selectedTierId,
  //       userId: assignTierUser.id || assignTierUser._id
  //     };
  //     await apiHelper.post('/tier/assignTierTo_SingleUser', payload);
  //     toast.success('Tier assigned successfully!');
  //     closeAssignTierModal();
  //     fetchUsers(page, searchTerm);
  //   } catch (error) {
  //     toast.error('Failed to assign tier: ' + error.message);
  //   } finally {
  //     setAssignTierLoading(false);
  //   }
  // };

  // const openAssignTierModal = (user) => {
  //   setAssignTierUser(user);
  //   setSelectedTierId('');
  //   setShowAssignTier(true);
  //   fetchTiers();
  //   document.body.classList.add('modal-open');
  // };

  // const closeAssignTierModal = () => {
  //   setShowAssignTier(false);
  //   setAssignTierUser(null);
  //   setSelectedTierId('');
  //   document.body.classList.remove('modal-open');
  // };

  const closeDeleteLogsModal = () => {
    setShowDeleteLogs(false);
    setDeleteLogsUser(null);
    setDeleteLogs([]);
    document.body.classList.remove('modal-open');
  };

  const openBonusModal = (user) => {
    setBonusUser(user);
    setBonusAmount('');
    setBonusRemark('add manual bonus');
    setShowBonusModal(true);
    document.body.classList.add('modal-open');
  };

  const closeBonusModal = () => {
    setShowBonusModal(false);
    setBonusUser(null);
    setBonusAmount('');
    setBonusRemark('add manual bonus');
    document.body.classList.remove('modal-open');
  };

  const addManualBonus = async () => {
    if (!bonusAmount || !bonusUser) {
      toast.error('Please enter bonus amount');
      return;
    }

    try {
      const payload = {
        userId: bonusUser.id || bonusUser._id,
        amount: parseFloat(bonusAmount),
        remarks: bonusRemark
      };
      await apiHelper.post('/bonus/add-manual-bonus', payload);
      toast.success('Bonus added successfully!');
      closeBonusModal();
      fetchUsers(page, searchTerm);
    } catch (error) {
      toast.error('Failed to add bonus: ' + error.message);
    }
  };

  const downloadUsersExcel = async () => {
    try {
      const response = await apiHelper.get('/user/getUsers?page=1&limit=100000');
      const allUsers = response?.data || response?.users || [];

      if (allUsers.length === 0) {
        toast.error('No users to download');
        return;
      }

      const excelData = allUsers.map((user, index) => ({
        'S.No': index + 1,
        'Client Name': user?.clientName || 'N/A',
        'Full Name': user?.fullName || 'N/A',
        'Phone': user?.phone || 'N/A',
        'Email': user?.email || 'N/A',
        'Balance': user?.balance || 0,
        'Role': user?.role || 'N/A',
        'Status': user?.status || user?.isActive !== false ? 'Active' : 'Inactive',
        'Created Date': user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A',
        'Created Time': user?.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-IN') : 'N/A'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      const fileName = `Users_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel file: ' + error.message);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await apiHelper.patch(`/user/activeInactiveUserStatus/${user?.id || user?._id}`);
      toast.success('User status updated successfully');
      fetchUsers(page, searchTerm);
    } catch (error) {
      toast.error('Failed to update user status: ' + error.message);
    }
  };
  const fetchUsers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 100,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (minAmount !== '') params.append('minAmount', minAmount);
      if (maxAmount !== '') params.append('maxAmount', maxAmount);

      const response = await apiHelper.get(
        `/user/getUsers?${params.toString()}`
      );

      const usersList = response?.data || response?.users || [];

      setUsers(usersList);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalUsers(response?.pagination?.totalUsers || usersList.length);
      setBalanceSum(response?.balanceSum || 0);

      onUsersCountChange?.(response?.pagination?.totalUsers || usersList.length);
      onBalanceSumChange?.(response?.balanceSum || 0);

    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    fetchUsers(1, value);
  };

  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page]);

  useEffect(() => {
    // ❌ invalid range check
    if (
      minAmount !== '' &&
      maxAmount !== '' &&
      Number(minAmount) > Number(maxAmount)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      fetchUsers(1);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, minAmount, maxAmount]);


  return (
    <div>
      {/* Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Min Amount */}
        <input
          type="number"
          placeholder="Min Amount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Max Amount */}
        <input
          type="number"
          placeholder="Max Amount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Download Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadUsersExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Download size={16} />
          Download Users
        </button>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
              {/* <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th> */}
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Role</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Profit & Loss</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Delete Id</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center" style={{ height: '320px' }}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="loading-spinner mb-2" style={{ width: '20px', height: '20px' }}></div>
                    <p className="text-gray-600 text-sm">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center text-gray-500" style={{ height: '320px' }}>
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-lg mb-2">No users found</p>
                    <p className="text-sm">Add some users to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user?.id || index} className="table-row border-b border-gray-100">
                  <td className="py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {(user?.fullName || user?.clientName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user?.clientName}</p>
                        {/* <h3 className="text-sm text-gray-500 truncate">{user?.fullName || user?.clientName}</h3> */}
                        {/* <p className="text-sm text-gray-500 truncate sm:hidden">{user?.email}</p> */}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.phone}</p>
                      {/* <p className="text-sm text-gray-500">{user?.email}</p> */}
                    </div>
                  </td>
                  {/* <td className="py-4 px-2 sm:px-4 hidden md:table-cell">
                          <p className="text-sm text-gray-900">{user?.city}</p>
                        </td> */}
                  <td className="py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-green-600">₹{user?.balance || 0}</p>
                      <button
                        onClick={() => openEditBalanceModal(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-2 sm:px-4 hidden lg:table-cell">
                    <span className="badge badge-green">
                      {user?.role}
                    </span>
                  </td>
                  <td className="py-4 px-2 sm:px-4 hidden lg:table-cell">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user?.status === 'Active' || user?.isActive !== false}
                        onChange={() => toggleUserStatus(user)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="py-4 px-2 sm:px-4">
                    <button
                      onClick={() => fetchUserHistory(user)}
                      className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                    >
                      <History size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">History</span>
                    </button>
                  </td>
                  <td className="py-4 px-2 sm:px-4">
                    <button
                      onClick={() => openBonusModal(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={14} />
                    </button>
                  </td>
                  <td className="py-4 px-2 sm:px-4">
                    <button
                      onClick={() => fetchUserProfitLoss(user)}
                      className="text-orange-600 hover:text-orange-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">View P&L</span>
                      <span className="sm:hidden">P&L</span>
                    </button>
                  </td>
                  <td className="py-4 px-2 sm:px-4">
                    <button
                      onClick={() => fetchDeleteLogs(user)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Delete Logs</span>
                      <span className="sm:hidden">Logs</span>
                    </button>
                  </td>
                  {/* <td className="py-4 px-2 sm:px-4">
                        <button 
                          onClick={() => openAssignTierModal(user)}
                          className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                        >
                          <span className="hidden sm:inline">Assign Tier</span>
                          <span className="sm:hidden">Tier</span>
                        </button>
                      </td> */}
                  <td className="py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleViewSubAccounts(user)}
                        className="text-xs sm:text-sm font-medium flex items-center gap-1 hover:opacity-80"
                        style={{ color: '#1477b0' }}
                      >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => openResetPasswordModal(user)}
                        className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
        <div className="text-sm text-gray-600">
          Showing page {page} of {totalPages} (Total: {totalUsers} users)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 100) }, (_, i) => {
              let pageNum;
              if (totalPages <= 100) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Sub Accounts Modal */}
      {viewingUser && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gaming IDs</h2>
                <p className="text-gray-600 text-sm mt-1">{viewingUser?.clientName}'s ID</p>
              </div>
              <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {subAccountsLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading sub accounts...</p>
              </div>
            ) : userSubAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No Ids found</p>
                <p className="text-sm">This user has not created any ID yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSubAccounts.filter(account => account?.status !== 'Reject').map((account, index) => (
                      <tr key={account?.id || account?._id || index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{index + 1}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {account?.clientName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{account?.clientName}</h3>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{account?.gameId?.name || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-green-600">
                            ₹ {(subAccountBalances[account?.id || account?._id] || 'Pending').toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${account?.status === 'Accept' ? 'badge-green' :
                            account?.status === 'Reject' ? 'badge-red' : 'badge-blue'
                            }`}>
                            {account?.status === 'Accept' ? 'Active' :
                              account?.status === 'Reject' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reset Password</h2>
                <p className="text-gray-600 text-sm mt-1">Update password for {resetPasswordUser?.clientName}</p>
              </div>
              <button onClick={closeResetPasswordModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={closeResetPasswordModal} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={updateUserPassword} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {editBalanceUser && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Balance</h2>
                <p className="text-gray-600 text-sm mt-1">Update balance for {editBalanceUser?.clientName}</p>
              </div>
              <button onClick={closeEditBalanceModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance Amount
              </label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="Enter balance amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <input
                type="text"
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                placeholder="for manual cash"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={closeEditBalanceModal} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={updateUserBalance} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {historyUser && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transaction History</h2>
                <p className="text-gray-600 text-sm mt-1">Transaction history for {historyUser?.clientName}</p>
              </div>
              <button onClick={closeHistoryModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={historyFilters.status}
                    onChange={(e) => handleHistoryFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="Initial">Initial</option>
                    <option value="Pending">Pending</option>
                    <option value="Accept">Accept</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={historyFilters.transactionType}
                    onChange={(e) => handleHistoryFilterChange('transactionType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawal">Withdrawal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                  <input
                    type="number"
                    value={historyFilters.minAmount}
                    onChange={(e) => handleHistoryFilterChange('minAmount', e.target.value)}
                    placeholder="Min amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input
                    type="number"
                    value={historyFilters.maxAmount}
                    onChange={(e) => handleHistoryFilterChange('maxAmount', e.target.value)}
                    placeholder="Max amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyHistoryFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearHistoryFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => downloadExcel()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Excel
                </button>
              </div>
            </div>

            {checkingPendingTransactions ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Checking pending transactions...</p>
              </div>
            ) : transactionsLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : !Array.isArray(userTransactions) || userTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No transactions found</p>
                <p className="text-sm">This user has no transaction history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">GameID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">GameName</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(userTransactions) && userTransactions.map((transaction, index) => (
                      <tr key={transaction?.id || transaction?._id || index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{((historyCurrentPage - 1) * 10) + index + 1}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.clientName || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          {transaction?.transactionType === 'Withdrawal' &&
                            transaction?.mode === 'PowerPay' &&
                            transaction?.status === 'Accept' ? (
                            <button
                              onClick={() => fetchTransactionScreenshot(transaction?._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Screenshot"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              No Image
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.transactionType || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction?.gameName || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{transaction.mode === 'ALLINONE' ? 'INSTANT PAYOUT' : transaction.mode || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-green-600">
                            ₹{transaction?.amount || 0}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-green-600">
                            {transaction?.remarks || 'N/A'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">
                            {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('en-IN') : ''}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">
                            {transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleDateString('en-IN') : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleTimeString('en-IN') : ''}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`badge ${transaction?.status === 'Accept' || transaction?.status === 'completed' ? 'badge-green' :
                            transaction?.status === 'Reject' || transaction?.status === 'failed' ? 'badge-red' : 'badge-blue'
                            }`}>
                            {transaction?.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {historyTotalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing page {historyCurrentPage} of {historyTotalPages} (Total: {historyTotalTransactions} transactions)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchUserHistory(historyUser, historyCurrentPage - 1)}
                        disabled={historyCurrentPage === 1 || transactionsLoading}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Page {historyCurrentPage} of {historyTotalPages}</span>
                      </div>

                      <button
                        onClick={() => fetchUserHistory(historyUser, historyCurrentPage + 1)}
                        disabled={historyCurrentPage === historyTotalPages || transactionsLoading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profit & Loss Modal */}
      {profitLossUser && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profit & Loss</h2>
                <p className="text-gray-600 text-sm mt-1">P&L for {profitLossUser?.clientName}</p>
              </div>
              <button onClick={closeProfitLossModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {profitLossLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading profit & loss...</p>
              </div>
            ) : (
              <div className="py-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Deposit</h3>
                    <p className="text-xl font-bold text-green-600">
                      ₹{userProfitLoss.totalDeposit.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Withdrawal</h3>
                    <p className="text-xl font-bold text-red-600">
                      ₹{userProfitLoss.totalWithdrawal.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Net Amount</h3>
                  <p className={`text-3xl font-bold ${userProfitLoss.status === 'Profit' ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{userProfitLoss.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${userProfitLoss.status === 'Profit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {userProfitLoss.status}
                  </span>
                </div>
                <button onClick={closeProfitLossModal} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Logs Modal */}
      {showDeleteLogs && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Delete Logs</h2>
                <p className="text-gray-600 text-sm mt-1">Delete logs for {deleteLogsUser?.clientName}</p>
              </div>
              <button onClick={closeDeleteLogsModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {deleteLogsLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading delete logs...</p>
              </div>
            ) : deleteLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No delete logs found</p>
                <p className="text-sm">This user has no delete history</p>
              </div>
            ) : (
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
                    {deleteLogs.map((log, index) => (
                      <tr key={log._id || index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{index + 1}</p>
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
            )}
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {showScreenshot && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Screenshot</h3>
              <button
                onClick={() => {
                  setShowScreenshot(false);
                  setScreenshotData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {screenshotLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading screenshot...</p>
                </div>
              ) : screenshotData ? (
                <div className="space-y-4">
                  {screenshotData?.data?.data?.screenshotPeer ? (
                    <img
                      src={screenshotData?.data?.data?.screenshotPeer}
                      alt="Transaction Screenshot"
                      className="w-full h-auto rounded-lg border"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No screenshot available for this transaction</p>
                    </div>
                  )}
                  {screenshotData.message && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">{screenshotData.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Failed to load screenshot</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Tier Modal */}
      {/* {showAssignTier && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Assign Tier</h2>
                <p className="text-gray-600 text-sm mt-1">Assign tier to {assignTierUser?.clientName}</p>
              </div>
              <button onClick={closeAssignTierModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tier
              </label>
              <select
                value={selectedTierId}
                onChange={(e) => setSelectedTierId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select a tier</option>
                {tiers.map((tier) => (
                  <option key={tier._id} value={tier._id}>
                    {tier.teirName} - ₹{parseInt(tier.teir_transaction_amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button onClick={closeAssignTierModal} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button 
                onClick={assignTierToUser} 
                disabled={assignTierLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
              >
                {assignTierLoading ? 'Assigning...' : 'Assign Tier'}
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Add Manual Bonus Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Manual Bonus</h2>
                <p className="text-gray-600 text-sm mt-1">Add bonus for {bonusUser?.clientName}</p>
              </div>
              <button onClick={closeBonusModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus Amount
              </label>
              <input
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                placeholder="Enter bonus amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark
              </label>
              <input
                type="text"
                value={bonusRemark}
                onChange={(e) => setBonusRemark(e.target.value)}
                placeholder="add manual bonus"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={closeBonusModal} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={addManualBonus} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                Add Bonus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;