import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const { isAuthenticated, loading, user } = useAuth();

  return (
    <>
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mb-4 mx-auto" style={{ width: '40px', height: '40px' }}></div>
            <p className="text-xl gaming-title">Loading...</p>
          </div>
        </div>
      )}
      {!loading && isAuthenticated && (
        <Navigate
          to={
            user?.role === 'SA' || user?.role === 'SubAdmin'
              ? '/dashboard'
              : user?.role === 'Peer'
                ? '/peer-dashboard'
                : user?.role === 'Panel'
                  ? '/panel-dashboard'
                  : '/user-dashboard'
          }
          replace
        />
      )}
      {!loading && !isAuthenticated && (
        <LoginForm />
      )}
    </>
  );
};

export default Login;