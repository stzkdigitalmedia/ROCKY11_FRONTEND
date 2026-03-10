import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToastContext } from '../App';
import { apiHelper } from '../utils/apiHelper';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';
import { useAuth } from '../hooks/useAuth';

const SimpleRegister = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    clientName: '',
    password: '',
    phone: '',
    referralCode: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isReferralReadonly, setIsReferralReadonly] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/user-dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location?.search);
    const branchName = urlParams?.get('branchname');

    if (branchName) {
      setFormData(prev => ({ ...prev, referralCode: branchName }));
      setIsReferralReadonly(true);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e?.target?.name]: e?.target?.value });
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData?.clientName?.length > 6) {
      toast.error('Username must be maximum 6 characters');
      return;
    }
    
    if (formData?.clientName?.includes(' ')) {
      toast.error('Username cannot contain spaces');
      return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(formData?.clientName)) {
      toast.error('Username can only contain letters and numbers');
      return;
    }
    
    if (formData?.password?.includes(' ')) {
      toast.error('Password cannot contain spaces');
      return;
    }
    
    if (!validatePassword(formData?.password)) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);

    // try {
    //   // First verify branch
    //   const verifyResponse = await fetch(`https://www.powerdreams.co/api/online/user/verifyBranch/Rockybook}`);
    //   const verifyData = await verifyResponse.json();

    //   if (verifyData.success == false) {
    //     toast.error(verifyData.message || 'Invalid referral code');
    //     setLoading(false);
    //     return;
    //   }

      // If verification successful, proceed with registration
      try {
        const payload = {
          clientName: formData?.clientName,
          password: formData?.password,
          phone: formData?.phone,
          branchName: "Rockybook",
          otp: formData?.otp
        };

        const response = await apiHelper.post('/auth/userRegister', payload);
        toast.success('Registration successful! Please login.');

        // Auto login after successful registration
        try {
          const loginPayload = {
            loginType: formData?.phone,
            password: formData?.password,
          };

          const loginResponse = await apiHelper.post('/auth/login', loginPayload);
          if (loginResponse) {
            navigate('/user-dashboard');
          }
        } catch (loginError) {
          toast.error('Registration successful but auto-login failed: ' + (loginError?.message || 'Please login manually'));
        }
      } catch (error) {
        toast.error('Registration failed: ' + (error?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }

    // } catch (error) {
    //   toast.error('Registration failed: ' + error.message);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSendOtp = async () => {
    // Validate all required fields
    if (!formData.clientName.trim()) {
      toast.error('Please enter username');
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error('Please enter password');
      return;
    }
    
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    // Validate username format
    if (formData.clientName.length > 6) {
      toast.error('Username must be maximum 6 characters');
      return;
    }
    
    if (formData.clientName.includes(' ')) {
      toast.error('Username cannot contain spaces');
      return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(formData.clientName)) {
      toast.error('Username can only contain letters and numbers');
      return;
    }
    
    // Validate password
    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (formData.password.includes(' ')) {
      toast.error('Password cannot contain spaces');
      return;
    }

    setSendingOtp(true);
    try {
      const payload = {
        phone: formData.phone
      };
      
      await apiHelper.post('/sms/send-otp', payload);
      setOtpSent(true);
      setCountdown(30);
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error('Failed to send OTP: ' + error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-10 max-w-[769px] mx-auto bg-[#0e0e0e]">
      <div className="text-center mb-6 max-w-md w-full">
        <img src="/logoforlogin.png" alt="Logo" className="w-[230px] mt-2 sm:mt-0 sm:w-[250px] mx-auto h-auto" />
      </div>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        <div className="p-6 md:p-8">


          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                name="clientName"
                placeholder="Enter username (max 6 chars)"
                value={formData.clientName}
                onChange={handleChange}
                maxLength={6}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b] transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 6 characters, only letters and numbers allowed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Example@1256"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <PhoneInput 
                value={formData.phone} 
                onChange={(value) => setFormData({...formData, phone: value})} 
                placeholder="Enter mobile number"
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b] transition-all"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!formData.clientName.trim() || !formData.password.trim() || !formData.phone || formData.phone.length !== 10 || sendingOtp || countdown > 0}
                className="w-full mt-2 px-4 py-2 md:py-3 bg-[#1b1b1b] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                {sendingOtp ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b] transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <input
                name="referralCode"
                placeholder="Enter referral code"
                value="Rockybook"
                onChange={handleChange}
                readOnly={isReferralReadonly}
                // className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${isReferralReadonly ? '*/bg-gray-200 cursor-not-allowed' : ''}`}
                className={`w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b1b1b] transition-all bg-gray-200 cursor-not-allowed`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b1b1b] text-white py-2 md:py-3 px-4 rounded-lg font-semibold focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center">
              {loading ? (
                <><span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>Creating Account...</>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-4 md:mt-6 text-center space-y-2">
            <Link to="/login" className="w-full bg-[#1b1b1b] text-white py-2 md:py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center">
              Login
            </Link>
            <p className="text-gray-500 text-xs md:text-sm">
              Gaming Platform Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRegister;