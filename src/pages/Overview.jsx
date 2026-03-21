import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import OverviewStats from '../components/OverviewStats';

const Overview = () => {
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
    const routes = {
      overview: '/overview',
      dashboard: '/dashboard',
      games: '/games',
      panels: '/panels',
      'user-registrations': '/user-registrations',
      'no-transaction-users': '/no-transaction-users',
      'deposit-transactions': '/deposit-transactions',
      'withdrawal-transactions': '/withdrawal-transactions',
      'all-transactions': '/all-transactions',
      'balance-logs': '/balance-logs',
      'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs',
      'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp',
      bonuses: '/sa-bonuses',
      referral: '/referral',
      'wallet-management': '/wallet-management',
      settings: '/settings',
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="overview" setActiveTab={handleNavigation} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Overview" subtitle="Platform performance at a glance" />
        <div className="p-4 sm:p-6 lg:p-8">
          <OverviewStats />
        </div>
      </div>
    </div>
  );
};

export default Overview;
