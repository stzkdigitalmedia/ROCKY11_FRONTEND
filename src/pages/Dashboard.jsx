import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import DashboardStats from '../components/DashboardStats';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    if (userRole === 'SA' || userRole === 'SubAdmin') {
      navigate('/suprime/super-admin', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleNavigation = (tab) => {
    switch (tab) {
            case 'overview':
        navigate('/overview');
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
      case 'bonuses':
        navigate('/sa-bonuses');
        break;
      case 'referral':
        navigate('/referral');
        break;
      case 'wallet-management':
        navigate('/wallet-management');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="dashboard" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Admin Dashboard"
          subtitle="Monitor platform performance and manage users"
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <DashboardStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;