import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PeerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'Peer') {
    return <Navigate to="/peer-login" replace />;
  }

  return children;
};

export default PeerRoute;
