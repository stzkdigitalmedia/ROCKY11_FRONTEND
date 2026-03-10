import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';

const PeerLogin = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToastContext();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiHelper.post('/auth/peer_login', formData);
      
      if (response) {
        const userData = response?.user || response?.data || response;
        
        login(userData);
        toast.success('Peer login successful!');
        navigate('/peer-dashboard', { replace: true });
      }
    } catch (error) {
      toast.error('Login failed: ' + (error?.message || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-10 max-w-[769px] mx-auto bg-[#0e0e0e]">
      <div className="text-center mb-6 max-w-md w-full">
        <img src="/logoforlogin.png" alt="Logo" className="w-40 mt-2 mx-auto h-auto" />
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Peer Login</h2>
            <p className="text-gray-600">Access Peer Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Type
              </label>
              <input
                name="clientName"
                type="text"
                placeholder="Enter login type"
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter peer password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0e0e0e] text-white py-2 md:py-3 px-4 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In as Peer'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerLogin;