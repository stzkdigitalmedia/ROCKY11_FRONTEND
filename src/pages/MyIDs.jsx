import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PasswordInput from '../components/PasswordInput';
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

// Safe localStorage for mobile compatibility
const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return false;
  },
  getItem: (key) => {
    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return null;
  },
  removeItem: (key) => {
    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return false;
  }
};

const MyIDs = ({
  games = [],
  subAccounts = [],
  setFormData,
  formData,
  setShowCreateId,
}) => {
  const [activeTab, setActiveTab] = useState("createId");
  const [localGames, setLocalGames] = useState([]);
  const [showCreateIdLocal, setShowCreateIdLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idCreated, setIdCreated] = useState(false);
  const [localFormData, setLocalFormData] = useState({
    gameId: '',
    clientName: '',
    password: '',
    phone: ''
  });
  const [localSubAccounts, setLocalSubAccounts] = useState([]);
  const [subAccountsLoading, setSubAccountsLoading] = useState(false);
  const [selectedSubUser, setSelectedSubUser] = useState(null);
  const [showSubUserWithdraw, setShowSubUserWithdraw] = useState(false);
  const [showSubUserDeposit, setShowSubUserDeposit] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [subUserBalance, setSubUserBalance] = useState(0);
  const [subUserBalanceLoading, setSubUserBalanceLoading] = useState(false);
  const [transactionProcessing, setTransactionProcessing] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [subUserWithdrawForm, setSubUserWithdrawForm] = useState({ amount: '', selectedBankId: '' });
  const [subUserDepositForm, setSubUserDepositForm] = useState({ amount: '' });
  const [resetPasswordForm, setResetPasswordForm] = useState({ newPassword: '' });
  const { user } = useAuth();
  const toast = useToastContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const createBalanceLog = async (userId) => {
    try {
      await apiHelper.post('/balance/createBalanceLog', { userId });
    } catch (error) {
      console.error('Failed to create balance log:', error);
    }
  };

  const fetchSubUserBalance = async (subAccountId) => {
    setSubUserBalanceLoading(true);
    try {
      const response = await apiHelper.get(`/balance/getBalanceLogBySubUserId/${subAccountId}`);
      const logData = response?.data || response || [];
      const latestLog = Array.isArray(logData) ? logData[0] : logData;

      if (latestLog?.status === 'Accept') {
        setSubUserBalance(latestLog?.CurrentBalance || 0);
        setSubUserBalanceLoading(false);
      } else {
        setTimeout(() => fetchSubUserBalance(subAccountId));
      }
    } catch (error) {
      console.error('Failed to fetch sub-user balance:', error);
      setSubUserBalance(0);
      setSubUserBalanceLoading(false);
    }
  };

  const handleSubUserWithdraw = async (e) => {
    e.preventDefault();
    setTransactionProcessing(true);

    try {
      const payload = {
        subUserId: selectedSubUser?.id || selectedSubUser?._id,
        amount: parseFloat(subUserWithdrawForm.amount),
        mode: 'Wallet',
        role: 'SubUser'
      };

      await apiHelper.post('/transaction/withdrawAmountRequest_ForSubUser', payload);
      toast.info('Withdrawal request submitted successfully please check history!');
      setShowSubUserWithdraw(false);
      setSubUserWithdrawForm({ amount: '', selectedBankId: '' });
      setSelectedSubUser(null);
    } catch (error) {
      toast.error('Failed to submit withdrawal request: ' + error.message);
    } finally {
      setTransactionProcessing(false);
    }
  };

  const checkTransactionStatus = async (subAccountId) => {
    try {
      const response = await apiHelper.get(`/transaction/latest-transaction/${subAccountId}`);
      const transaction = response?.data || response;

      if (transaction?.status === 'Accept') {
        toast.success('Your transaction successful!');
        setTransactionProcessing(false);
        setShowSubUserDeposit(false);
        setSubUserDepositForm({ amount: '' });
        setSelectedSubUser(null);
      } else {
        setTimeout(() => checkTransactionStatus(subAccountId), 1000);
      }
    } catch (error) {
      console.error('Failed to check transaction status:', error);
      setTransactionProcessing(false);
    }
  };

  const handleSubUserDeposit = async (e) => {
    e.preventDefault();
    setTransactionProcessing(true);

    try {
      const payload = {
        subUserId: selectedSubUser?.id || selectedSubUser?._id,
        amount: parseFloat(subUserDepositForm.amount),
        mode: 'Wallet',
        role: 'SubUser'
      };

      await apiHelper.post('/transaction/depositAmountRequest_ForSubUser', payload);
      checkTransactionStatus(selectedSubUser?.id || selectedSubUser?._id);
    } catch (error) {
      toast.error('Failed to submit deposit request: ' + error.message);
      setTransactionProcessing(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const commonPasswords = ['Abcd@1234', 'Password@123', 'Admin@123', 'Test@1234', 'User@1234'];
    const hasSequentialPattern = /abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i.test(password);
    return regex.test(password) && !commonPasswords.includes(password) && !hasSequentialPattern;
  };

  const checkPasswordResetStatus = async (clientName) => {
    try {
      const response = await apiHelper.get(`/password/get-latestPassword-change-by-clientName/${clientName}`);
      const passwordChange = response?.data || response;

      if (passwordChange?.status === 'Completed') {
        toast.success('Password reset completed successfully!');
        setResetPasswordLoading(false);
        setShowResetPassword(false);
        setResetPasswordForm({ newPassword: '' });
        setSelectedSubUser(null);
        fetchSubAccounts();
      } else {
        setTimeout(() => checkPasswordResetStatus(clientName), 2000);
      }
    } catch (error) {
      console.error('Failed to check password reset status:', error);
      setResetPasswordLoading(false);
    }
  };

  // const handleResetPassword = async (e) => {
  //   e.preventDefault();
  //   setResetPasswordLoading(true);

  //   try {
  //     if (resetPasswordForm.newPassword.includes(' ')) {
  //       toast.error('Password cannot contain spaces');
  //       setResetPasswordLoading(false);
  //       return;
  //     }

  //     if (!validatePassword(resetPasswordForm.newPassword)) {
  //       toast.error('Password must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character. Avoid common passwords and sequential patterns');
  //       setResetPasswordLoading(false);
  //       return;
  //     }

  //     const payload = {
  //       subUserId: selectedSubUser?.id || selectedSubUser?._id,
  //       clientName: selectedSubUser?.clientName,
  //       newPassword: resetPasswordForm.newPassword
  //     };

  //     await apiHelper.post('/password/create-password-change-log', payload);
  //     toast.success('Password reset request submitted successfully!');
  //     setResetPasswordLoading(false);
  //     setShowResetPassword(false);
  //     setResetPasswordForm({ newPassword: '' });
  //     setSelectedSubUser(null);
  //     checkPasswordResetStatus(selectedSubUser?.clientName);
  //   } catch (error) {
  //     toast.error('Failed to reset password: ' + error.message);
  //     setResetPasswordLoading(false);
  //   }
  // };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetPasswordLoading(true);

    try {
      let finalPassword = resetPasswordForm.newPassword;

      // ✅ LOTUSBOOK default password
      if (selectedSubUser?.gameName === 'LOTUSBOOK') {
        finalPassword = 'Lotu@1255';
      } else {
        if (finalPassword.includes(' ')) {
          toast.error('Password cannot contain spaces');
          setResetPasswordLoading(false);
          return;
        }

        if (!validatePassword(finalPassword)) {
          toast.error(
            'Password must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character'
          );
          setResetPasswordLoading(false);
          return;
        }
      }

      const payload = {
        subUserId: selectedSubUser?.id || selectedSubUser?._id,
        clientName: selectedSubUser?.clientName,
        newPassword: finalPassword,
      };

      await apiHelper.post('/password/create-password-change-log', payload);

      toast.success('Password reset request submitted successfully!');
      setShowResetPassword(false);
      setResetPasswordForm({ newPassword: '' });
      setSelectedSubUser(null);

      checkPasswordResetStatus(selectedSubUser?.clientName);
    } catch (error) {
      toast.error('Failed to reset password: ' + error.message);
    } finally {
      setResetPasswordLoading(false);
    }
  };


  const fetchSubAccounts = async () => {
    setSubAccountsLoading(true);
    try {
      const response = await apiHelper.get('/subAccount/getSubAccounts?page=1&limit=50');
      const accountsList = response?.subAccounts || response?.data || response || [];
      const filteredAccounts = accountsList.filter(account => account.status !== 'Reject');
      setLocalSubAccounts(filteredAccounts);
    } catch (error) {
      console.error('Failed to fetch sub accounts:', error);
      toast.error('Failed to fetch sub accounts: ' + error.message);
    } finally {
      setSubAccountsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const [gamesResponse, panelsResponse] = await Promise.all([
        apiHelper.get('/game/getAllGamesWithPagination?page=1&limit=50'),
        apiHelper.get('/panel/getAllPanels?page=1&limit=10')
      ]);

      const gamesList = gamesResponse.games || gamesResponse.data || gamesResponse || [];
      const panelsData = panelsResponse.data?.panels || panelsResponse.panels || panelsResponse.data || panelsResponse || [];

      const activePanels = panelsData.filter(panel => panel?.isActive === true);
      const activeGameNames = [...new Set(activePanels.map(panel => panel.panelName || panel.name))];
      const availableGames = gamesList.filter(game =>
        activeGameNames.includes(game.name) && (game.status || game.isActive)
      );

      setLocalGames(availableGames);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setLocalGames([]);
    }
  };

  const checkIdCreationStatus = async (subAccountId) => {
    try {
      const response = await apiHelper.get(`/subAccount/latest-sub-user/${subAccountId}`);
      const transaction = response?.data?.status;

      if (transaction === 'Accept') {
        setIdCreated(true);
        setTimeout(() => {
          setLoading(false);
          setShowCreateIdLocal(false);
          setIdCreated(false);
          setLocalFormData({
            gameId: localFormData.gameId,
            clientName: '',
            password: '',
            phone: ''
          });
          fetchSubAccounts();
        }, 2000);
        return;
      } else {
        setTimeout(() => checkIdCreationStatus(subAccountId), 2000);
      }
    } catch (error) {
      console.error('Failed to check ID creation status:', error);
      setLoading(false);
    }
  };

  const handleCreateId = async (e) => {
    e.preventDefault();

    if (localFormData.clientName.length > 6) {
      toast.error('Client name must be maximum 6 characters');
      return;
    }

    if (localFormData.clientName.includes(' ')) {
      toast.error('Client name cannot contain spaces');
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(localFormData.clientName)) {
      toast.error('Client name can only contain letters and numbers');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        gameId: localFormData.gameId,
        clientName: localFormData.clientName,
        phone: user?.phone || ''
      };

      const response = await apiHelper.post('/subAccount/createSubAccount', payload);
      const createdAccount = response?.data || response;
      const subAccountId = createdAccount?.id || createdAccount?._id;

      if (subAccountId) {
        checkIdCreationStatus(subAccountId);
      } else {
        toast.success('ID created successfully!');
        setLoading(false);
        setShowCreateIdLocal(false);
        setLocalFormData({
          gameId: localFormData.gameId,
          clientName: '',
          password: '',
          phone: ''
        });
        fetchSubAccounts();
      }
    } catch (error) {
      toast.error('Failed to create ID: ' + error.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setLocalFormData({ ...localFormData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchGames();
    fetchSubAccounts();

    // Check localStorage for active tab
    const savedTab = safeLocalStorage.getItem('myIdsActiveTab');
    if (savedTab === 'myIds') {
      setActiveTab('myIds');
    }
  }, []);

  return (
    <div className="bg-[#0e0e0e]">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Fixed Top Tabs */}
      <div className="fixed top-[95px] mx-auto max-w-[769px] left-0 right-0 z-40 bg-[#0e0e0e] px-3 sm:px-5 py-3 text-white">
        <div className="max-w-[769px] mx-auto">
          <div className="flex bg-[#0e0e0e] gap-2 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveTab("myIds")}
              className={`flex-1 py-2 sm:py-3 text-sm font-semibold rounded-xl transition ${activeTab === "myIds"
                ? "bg-[#1f1f1f] border-b-2 border-[#005993]"
                : "text-gray-400 bg-[#161616]"
                }`}
            >
              MY IDs ({(localSubAccounts.length > 0 ? localSubAccounts : subAccounts).length})
            </button>

            <button
              onClick={() => {
                safeLocalStorage.removeItem('myIdsActiveTab');
                setActiveTab("createId");
              }}
              className={`flex-1 py-2 sm:py-3 text-sm font-semibold rounded-xl transition ${activeTab === "createId"
                ? "bg-[#1f1f1f] border-b-2 border-[#005993]"
                : "text-gray-400 bg-[#161616]"
                }`}
            >
              CREATE ID
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-[160px] sm:pt-[170px] pb-20 min-h-screen bg-[#0e0e0e] p-3 sm:px-5 max-w-[769px] mx-auto text-white">
        {/* ================= CREATE ID ================= */}
        {activeTab === "createId" && (
          <>
            {/* CREATE ID LIST */}
            <div className="space-y-3">
              {(localGames.length > 0 ? localGames : games).sort((a, b) => a.name.localeCompare(b.name)).map((game) => (
                <div
                  key={game.id || game._id}
                  className="flex items-center justify-between
                bg-[#1b1b1b] rounded-xl p-4
                shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    {/* LOGO */}
                    <div className="w-12 h-12 rounded-full bg-black overflow-hidden flex items-center justify-center">
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs">LOGO</span>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div>
                      <p className="font-semibold text-sm">
                        {game.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {game.gameUrl && game.gameUrl.length > 21
                          ? `${game.gameUrl.substring(0, 21)}...`
                          : game.gameUrl}
                      </p>

                      {game.trending && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
                          🏆 Trending
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <button
                    onClick={() => {
                      setLocalFormData({ ...localFormData, gameId: game.id || game._id });
                      setShowCreateIdLocal(true);
                    }}
                    className="px-5 py-1.5 rounded-xl
                  bg-[#005993]
                  text-sm font-semibold transition"
                  >
                    Create
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= MY IDS ================= */}
        {activeTab === "myIds" && (
          <>
            {subAccountsLoading ? (
              <div className="bg-[#1b1b1b] rounded-xl p-8 text-center text-gray-400">
                Loading IDs...
              </div>
            ) : (localSubAccounts.length > 0 ? localSubAccounts : subAccounts).length === 0 ? (
              <div className="bg-[#1b1b1b] rounded-xl p-8 text-center text-gray-400">
                No IDs found
              </div>
            ) : (
              <div className="space-y-3">
                {(localSubAccounts.length > 0 ? localSubAccounts : subAccounts).map((acc) => (
                  <div
                    key={acc.id || acc._id}
                    className="flex justify-between items-center bg-[#1b1b1b] align-middle rounded-xl p-4 cursor-pointer
                  shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                    onClick={() => {
                      safeLocalStorage.setItem('myIdsActiveTab', 'myIds');
                      const subAccId = acc.id || acc._id;
                      navigate(`/id-details/${subAccId}`);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 overflow-hidden rounded-full bg-black flex items-center justify-center">
                          <img src={acc.gameId?.image} alt="" />
                        </div>
                        <div className="text-wrap">
                          <p className="text-xs text-gray-300 text-wrap underline">
                            {acc.gameId?.gameUrl && acc.gameId.gameUrl.length > 17
                              ? `${acc.gameId.gameUrl.substring(0, 17)}...`
                              : acc.gameId?.gameUrl}
                          </p>
                          <p className="text-xs text-gray-300">
                            {acc?.clientName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (acc.status !== 'Accept') return;
                          setSelectedSubUser(acc);
                          setShowSubUserDeposit(true);
                        }}
                        disabled={acc.status !== 'Accept'}
                        className={`rounded-full w-8 h-8 text-xs ${
                          acc.status === 'Accept'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        D
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (acc.status !== 'Accept') return;
                          setSelectedSubUser(acc);
                          await createBalanceLog(acc?.id || acc?._id);
                          setShowSubUserWithdraw(true);
                          fetchSubUserBalance(acc?.id || acc?._id);
                        }}
                        disabled={acc.status !== 'Accept'}
                        className={`rounded-full w-8 h-8 text-xs ${
                          acc.status === 'Accept'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        W
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (acc.status !== 'Accept') return;
                          setSelectedSubUser(acc);
                          setShowResetPassword(true);
                        }}
                        disabled={acc.status !== 'Accept'}
                        className={`rounded-full w-8 h-8 text-xs ${
                          acc.status === 'Accept'
                            ? 'bg-[#005993] hover:bg-[#0b5689]'
                            : 'bg-gray-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        P
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create ID Modal */}
        {showCreateIdLocal && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create New ID</h2>
                  <p className="text-gray-600 text-sm mt-1">Game: {(localGames.length > 0 ? localGames : games).find(g => (g.id || g._id) === localFormData.gameId)?.name || 'Select a game'}</p>
                </div>
                <button onClick={() => setShowCreateIdLocal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {idCreated ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-green-600 mb-2">ID Created</p>
                  <p className="text-sm text-gray-600">ID Created Successfully</p>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Creating ID</p>
                  <p className="text-sm text-gray-600">Please Wait</p>
                </div>
              ) : (
                <form onSubmit={handleCreateId} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      placeholder="Enter Client Name"
                      value={localFormData.clientName}
                      onChange={handleInputChange}
                      maxLength={6}
                      className="gaming-input"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum 6 characters</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="submit" className="w-full sm:flex-1 gaming-btn">
                      Create ID
                    </button>
                    <button type="button" onClick={() => setShowCreateIdLocal(false)} className="w-full sm:flex-1 btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        {showSubUserWithdraw && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Withdraw From Sub</h2>
                  <p className="text-gray-600 text-sm mt-1">ID: {selectedSubUser?.clientName || 'N/A'}</p>
                  <div className="mt-2">
                    {subUserBalanceLoading ? (
                      <div className="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-xl shadow-sm">
                        <div className="w-5 h-5 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">Balance</span>
                          <span className="text-sm text-gray-500 animate-pulse">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl shadow-sm">
                        <span className="text-gray-700 font-medium text-sm">Balance:</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{Number(subUserBalance).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowSubUserWithdraw(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {subUserBalanceLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Loading Balance</p>
                  <p className="text-sm text-gray-600">Please wait while we fetch the current balance</p>
                </div>
              ) : (
                <form onSubmit={handleSubUserWithdraw} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={subUserWithdrawForm.amount}
                      onChange={(e) => setSubUserWithdrawForm({ ...subUserWithdrawForm, amount: e.target.value })}
                      className="gaming-input"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="submit" disabled={transactionProcessing} className="w-full sm:flex-1 gaming-btn">
                      {transactionProcessing ? 'Processing' : 'Withdraw'}
                    </button>
                    <button type="button" onClick={() => setShowSubUserWithdraw(false)} className="w-full sm:flex-1 btn-secondary">
                      Cancel
                    </button>

                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {/* transection model*/}
        {showSubUserDeposit && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Deposit To Sub</h2>
                  <p className="text-gray-600 text-sm mt-1">ID: {selectedSubUser?.clientName || 'N/A'}</p>
                </div>
                <button onClick={() => setShowSubUserDeposit(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {transactionProcessing ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Processing...</p>
                  <p className="text-sm text-gray-600">Please wait while we process your deposit</p>
                </div>
              ) : (
                <form onSubmit={handleSubUserDeposit} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={subUserDepositForm.amount}
                      onChange={(e) => setSubUserDepositForm({ ...subUserDepositForm, amount: e.target.value })}
                      className="gaming-input"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="submit" className="w-full sm:flex-1 gaming-btn">
                      Deposit
                    </button>
                    <button type="button" onClick={() => setShowSubUserDeposit(false)} className="w-full sm:flex-1 btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {/* Reset Password Modal */}
        {showResetPassword && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('resetPassword')}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    ID: {selectedSubUser?.clientName || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordForm({ newPassword: '' });
                    setSelectedSubUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resetPasswordLoading ? (
                <div className="text-center py-8">
                  <div
                    className="loading-spinner mx-auto mb-4"
                    style={{ width: '32px', height: '32px' }}
                  ></div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {t('processing')}...
                  </p>
                  <p className="text-sm text-gray-600">
                    Please wait while we process your password reset
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">

                  {/* ✅ LOTUSBOOK special case */}
                  {selectedSubUser?.gameName === 'LOTUSBOOK' ? (
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                        Confirm Password Reset
                      </h3>
                      <p className="text-sm text-yellow-700">
                        This user belongs to <b>LOTUSBOOK</b>.
                        Are you sure you want to reset the password to the default password?
                      </p>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">{t('newPassword')}</label>
                      <PasswordInput
                        name="newPassword"
                        placeholder="Example@1256"
                        value={resetPasswordForm.newPassword}
                        onChange={(e) =>
                          setResetPasswordForm({
                            ...resetPasswordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="gaming-input"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must contain 8+ characters with 1 uppercase, 1 lowercase,
                        1 number, 1 special character.
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="submit" className="w-full sm:flex-1 gaming-btn">
                      {selectedSubUser?.gameName === 'LOTUSBOOK'
                        ? 'Yes, Reset Password'
                        : t('resetPassword')}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetPasswordForm({ newPassword: '' });
                        setSelectedSubUser(null);
                      }}
                      className="w-full sm:flex-1 btn-secondary"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}


      </div>

      <BottomNavigation activePage="ids" />
    </div>
  );
};

export default MyIDs;