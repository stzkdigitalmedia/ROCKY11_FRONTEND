import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import ReferralDashboardStats from '../components/ReferralDashboardStats';

const ManualDash = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    navigate(userRole === 'SA' || userRole === 'SubAdmin' ? '/suprime/super-admin' : '/login', { replace: true });
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard', 'manual-dash': '/manual-dash', overview: '/overview',
      games: '/games', allinreq: '/allinreq', quickpayreq: '/quickpayreq',
      panels: '/panels', 'balance-logs': '/balance-logs',
      'transaction-history': '/transaction-history', 'transaction-logs': '/transaction-logs',
      'tier-management': '/tier-management', 'telegram-otp': '/telegram-otp',
      bonuses: '/sa-bonuses', referral: '/referral', notifications: '/notifications',
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="manual-dash" setActiveTab={handleNavigation} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Manual Dash" subtitle="Referral dashboard with ADMIN code" />
        <div className="p-4 sm:p-6 lg:p-8">
          <ReferralDashboardStats selectedReferralCode="ADMIN" />
        </div>
      </div>
    </div>
  );
};

export default ManualDash;
