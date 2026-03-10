import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{width: '32px', height: '32px'}}></div>
      </div>
    );
  }

  if (!user || (user.role !== 'SA' && user.role !== 'SubAdmin')) {
    return <Navigate to="/suprime/super-admin" replace />;
  }

  return children;
};

export default SuperAdminRoute;