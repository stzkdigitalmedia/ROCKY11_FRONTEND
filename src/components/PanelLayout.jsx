import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const PanelLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();

  const menuItems = [
    { path: '/panel-dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    if (userRole === 'Panel') {
      navigate('/panel-login', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b" style={{ backgroundColor: '#1477b0' }}>
          <h2 className="text-xl font-bold text-white">Panel</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Panel Dashboard</h1>
            {/* <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user?.userName || user?.panelName}</span>
            </div> */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Available Balance: {user?.panelBalance}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default PanelLayout;
