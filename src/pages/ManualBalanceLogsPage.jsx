import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import ManualBalanceLogs from '../components/ManualBalanceLogs';

const ManualBalanceLogsPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/suprime/super-admin', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/suprime/super-admin', { replace: true });
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
      case 'user-registrations':
        navigate('/user-registrations');
        break;
      case 'no-transaction-users':
        navigate('/no-transaction-users');
        break;
      case 'deposit-transactions':
        navigate('/deposit-transactions');
        break;
      case 'withdrawal-transactions':
        navigate('/withdrawal-transactions');
        break;
      case 'all-transactions':
        navigate('/all-transactions');
        break;
      case 'transaction-history':
        navigate('/transaction-history');
        break;
      case 'transaction-logs':
        navigate('/transaction-logs');
        break;
      case 'tier-management':
        navigate('/tier-management');
        break;
      case 'telegram-otp':
        navigate('/telegram-otp');
        break;
      case 'wallet-management':
        navigate('/wallet-management');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'bonuses':
        navigate('/sa-bonuses');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="balance-logs" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Manual Balance Logs"
          subtitle="View all manual balance updates made by super admin"
        />

        <ManualBalanceLogs />
      </div>
    </div>
  );
};

export default ManualBalanceLogsPage;