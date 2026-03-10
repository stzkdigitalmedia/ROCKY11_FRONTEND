import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Debug logging
  
  if (loading) {
    return (
      <div className="h-screen bg-[#0e0e0e] max-w-[769px] mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
          <p className="text-gray-600 text-lg">loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;