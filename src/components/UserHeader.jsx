import { useAuth } from '../hooks/useAuth';

const UserHeader = ({ title, subtitle }) => {
  const { user } = useAuth(true);

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.clientName || 'User'}</p>
            <p className="text-xs text-gray-500">User Account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;