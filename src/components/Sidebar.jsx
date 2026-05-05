import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Settings, LogOut, Menu, X, Shield, FileText, History, MessageSquare, Layers, Gift, Users, BarChart2, Zap, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const allMenuItems = [
  { id: 'dashboard',           label: 'Dashboard',            icon: LayoutDashboard, path: '/dashboard',           roles: ['SA', 'SubAdmin', 'TierRole'] },
  { id: 'manual-dash',         label: 'Manual Dash',          icon: BarChart2,       path: '/manual-dash',         roles: ['SA'] },
  { id: 'referral',            label: 'Referral',             icon: Users,           path: '/referral',            roles: ['SA', 'SubAdmin'] },
  { id: 'referral-earning',    label: 'Refer & Earn',         icon: Gift,            path: '/referral-earning',    roles: ['SA', 'SubAdmin'] },
  { id: 'role-management',     label: 'Role Management',      icon: Shield,          path: '/role-management',     roles: ['SA', 'SubAdmin'] },
  { id: 'overview',            label: 'Overview',             icon: BarChart2,       path: '/overview',            roles: ['SA', 'SubAdmin', 'TierRole'] },
  { id: 'allinreq',            label: 'Instant Payout Req',   icon: Zap,             path: '/allinreq',            roles: ['SA', 'SubAdmin', 'TierRole'] },
    {
    id: "casino",
    label: "Casino",
    icon: Gamepad2,
    path: "/casino-admin",
    roles: ["SA", "SubAdmin"],
  },
  // { id: 'quickpayreq',         label: 'QuickPay Req',         icon: Zap,             path: '/quickpayreq',         roles: ['SA', 'SubAdmin', 'TierRole'] },
  { id: 'games',               label: 'Games',                icon: Gamepad2,        path: '/games',               roles: ['SA', 'SubAdmin'] },
  { id: 'panels',              label: 'Manage Panel',         icon: Shield,          path: '/panels',              roles: ['SA', 'SubAdmin'] },
  { id: 'balance-logs',        label: 'Balance Logs',         icon: FileText,        path: '/balance-logs',        roles: ['SA', 'SubAdmin', 'TierRole'] },
  { id: 'transaction-history', label: 'Transaction History',  icon: History,         path: '/transaction-history', roles: ['SA', 'SubAdmin', 'TierRole'] },
  { id: 'transaction-logs',    label: 'Transaction Logs',     icon: FileText,        path: '/transaction-logs',    roles: ['SA', 'SubAdmin', 'TierRole'] },
  { id: 'tier-management',     label: 'Tier Management',      icon: Layers,          path: '/tier-management',     roles: ['SA', 'SubAdmin'] },
  { id: 'telegram-otp',        label: 'Telegram OTP',         icon: MessageSquare,   path: '/telegram-otp',        roles: ['SA', 'SubAdmin'] },
  { id: 'bonuses',             label: 'Bonuses',              icon: Gift,            path: '/sa-bonuses',          roles: ['SA', 'SubAdmin'] },
  { id: 'settings',            label: 'Settings',             icon: Settings,        path: '/settings',            roles: ['SA', 'SubAdmin'] },
  { id: 'notifications',       label: 'Notifications',        icon: Bell,            path: '/notifications',       roles: ['SA', 'SubAdmin'] },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  const handleClick = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
    if (setActiveTab) setActiveTab(item.id);
  };

  const isActive = (item) => {
    if (activeTab) return activeTab === item.id;
    return location.pathname === item.path;
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 h-screen shadow-lg transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="p-1">
          <div className="flex justify-center">
            <img src="/logo.png" alt="RRRPay" className="object-contain bg-black" />
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-0 rounded-lg text-left transition-all duration-300 ${isActive(item) ? 'border' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={isActive(item) ? {
                    backgroundColor: 'rgba(20, 119, 176, 0.1)',
                    color: '#1477b0',
                    borderColor: 'rgba(20, 119, 176, 0.3)'
                  } : {}}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 w-56">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
