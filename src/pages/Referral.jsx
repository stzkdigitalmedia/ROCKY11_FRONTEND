import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiHelper } from '../utils/apiHelper';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import ReferralDashboardStats from '../components/ReferralDashboardStats';
import { useState, useEffect } from 'react';

const Referral = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [branchNames, setBranchNames] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    fetchBranchNames();
  }, []);

  const fetchBranchNames = async () => {
    try {
      const response = await apiHelper.get('/referal/getUniqueBranchNames');
      setBranchNames(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch branch names:', error);
    }
  };


  const handleLogout = async () => {
    const userRole = localStorage.getItem('userRole') || user?.role;
    await logout();
    if (userRole === 'SA' || userRole === 'SubAdmin') {
      navigate('/suprime/super-admin', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleNavigation = (tab) => {
    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        break;
            case 'overview':
        navigate('/overview');
        break;
      case 'games':
        navigate('/games');
        break;
      case 'allinreq':
        navigate('/allinreq');
        break;
      case 'panels':
        navigate('/panels');
        break;
      case 'user-registrations':
        navigate('/user-registrations');
        break;
      case 'no-transaction-users':
        navigate('/no-transaction-users');
        break;
      case 'deposit-transactions':
        navigate('/deposit-transactions');
        break;
      case 'withdrawal-transactions':
        navigate('/withdrawal-transactions');
        break;
      case 'all-transactions':
        navigate('/all-transactions');
        break;
      case 'balance-logs':
        navigate('/balance-logs');
        break;
      case 'transaction-history':
        navigate('/transaction-history');
        break;
      case 'transaction-logs':
        navigate('/transaction-logs');
        break;
      case 'tier-management':
        navigate('/tier-management');
        break;
      case 'telegram-otp':
        navigate('/telegram-otp');
        break;
      case 'bonuses':
        navigate('/sa-bonuses');
        break;
      case 'referral':
        navigate('/referral');
        break;
      case 'wallet-management':
        navigate('/wallet-management');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="referral" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Referral Management"
          subtitle="Monitor referral performance and manage users"
        />

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Branch Select */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900"></h1>
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[150px] text-gray-900"
              >
                <option value="" className="text-gray-500">Select Referrals</option>
                {branchNames.map((branch, index) => (
                  <option key={index} value={branch} className="text-gray-900">
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ReferralDashboardStats selectedReferralCode={selectedBranch} />
        </div>
      </div>
    </div>
  );
};

export default Referral;