import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiHelper } from '../utils/apiHelper';
import { useAuth } from '../hooks/useAuth';
import { useToastContext } from '../App';

import PasswordInput from './PasswordInput';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    loginType: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    phone: '',
    otp: '',
    newPassword: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e?.target?.name]: e?.target?.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiHelper.post('/auth/login', formData);

      const userData = response?.user || response?.data || response;
      const userRole = userData?.role || userData?.userType || 'User';

      // Save user role to localStorage
      localStorage.setItem('userRole', userRole);

      // Backend sets cookie automatically, just update state
      login(userData);

      toast.success('Login successful!');

        // Set announcement flag BEFORE navigation
      sessionStorage.setItem('showAnnouncement', 'true');

      // Set announcement flag BEFORE navigation
      sessionStorage.setItem('showAnnouncement', 'true');

      // Navigate based on role
      if (userRole === 'SA' || userRole === 'SubAdmin') {
        navigate('/dashboard', { replace: true });
      } else if (userRole === 'Peer') {
        navigate('/peer-dashboard', { replace: true });
      } else if (userRole === 'Panel') {
        navigate('/panel-dashboard', { replace: true });
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    } catch (error) {
      toast.error('Login failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async () => {
    if (!forgotPasswordData.phone || forgotPasswordData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(true);
    try {
      const payload = { phone: forgotPasswordData.phone };
      await apiHelper.post('/sms/sendOtp_sms_for_forgot_password', payload);
      setOtpSent(true);
      setCountdown(30);
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send OTP: ' + (error?.message || 'Unknown error'));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const payload = {
        phone: forgotPasswordData.phone,
        otp: forgotPasswordData.otp,
        newPassword: forgotPasswordData.newPassword
      };
      await apiHelper.post('/user/forgotPassword_of_MainUser', payload);
      toast.success('Password reset successfully!');
      setShowForgotPassword(false);
      setForgotPasswordData({ phone: '', otp: '', newPassword: '' });
      setOtpSent(false);
      setCountdown(0);
    } catch (error) {
      toast.error('Password reset failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col max-w-[769px] mx-auto items-center justify-start p-4">
      <div className="text-center mb-6 max-w-md w-full mt-3">
        <img src="/logoforlogin.png" alt="Logo" className="w-[230px] sm:w-[250px] h-auto mx-auto" />
      </div>

      {!showForgotPassword && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden !mx-10 min-w-xs md:w-[400px]">
          <div className="p-6 md:p-8">

            {!showForgotPassword && (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number or Username
                  </label>
                  <input
                    name="loginType"
                    type="text"
                    placeholder="Enter your phone number or username"
                    value={formData.loginType}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 transition-all"
                    style={{
                      '--tw-ring-color': '#1477b0',
                      fontSize: '14px',
                      '::placeholder': {
                        fontSize: '12px'
                      }
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <PasswordInput
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 transition-all"
                    style={{
                      '--tw-ring-color': '#1477b0',
                      fontSize: '14px',
                      '::placeholder': {
                        fontSize: '12px'
                      }
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1b1b1b] text-white py-2 md:py-3 px-4 rounded-lg font-semibold focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

            )}

            {!showForgotPassword && (
              <div className="mt-4 md:mt-6 text-center space-y-2">
                <Link to="/register" className="w-full text-white py-2 md:py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center bg-[#1b1b1b]">
                  Register
                </Link>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[#1b1b1b] text-sm font-medium"
                >
                  Forgot Password?
                </button>
                <p className="text-gray-500 text-xs md:text-sm">
                  Gaming Platform Management System
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <form onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={forgotPasswordData.phone}
                    onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendForgotOtp}
                    disabled={!forgotPasswordData.phone || forgotPasswordData.phone.length !== 10 || sendingOtp || countdown > 0}
                    className="w-full mt-2 px-4 py-2 bg-[#1b1b1b] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    {sendingOtp ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>

                {otpSent && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OTP
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={forgotPasswordData.otp}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, otp: e.target.value })}
                        maxLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={forgotPasswordData.newPassword}
                          onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordData({ phone: '', otp: '', newPassword: '' });
                    setOtpSent(false);
                    setCountdown(0);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {otpSent && (
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 px-4 py-2 bg-[#1b1b1b] text-white rounded-lg disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;