import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PanelRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{width: '32px', height: '32px'}}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/panel-login" replace />;
  }

  if (user.role !== 'Panel') {
    return <Navigate to="/panel-login" replace />;
  }

  return children;
};

export default PanelRoute;
