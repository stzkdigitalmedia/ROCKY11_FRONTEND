import { useState, useEffect } from 'react';
import { Plus, Trash2, MoreVertical, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const TierManagement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditTierModal, setShowEditTierModal] = useState(false);
  const [editTierLoading, setEditTierLoading] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editFormData, setEditFormData] = useState({
    teirName: '',
    branches: [],
    teir_transaction_amount: '',
    teir_no_of_transaction: ''
  });
  const [showDeleteTierModal, setShowDeleteTierModal] = useState(false);
  const [deleteTierLoading, setDeleteTierLoading] = useState(false);
  const [tierToDelete, setTierToDelete] = useState(null);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [addBranchLoading, setAddBranchLoading] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [newBranchData, setNewBranchData] = useState({ branchName: '', isActive: true });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [manageUsersLoading, setManageUsersLoading] = useState(false);
  const [formData, setFormData] = useState({
    teirName: '',
    branches: [{ branchName: '', isActive: true }],
    teir_transaction_amount: '',
    teir_no_of_transaction: ''
  });
  const toast = useToastContext();

  const handleTierWiseManageUsers = async () => {
    setManageUsersLoading(true);
    try {
      await apiHelper.get('/tier/updateTierWiseEligibleUsers');
      toast.success('Tier wise users managed successfully!');
    } catch (error) {
      toast.error('Failed to manage tier wise users');
    } finally {
      setManageUsersLoading(false);
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
      case 'games':
        navigate('/games');
        break;
      case 'panels':
        navigate('/panels');
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
      case 'telegram-otp':
        navigate('/telegram-otp');
        break;
      case 'bonuses':
        navigate('/sa-bonuses');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get('/tier/getAllTiers_WithoutPagination');
      if (response?.data) {
        setTiers(Array.isArray(response.data.tiers) ? response.data.tiers : []);
      } else {
        setTiers([]);
      }
    } catch (error) {
      toast.error('Failed to fetch tiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const updateTier = async () => {
    if (!editingTier) return;
    
    setEditTierLoading(true);
    try {
      await apiHelper.put(`/tier/updateTierDetails/${editingTier._id}`, editFormData);
      toast.success('Tier updated successfully!');
      setShowEditTierModal(false);
      setEditingTier(null);
      setEditFormData({ teirName: '', branches: [], teir_transaction_amount: '', teir_no_of_transaction: '' });
      fetchTiers();
    } catch (error) {
      toast.error('Failed to update tier');
    } finally {
      setEditTierLoading(false);
    }
  };

  const handleEditBranchChange = (index, field, value) => {
    const newBranches = [...editFormData.branches];
    newBranches[index][field] = value;
    setEditFormData({ ...editFormData, branches: newBranches });
  };

  const deleteTier = async () => {
    if (!tierToDelete) return;
    
    setDeleteTierLoading(true);
    try {
      await apiHelper.delete(`/tier/deleteTier/${tierToDelete._id}`);
      toast.success('Tier deleted successfully!');
      setShowDeleteTierModal(false);
      setTierToDelete(null);
      fetchTiers();
    } catch (error) {
      toast.error('Failed to delete tier');
    } finally {
      setDeleteTierLoading(false);
    }
  };

  const addBranchToTier = async () => {
    if (!selectedTierId || !newBranchData.branchName.trim()) return;
    
    setAddBranchLoading(true);
    try {
      await apiHelper.put(`/tier/addBranchToTier/${selectedTierId}`, newBranchData);
      toast.success('Branch added successfully!');
      setShowAddBranchModal(false);
      setSelectedTierId(null);
      setNewBranchData({ branchName: '', isActive: true });
      fetchTiers();
    } catch (error) {
      toast.error('Failed to add branch');
    } finally {
      setAddBranchLoading(false);
    }
  };

  const removeBranchFromTier = async () => {
    if (!branchToDelete) return;
    
    setDeleteLoading(true);
    try {
      await apiHelper.put(`/tier/removeBranchFromTier/${branchToDelete.tierId}`, {
        branchName: branchToDelete.branchName
      });
      toast.success('Branch removed successfully!');
      setShowDeleteModal(false);
      setBranchToDelete(null);
      fetchTiers();
    } catch (error) {
      toast.error('Failed to remove branch');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleTierManualStatus = async (tierId, currentStatus) => {
    try {
      await apiHelper.get(`/tier/updateTier_isManualStatus/${tierId}`);
      toast.success('Tier manual status updated successfully!');
      fetchTiers();
    } catch (error) {
      toast.error('Failed to update tier manual status');
    }
  };

  const toggleTierStatus = async (tierId) => {
    try {
      await apiHelper.get(`/tier/updateTierStatus/${tierId}`);
      toast.success('Tier status updated successfully!');
      fetchTiers();
    } catch (error) {
      toast.error('Failed to update tier status');
    }
  };

  const toggleBranchStatus = async (tierId, branchName, currentStatus) => {
    try {
      await apiHelper.put(`/tier/deactivateBranchFromTier/${tierId}`, {
        branchName: branchName
      });
      toast.success('Branch status updated successfully!');
      fetchTiers();
    } catch (error) {
      toast.error('Failed to update branch status');
    }
  };

  const addBranch = () => {
    setFormData({
      ...formData,
      branches: [...formData.branches, { branchName: '', isActive: true }]
    });
  };

  const removeBranch = (index) => {
    if (formData.branches.length > 1) {
      const newBranches = formData.branches.filter((_, i) => i !== index);
      setFormData({ ...formData, branches: newBranches });
    }
  };

  const handleBranchChange = (index, field, value) => {
    const newBranches = [...formData.branches];
    newBranches[index][field] = value;
    setFormData({ ...formData, branches: newBranches });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    
    try {
      const response = await apiHelper.post('/tier/createTier', formData);
      if (response?.success) {
        toast.success('Tier created successfully!');
        setShowCreateModal(false);
        setFormData({
          teirName: '',
          branches: [{ branchName: '', isActive: true }],
          teir_transaction_amount: '',
          teir_no_of_transaction: ''
        });
        fetchTiers();
      }
    } catch (error) {
      toast.error('Failed to create tier');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="tier-management" setActiveTab={handleNavigation} onLogout={handleLogout} />
      
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          title="Tier Management" 
          subtitle="Manage system teirs and configurations" 
        />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
                  <p className="text-gray-600 font-medium">Loading tiers...</p>
                </div>
              </div>
            ) : tiers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tiers Found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first tier</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Tier
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tier Overview</h2>
                    <p className="text-gray-600 mt-1">{tiers.length} tier{tiers.length !== 1 ? 's' : ''} configured</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTierWiseManageUsers}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      Tier Wise Manage User
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add New Tier
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {tiers.map((tier, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2"  onClick={() => navigate(`/tier-details/${tier._id}`)}>{tier.teirName}</h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700 font-medium">Amount: <span className="text-green-600 font-bold">₹{parseInt(tier.teir_transaction_amount).toLocaleString()}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-700 font-medium">Transactions: <span className="text-blue-600 font-bold">{tier.teir_no_of_transaction}</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTier(tier);
                                  setEditFormData({
                                    teirName: tier.teirName,
                                    branches: tier.branches?.map(branch => ({
                                      branchName: branch.branchName,
                                      isActive: branch.isActive
                                    })) || [],
                                    teir_transaction_amount: tier.teir_transaction_amount,
                                    teir_no_of_transaction: tier.teir_no_of_transaction
                                  });
                                  setShowEditTierModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Tier"
                              >
                                <Edit size={18} />
                              </button>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-medium text-gray-700 min-w-[45px]">Manual:</span>
                                <input
                                  type="checkbox"
                                  checked={tier.isManual || false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleTierManualStatus(tier._id, tier.isManual);
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs font-medium text-gray-700 min-w-[45px]">Active:</span>
                                <input
                                  type="checkbox"
                                  checked={tier.isActive || false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleTierStatus(tier._id);
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">Branches</h4>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTierId(tier._id);
                                setShowAddBranchModal(true);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Branch
                            </button>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                              {tier.branches?.length || 0} branch{(tier.branches?.length || 0) !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        </div>
                        
                        {tier.branches && tier.branches.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tier.branches.map((branch, branchIndex) => (
                              <div key={branchIndex} className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all duration-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 mb-2">{branch.branchName}</h5>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={branch.isActive}
                                        onChange={() => toggleBranchStatus(tier._id, branch.branchName, branch.isActive)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      <span className={`ml-3 text-sm font-medium ${
                                        branch.isActive ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                        {branch.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    </label>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setBranchToDelete({ tierId: tier._id, branchName: branch.branchName });
                                        setShowDeleteModal(true);
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove Branch"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-gray-500 font-medium">No branches configured</p>
                            <p className="text-gray-400 text-sm mt-1">Branches will appear here when added</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Tier Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Create New Tier</h3>
              <p className="text-blue-100 text-sm mt-1">Configure a new tier with transaction limits</p>
            </div>
            
            <form onSubmit={handleCreateTier} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tier Name
                </label>
                <select
                  name="teirName"
                  value={formData.teirName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 hover:bg-white"
                  required
                >
                  <option value="">Select Tier Level</option>
                  {['Tier 1', 'Tier 2', 'Tier 3','Tier 4','Tier 5','Tier 6','Tier 7','Tier 8','Tier 9','Tier 10','Tier 11','Tier 12','Tier 13','Tier 14','Tier 15'].filter(tier => !tiers.some(existingTier => existingTier.teirName === tier)).map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branches
                </label>
                <div className="space-y-3">
                  {formData.branches.map((branch, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={branch.branchName}
                        onChange={(e) => handleBranchChange(index, 'branchName', e.target.value)}
                        placeholder="Enter branch name"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                      <select
                        value={branch.isActive}
                        onChange={(e) => handleBranchChange(index, 'isActive', e.target.value === 'true')}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                      {formData.branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(index)}
                          className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBranch}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Add Branch
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Amount Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    name="teir_transaction_amount"
                    value={formData.teir_transaction_amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{ MozAppearance: 'textfield' }}
                    onWheel={(e) => e.target.blur()}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Transactions
                </label>
                <input
                  type="number"
                  name="teir_no_of_transaction"
                  value={formData.teir_no_of_transaction}
                  onChange={handleInputChange}
                  placeholder="Enter transaction limit"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{ MozAppearance: 'textfield' }}
                  onWheel={(e) => e.target.blur()}
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Tier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tier Modal */}
      {showEditTierModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Edit Tier</h3>
              <p className="text-blue-100 text-sm mt-1">Update tier configuration</p>
            </div>
            
            <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
              <div className='hidden'>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tier Name
                </label>
                <input
                  type="text"
                  value={editFormData.teirName}
                  onChange={(e) => setEditFormData({ ...editFormData, teirName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branches
                </label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {editFormData.branches.map((branch, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={branch.branchName}
                        onChange={(e) => handleEditBranchChange(index, 'branchName', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <select
                        value={branch.isActive}
                        onChange={(e) => handleEditBranchChange(index, 'isActive', e.target.value === 'true')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Amount
                </label>
                <input
                  type="number"
                  value={editFormData.teir_transaction_amount}
                  onChange={(e) => setEditFormData({ ...editFormData, teir_transaction_amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ MozAppearance: 'textfield' }}
                  onWheel={(e) => e.target.blur()}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Transactions
                </label>
                <input
                  type="number"
                  value={editFormData.teir_no_of_transaction}
                  onChange={(e) => setEditFormData({ ...editFormData, teir_no_of_transaction: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ MozAppearance: 'textfield' }}
                  onWheel={(e) => e.target.blur()}
                  required
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTierModal(false);
                    setEditingTier(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateTier}
                  disabled={editTierLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {editTierLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      Update Tier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tier Confirmation Modal */}
      {showDeleteTierModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Delete Tier</h3>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h4>
                <p className="text-gray-600">
                  You are about to delete tier <span className="font-semibold text-gray-900">"{tierToDelete?.teirName}"</span> and all its branches. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteTierModal(false);
                    setTierToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTier}
                  disabled={deleteTierLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteTierLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Tier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Add New Branch</h3>
              <p className="text-green-100 text-sm mt-1">Add a branch to this tier</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchData.branchName}
                  onChange={(e) => setNewBranchData({ ...newBranchData, branchName: e.target.value })}
                  placeholder="Enter branch name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newBranchData.isActive}
                  onChange={(e) => setNewBranchData({ ...newBranchData, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBranchModal(false);
                    setSelectedTierId(null);
                    setNewBranchData({ branchName: '', isActive: true });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addBranchToTier}
                  disabled={addBranchLoading || !newBranchData.branchName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addBranchLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Branch
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Branch Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Remove Branch</h3>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h4>
                <p className="text-gray-600">
                  You are about to remove branch <span className="font-semibold text-gray-900">"{branchToDelete?.branchName}"</span>. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBranchToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={removeBranchFromTier}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Remove Branch
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {manageUsersLoading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '50px', height: '50px', borderWidth: '4px' }}></div>
            <p className="text-white text-lg font-medium">Managing tier wise users...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierManagement;