import React from 'react';
import { ArrowUp, ArrowDown, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PeerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  

  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    if (userRole === 'Peer') {
      navigate('/peer-login', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen fixed overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Peer Dashboard</h2>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <Link
            to="/peer-dashboard"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/peer-dashboard')
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Dashboard</span>
          </Link>

          <Link
            to="/peer/deposit"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/peer/deposit')
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowUp className="w-5 h-5" />
            Deposit
          </Link>

          <Link
            to="/peer/withdraw"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/peer/withdraw')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowDown className="w-5 h-5" />
            Withdraw
          </Link>
          <Link
            to="/peer/banks"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/peer/banks')
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Banks</span>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default PeerSidebar;
