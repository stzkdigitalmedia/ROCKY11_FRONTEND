import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import TransactionLogs from '../components/TransactionLogs';

const TransactionLogsPage = () => {
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
      case 'balance-logs':
        navigate('/balance-logs');
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
      <Sidebar activeTab="transaction-logs" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Transaction Logs"
          subtitle="View all transaction status change logs"
        />

        <TransactionLogs />
      </div>
    </div>
  );
};

export default TransactionLogsPage;