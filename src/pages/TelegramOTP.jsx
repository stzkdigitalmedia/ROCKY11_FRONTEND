import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { useToastContext } from '../App';
import { Send, MessageCircle } from 'lucide-react';

const TelegramOTP = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [otp, setOtp] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setGamesLoading(true);
    try {
      const response = await apiHelper.get('/game/getAllGamesWithPagination?page=1&limit=5000');
      const gamesData = response?.games || response?.data || response || [];
      setGames(Array.isArray(gamesData) ? gamesData : []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast.error('Failed to load games');
    } finally {
      setGamesLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/suprime/super-admin', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/suprime/super-admin', { replace: true });
    }
  };

  const handleNavigation = (tab) => {
    const routes = {
      'dashboard': '/dashboard',
      'games': '/games',
      'panels': '/panels',
      'balance-logs': '/balance-logs',
      'transaction-history': '/transaction-history',
      'transaction-logs': '/transaction-logs',
      'tier-management': '/tier-management',
      'telegram-otp': '/telegram-otp',
      'settings': '/settings',
      'bonuses': '/sa-bonuses'
    };
    if (routes[tab]) navigate(routes[tab]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      await apiHelper.post('/telegram/create-telegram-otp', { otp, type });
      toast.success('Telegram OTP created successfully!');
      setOtp('');
      setType('');
    } catch (error) {
      toast.error('Failed to Submit otp: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="telegram-otp" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Telegram OTP"
          subtitle="Submit otp for Telegram verification"
        />

        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="gaming-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Telegram OTP</h2>
                  <p className="text-sm text-gray-600">Submit verification code</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Panel
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    disabled={gamesLoading}
                  >
                    <option value="">{gamesLoading ? 'Loading...' : 'Select Panel'}</option>
                    {games.map((game) => (
                      <option key={game._id || game.id} value={game.name}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setOtp(value);
                      }
                    }}
                    placeholder="Enter 6 digits"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-lg tracking-widest"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  {loading ? 'Submitting...' : 'Submit OTP'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramOTP;
