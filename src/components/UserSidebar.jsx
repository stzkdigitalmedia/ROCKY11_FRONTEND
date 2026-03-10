import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Gamepad2, LogOut, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user-dashboard' },
    { id: 'ids', label: 'IDs', icon: Users, path: '/sub-accounts' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 h-screen shadow-lg transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Gamepad2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RRRPay</h1>
            <p className="text-xs text-gray-600">Gaming Services</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 font-medium">User Panel</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-4 w-56">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Logged in as</p>
          <p className="font-medium text-gray-900">{user?.username || 'User'}</p>
        </div>
        <button
          onClick={handleLogout}
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

export default UserSidebar;