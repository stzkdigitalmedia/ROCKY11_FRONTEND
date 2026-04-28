import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import RoleList from '../components/RoleList';

const RoleManagement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    navigate(userRole === 'SA' || userRole === 'SubAdmin' ? '/suprime/super-admin' : '/login', { replace: true });
  };

  const handleNavigation = (tab) => {
    const routes = {
      dashboard: '/dashboard', overview: '/overview', games: '/games',
      allinreq: '/allinreq', quickpayreq: '/quickpayreq', panels: '/panels',
      'balance-logs': '/balance-logs', 'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs', 'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp', bonuses: '/sa-bonuses', referral: '/referral',
      'referral-earning': '/referral-earning', settings: '/settings',
      'role-management': '/role-management',
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="role-management" setActiveTab={handleNavigation} onLogout={handleLogout} />
      <div className="flex-1 lg:ml-64">
        <AdminHeader title="Role Management" subtitle="Manage roles and tier-based permissions" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <RoleList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
