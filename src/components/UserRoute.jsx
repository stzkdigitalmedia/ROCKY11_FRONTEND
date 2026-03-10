import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{ width: '32px', height: '32px' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'SA' || user.role === 'SubAdmin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role !== 'User') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserRoute;