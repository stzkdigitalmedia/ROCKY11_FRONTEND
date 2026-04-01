import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import PeerLogin from './pages/PeerLogin';
import PeerDashboard from './pages/PeerDashboard';
import PanelDashboard from './pages/PanelDashboard';
import PanelLogin from './pages/PanelLogin';
import PanelRoute from './components/PanelRoute';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import PeerBanks from './pages/PeerBanks';
import SimpleRegister from './pages/SimpleRegister';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import Settings from './pages/Settings';
import PanelManagementPage from './pages/PanelManagement';
import UserDashboard from './pages/UserDashboard';
import SubAccounts from './pages/SubAccounts';
import MyIDs from './pages/MyIDs';
import IDDetails from './pages/IDDetails';
import LandingPage from './pages/LandingPage';

import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import UserRoute from './components/UserRoute';
import PeerRoute from './components/PeerRoute';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { createContext, useContext } from 'react';
import './App.css'
import UserProfile from './pages/UserProfile';
import StatusDetails from './pages/StatusDetails';
import UserRegistrations from './pages/UserRegistrations';
import NoTransactionUsers from './pages/NoTransactionUsers';
import DepositTransactions from './pages/DepositTransactions';
import WithdrawalTransactions from './pages/WithdrawalTransactions';
import AllTransactions from './pages/AllTransactions';
import ManualBalanceLogsPage from './pages/ManualBalanceLogsPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import TransactionLogsPage from './pages/TransactionLogsPage';
import DeleteLogs from './pages/DeleteLogs';
import TodayDepositRequests from './pages/TodayDepositRequests';
import TodayWithdrawalRequests from './pages/TodayWithdrawalRequests';
import TelegramOTP from './pages/TelegramOTP';
import FTDCompleteUsers from './pages/FTDCompleteUsers';
import TierManagement from './pages/TierManagement';
import TierDetails from './pages/TierDetails';
import Passbook from './pages/Passbook';
import WhatsAppButton from './components/WhatsAppButton';
import { useAuth } from './hooks/useAuth';
import SABonuses from './pages/SABonuses';
import ActiveUsers from './pages/ActiveUsers';
import Referral from './pages/Referral';
import ReferralDepositTransactions from './pages/ReferralDepositTransactions';
import ReferralWithdrawalTransactions from './pages/ReferralWithdrawalTransactions';
import ReferralStatusDetails from './pages/ReferralStatusDetails';
import ReferralUserRegistrations from './pages/ReferralUserRegistrations';
import ReferralFTDCompleteUsers from './pages/ReferralFTDCompleteUsers';
import ReferralNoTransactionUsers from './pages/ReferralNoTransactionUsers';
import Overview from './pages/Overview';
import AllInOneReq from './pages/AllInOneReq';
import Success from './pages/Success';
import Failed from './pages/Failed';
import Pending from './pages/Pending';
import Cancel from './pages/Cancel';


const ToastContext = createContext();

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

function App() {
  const toast = useToast();
  const { user } = useAuth();
  return (
    <div className='bg-gray-300'>
      <ToastContext.Provider value={toast}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/suprime/super-admin" element={<AdminLogin />} />
            <Route path="/panel-login" element={<PanelLogin />} />
            <Route path="/peer-login" element={<PeerLogin />} />
            <Route path="/transaction/success" element={<Success />} />
            <Route path="/transaction/failed" element={<Failed />} />
            <Route path="/transaction/pending" element={<Pending />} />
            <Route path="/transaction/cancel" element={<Cancel />} />
            <Route path="/panel-dashboard" element={
              <PanelRoute>
                <PanelDashboard />
              </PanelRoute>
            } />
            <Route path="/peer-dashboard" element={
              <PeerRoute>
                <PeerDashboard />
              </PeerRoute>
            } />
            <Route path="/peer/deposit" element={
              <PeerRoute>
                <Deposit />
              </PeerRoute>
            } />
            <Route path="/allinreq" element={
              <SuperAdminRoute>
                <AllInOneReq />
              </SuperAdminRoute>
            } />
            <Route path="/quickpayreq" element={
              <SuperAdminRoute>
                <AllInOneReq />
              </SuperAdminRoute>
            } />
            <Route path="/peer/banks" element={
              <PeerRoute>
                <PeerBanks />
              </PeerRoute>
            } />
            <Route path="/peer/withdraw" element={
              <PeerRoute>
                <Withdraw />
              </PeerRoute>
            } />
            <Route path="/register/:refercode" element={<SimpleRegister />} />
            <Route path="/register" element={<SimpleRegister />} />
            <Route path="/dashboard" element={
              <SuperAdminRoute>
                <Dashboard />
              </SuperAdminRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/games" element={
              <SuperAdminRoute>
                <Games />
              </SuperAdminRoute>
            } />
            <Route path="/settings" element={
              <SuperAdminRoute>
                <Settings />
              </SuperAdminRoute>
            } />
            <Route path="/panels" element={
              <SuperAdminRoute>
                <PanelManagementPage />
              </SuperAdminRoute>
            } />
            <Route path="/status-details" element={
              <SuperAdminRoute>
                <StatusDetails />
              </SuperAdminRoute>
            } />
            <Route path="/user-registrations" element={
              <SuperAdminRoute>
                <UserRegistrations />
              </SuperAdminRoute>
            } />
            <Route path="/no-transaction-users" element={
              <SuperAdminRoute>
                <NoTransactionUsers />
              </SuperAdminRoute>
            } />
            <Route path="/deposit-transactions" element={
              <SuperAdminRoute>
                <DepositTransactions />
              </SuperAdminRoute>
            } />
            <Route path="/withdrawal-transactions" element={
              <SuperAdminRoute>
                <WithdrawalTransactions />
              </SuperAdminRoute>
            } />
            <Route path="/all-transactions" element={
              <SuperAdminRoute>
                <AllTransactions />
              </SuperAdminRoute>
            } />
            <Route path="/balance-logs" element={
              <SuperAdminRoute>
                <ManualBalanceLogsPage />
              </SuperAdminRoute>
            } />
            <Route path="/transaction-history" element={
              <SuperAdminRoute>
                <TransactionHistoryPage />
              </SuperAdminRoute>
            } />
            <Route path="/transaction-logs" element={
              <SuperAdminRoute>
                <TransactionLogsPage />
              </SuperAdminRoute>
            } />
            <Route path="/delete-logs" element={
              <SuperAdminRoute>
                <DeleteLogs />
              </SuperAdminRoute>
            } />
            <Route path="/today-deposit-requests" element={
              <SuperAdminRoute>
                <TodayDepositRequests />
              </SuperAdminRoute>
            } />
            <Route path="/today-withdrawal-requests" element={
              <SuperAdminRoute>
                <TodayWithdrawalRequests />
              </SuperAdminRoute>
            } />
            <Route path="/tier-management" element={
              <SuperAdminRoute>
                <TierManagement />
              </SuperAdminRoute>
            } />
            <Route path="/tier-details/:tierId" element={
              <SuperAdminRoute>
                <TierDetails />
              </SuperAdminRoute>
            } />
            <Route path="/telegram-otp" element={
              <SuperAdminRoute>
                <TelegramOTP />
              </SuperAdminRoute>
            } />
            <Route path="/ftd-complete-users" element={
              <SuperAdminRoute>
                <FTDCompleteUsers />
              </SuperAdminRoute>
            } />
            <Route path="/sa-bonuses" element={
              <SuperAdminRoute>
                <SABonuses />
              </SuperAdminRoute>
            } />
            <Route path="/active-users" element={
              <SuperAdminRoute>
                <ActiveUsers />
              </SuperAdminRoute>
            } />

            <Route path="/referral" element={
              <SuperAdminRoute>
                <Referral />
              </SuperAdminRoute>
            } />
            <Route path="/referral-deposit-transactions" element={
              <SuperAdminRoute>
                <ReferralDepositTransactions />
              </SuperAdminRoute>
            } />
            <Route path="/referral-withdrawal-transactions" element={
              <SuperAdminRoute>
                <ReferralWithdrawalTransactions />
              </SuperAdminRoute>
            } />
            <Route path="/referral-status-details" element={
              <SuperAdminRoute>
                <ReferralStatusDetails />
              </SuperAdminRoute>
            } />
            <Route path="/referral-user-registrations" element={
              <SuperAdminRoute>
                <ReferralUserRegistrations />
              </SuperAdminRoute>
            } />
            <Route path="/referral-ftd-complete-users" element={
              <SuperAdminRoute>
                <ReferralFTDCompleteUsers />
              </SuperAdminRoute>
            } />
            <Route path="/referral-no-transaction-users" element={
              <SuperAdminRoute>
                <ReferralNoTransactionUsers />
              </SuperAdminRoute>
            } />
            <Route path="/overview" element={
              <SuperAdminRoute>
                <Overview />
              </SuperAdminRoute>
            } />
            <Route path="/user-dashboard" element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            } />
            <Route path="/my-ids" element={
              <UserRoute>
                <MyIDs />
              </UserRoute>
            } />
            <Route path="/id-details/:subaccid" element={
              <UserRoute>
                <IDDetails />
              </UserRoute>
            } />
            <Route path="/passbook" element={
              <UserRoute>
                <Passbook />
              </UserRoute>
            } />
            <Route path="/sub-accounts" element={
              <SuperAdminRoute>
                <SubAccounts />
              </SuperAdminRoute>
            } />
            <Route path="/" element={<LandingPage />} />


          </Routes>
          <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
          {
            user?.role !== 'SA' && user?.role !== 'SubAdmin' && user?.role !== 'Panel' && user?.role !== 'Peer' && <WhatsAppButton />
          }
        </Router>
      </ToastContext.Provider>
    </div>
  );
}

export default App