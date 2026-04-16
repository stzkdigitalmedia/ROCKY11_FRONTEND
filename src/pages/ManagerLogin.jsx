import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';

const ManagerLogin = () => {
  const [formData, setFormData] = useState({ clientName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToastContext();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await apiHelper.post('/auth/tierRole_login', formData);
      if (response) {
        const userData = response?.user || response?.data || response;
        const userRole = userData?.role || 'Manager';
        localStorage.setItem('userRole', userRole);
        login(userData);
        toast.success('Manager login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
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
        <img src="/logoforlogin.png" alt="Logo" className="w-[230px] sm:w-[250px] mx-auto mt-10 h-auto" />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Manager Login</h2>
            <p className="text-gray-600">Access Manager Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                name="clientName"
                type="text"
                placeholder="Enter client name"
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b] transition-all"
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
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b] transition-all"
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
              className="w-full bg-[#1b1b1b] text-white py-2 md:py-3 px-4 rounded-lg focus:ring-4 focus:ring-blue-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In as Manager'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#1b1b1b] text-sm font-medium">
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;
