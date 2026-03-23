import { useState } from 'react';
import { LayoutDashboard, Gamepad2, Settings, LogOut, Menu, X, Shield, FileText, History, MessageSquare, Layers, Gift, Users,BarChart2  } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'referral', label: 'Referral', icon: Users },
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'panels', label: 'Manage Panel', icon: Shield },
    { id: 'balance-logs', label: 'Balance Logs', icon: FileText },
    { id: 'transaction-history', label: 'Transaction History', icon: History },
    { id: 'transaction-logs', label: 'Transaction Logs', icon: FileText },
    { id: 'tier-management', label: 'Tier Management', icon: Layers },
    { id: 'telegram-otp', label: 'Telegram OTP', icon: MessageSquare },
    { id: 'bonuses', label: 'Bonuses', icon: Gift },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 h-screen shadow-lg transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="p-4">
          <div className="flex justify-center">
            <img src="/logo.png" alt="RRRPay" className="object-contain bg-black" />
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${activeTab === item.id
                    ? 'border'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  style={activeTab === item.id ? {
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