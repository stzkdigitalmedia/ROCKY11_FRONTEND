import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const TierDetails = () => {
  const { tierId } = useParams();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tierInfo, setTierInfo] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showAssignTier, setShowAssignTier] = useState(false);
  const [assignTierUser, setAssignTierUser] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [assignTierLoading, setAssignTierLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const toast = useToastContext();

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
      case 'tier-management':
        navigate('/tier-management');
        break;
      default:
        break;
    }
  };

  const fetchTierUsers = async (page = 1, filter = '') => {
    setLoading(true);
    try {
      const response = await apiHelper.get(`/tier/getUsersByTier/${tierId}?page=${page}&limit=50&filter=${filter}`);
      if (response?.data) {
        setUsers(response.data.users || []);
        setTierInfo(response.data.tier || null);
        setTotalUsers(response.data.totalUsers || 0);
        setCurrentPage(response.data.currentPage || page);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to fetch tier users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    try {
      const response = await apiHelper.get('/tier/getAllTiers_WithoutPagination');
      const tiersData = response?.data?.tiers || response?.tiers || [];
      setTiers(Array.isArray(tiersData) ? tiersData : []);
    } catch (error) {
      toast.error('Failed to fetch tiers');
      setTiers([]);
    }
  };

  const assignTierToUser = async () => {
    if (!selectedTierId || !assignTierUser) {
      toast.error('Please select a tier');
      return;
    }

    setAssignTierLoading(true);
    try {
      const payload = {
        teirId: selectedTierId,
        userId: assignTierUser._id || assignTierUser.id
      };
      await apiHelper.post('/tier/assignTierTo_SingleUser', payload);
      toast.success('Tier assigned successfully!');
      closeAssignTierModal();
      fetchTierUsers();
    } catch (error) {
      toast.error('Failed to assign tier: ' + error.message);
    } finally {
      setAssignTierLoading(false);
    }
  };

  const openAssignTierModal = (user) => {
    setAssignTierUser(user);
    setSelectedTierId('');
    setShowAssignTier(true);
    document.body.classList.add('modal-open');
    fetchTiers();
  };

  const closeAssignTierModal = () => {
    setShowAssignTier(false);
    setAssignTierUser(null);
    setSelectedTierId('');
    document.body.classList.remove('modal-open');
  };

  useEffect(() => {
    if (tierId) {
      fetchTierUsers(currentPage, searchFilter);
    }
  }, [tierId, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="tier-management" setActiveTab={handleNavigation} onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          title="Tier Details" 
          subtitle="View users in this tier" 
        />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/tier-management')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tier Management
            </button>
          </div>

          {tierInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{tierInfo.teirName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Transaction Amount</p>
                  <p className="text-xl font-bold text-blue-600">₹{parseInt(tierInfo.teir_transaction_amount).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Max Transactions</p>
                  <p className="text-xl font-bold text-green-600">{tierInfo.teir_no_of_transaction}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold text-purple-600">{users.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Users in this Tier</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {totalUsers} Users
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by client name or phone..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchTierUsers(1, searchFilter);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
                  <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-500">No users are assigned to this tier yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Tier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr key={user._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.clientName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => openAssignTierModal(user)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <UserPlus className="w-3 h-3" />
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && users.length > 0 && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Tier Modal */}
      {showAssignTier && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Tier</h3>
              <button
                onClick={closeAssignTierModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Assign tier to: <span className="font-medium text-gray-900">{assignTierUser?.clientName}</span>
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tier
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a tier...</option>
                  {Array.isArray(tiers) && tiers.map((tier) => (
                    <option key={tier._id} value={tier._id}>
                      {tier.teirName} - ₹{parseInt(tier.teir_transaction_amount).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closeAssignTierModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={assignTierToUser}
                  disabled={assignTierLoading || !selectedTierId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {assignTierLoading ? 'Assigning...' : 'Assign Tier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierDetails;