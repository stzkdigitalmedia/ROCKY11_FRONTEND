import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';
import { apiHelper } from '../utils/apiHelper';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plus, X, Trash2, Edit } from 'lucide-react';
import { useToastContext } from '../App';
import UpdateBonusModal from '../components/modals/UpdateBonusModal';


const SABonuses = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToastContext();
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [formData, setFormData] = useState({
    bonusName: '',
    bonusType: '',
    bonusValue: '',
    bonusCategory: '',
    startDate: '',
    endDate: '',
    tierId: '',
    maxAmount: '',
    image: null
  });

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
      case 'tier-management':
        navigate('/tier-management');
        break;
      case 'telegram-otp':
        navigate('/telegram-otp');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'referral':
        navigate('/referral');
        break;
      default:
        break;
    }
  };

  const fetchBonuses = async (isActive = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiHelper.get(`/bonus/getAllBonuses?page=1&limit=50&isActive=${isActive}`);
      console.log('Fetch bonuses response:', response);
      const data = response?.data?.bonuses || response?.bonuses || response?.data || response || [];
      console.log('Bonuses data:', data);
      setBonuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bonuses:', err);
      setError(err.message || 'Failed to fetch bonuses');
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    try {
      const response = await apiHelper.get('/tier/getAllTiers_WithoutPagination');
      const data = response?.data?.tiers || response?.tiers || response?.data || response || [];
      console.log(data)
      setTiers(data);
    } catch (err) {
      console.error('Failed to fetch tiers:', err);
    }
  };

  const handleCreateBonus = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bonusName', formData.bonusName);
      formDataToSend.append('bonusType', formData.bonusType);
      formDataToSend.append('bonusValue', formData.bonusValue);
      formDataToSend.append('bonusCategory', formData.bonusCategory);

      if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      if (formData.tierId) formDataToSend.append('tierId', formData.tierId);
      if (formData.maxAmount) formDataToSend.append('maxAmount', formData.maxAmount);
      if (formData.image) formDataToSend.append('image', formData.image);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bonus/createBonus`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create bonus');

      setShowCreateModal(false);
      fetchBonuses();
      setFormData({
        bonusName: '',
        bonusType: '',
        bonusValue: '',
        bonusCategory: '',
        startDate: '',
        endDate: '',
        tierId: '',
        maxAmount: '',
        image: null
      });
      toast.success('Bonus created successfully!');
    } catch (err) {
      console.error('Create bonus error:', err);
      toast.error(err.message || 'Failed to create bonus');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBonus = async (bonusId) => {
    if (!window.confirm('Are you sure you want to delete this bonus?')) return;
    try {
      await apiHelper.delete(`/bonus/deleteBonus/${bonusId}`);
      fetchBonuses();
      toast.success('Bonus deleted successfully!');
    } catch (err) {
      console.error('Delete bonus error:', err);
      toast.error(err.message || 'Failed to delete bonus');
    }
  };

  const toggleBonusStatus = async (bonusId) => {
    try {
      // Optimistically update UI
      setBonuses(prevBonuses =>
        prevBonuses.map(b =>
          b._id === bonusId ? { ...b, isActive: !b.isActive } : b
        )
      );

      const response = await apiHelper.get(`/bonus/makeActive_InactiveBonous/${bonusId}`);
      console.log('Toggle status response:', response);
      toast.success('Bonus status updated successfully!');

      // Fetch fresh data to confirm
      await fetchBonuses();
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error(err.message || 'Failed to update bonus status');
      // Revert on error
      await fetchBonuses();
    }
  };

  const toggleIsMulti = async (bonusId) => {
    try {
      setBonuses(prevBonuses =>
        prevBonuses.map(b =>
          b._id === bonusId ? { ...b, isMulti: !b.isMulti } : b
        )
      );

      await apiHelper.get(`/bonus/toggleIsMulti/${bonusId}`);
      toast.success('Multi status updated successfully!');
      await fetchBonuses();
    } catch (err) {
      console.error('Toggle isMulti error:', err);
      toast.error(err.message || 'Failed to update multi status');
      await fetchBonuses();
    }
  };

  const handleEditBonus = (bonus) => {
    setSelectedBonus(bonus);
    setFormData({
      bonusName: bonus.bonusName || '',
      bonusType: bonus.bonusType || '',
      bonusValue: bonus.bonusValue || '',
      bonusCategory: bonus.bonusCategory || '',
      startDate: bonus.startDate ? bonus.startDate.split('T')[0] : '',
      endDate: bonus.endDate ? bonus.endDate.split('T')[0] : '',
      tierId: bonus.tierId?._id || bonus.tierId || '',
      maxAmount: bonus.maxAmount || '',
      image: null
    });
    setShowUpdateModal(true);
  };

  const handleUpdateBonus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bonusName', formData.bonusName);
      formDataToSend.append('bonusType', formData.bonusType);
      formDataToSend.append('bonusValue', formData.bonusValue);
      formDataToSend.append('bonusCategory', formData.bonusCategory);

      if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      if (formData.tierId) formDataToSend.append('tierId', formData.tierId);
      if (formData.maxAmount) formDataToSend.append('maxAmount', formData.maxAmount);
      if (formData.image) formDataToSend.append('image', formData.image);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bonus/updateBonus/${selectedBonus._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to update bonus');

      setShowUpdateModal(false);
      fetchBonuses();
      setSelectedBonus(null);
      setFormData({
        bonusName: '',
        bonusType: '',
        bonusValue: '',
        bonusCategory: '',
        startDate: '',
        endDate: '',
        tierId: '',
        maxAmount: '',
        image: null
      });
      toast.success('Bonus updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update bonus');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchBonuses(activeTab === 'active');
    fetchTiers();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab="bonuses" setActiveTab={handleNavigation} onLogout={handleLogout} />

      <div className="flex-1 lg:ml-64">
        <AdminHeader
          title="Bonuses"
          subtitle="View and manage all bonuses"
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Active Bonuses
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'inactive'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Inactive Bonuses
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Create Bonus
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
              <p className="text-gray-600">Loading bonuses...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Bonus Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Max Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Up To</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Multi</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created By</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created At</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonuses.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-gray-500">
                          No bonuses found
                        </td>
                      </tr>
                    ) : (
                      bonuses.map((bonus, index) => (
                        <tr key={bonus._id || index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{index + 1}</td>
                          <td className="py-3 px-4 text-sm font-medium">{bonus.bonusName || 'N/A'}</td>
                          <td className="py-3 px-4">
                            {bonus.bonusImage ? (
                              <img src={bonus.bonusImage} alt={bonus.bonusName} className="h-10 w-10 object-cover rounded" />
                            ) : (
                              <span className="text-gray-400 text-xs">No Image</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">{bonus.bonusType || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm font-medium">{bonus.bonusValue || 0}{bonus.bonusType === 'percentage' ? '%' : ''}</td>
                          <td className="py-3 px-4 text-sm">{bonus.bonusCategory || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm">₹{bonus.maxAmount || 0}</td>
                          <td className="py-3 px-4 text-sm">₹{bonus.up_to_amount || 0}</td>
                          <td className="py-3 px-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bonus.isActive || false}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleBonusStatus(bonus._id);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </td>
                          <td className="py-3 px-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={bonus.isMulti || false}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleIsMulti(bonus._id);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </td>
                          <td className="py-3 px-4 text-sm">{bonus.createdBy?.clientName || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {bonus.createdAt ? new Date(bonus.createdAt).toLocaleString('en-IN') : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditBonus(bonus)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteBonus(bonus._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Create Bonus</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateBonus} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Name</label>
                  <input
                    type="text"
                    value={formData.bonusName}
                    onChange={(e) => setFormData({ ...formData, bonusName: e.target.value })}
                    placeholder="Enter bonus name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Type</label>
                  <select
                    value={formData.bonusType}
                    onChange={(e) => setFormData({ ...formData, bonusType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Bonus Type</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Value</label>
                  <input
                    type="number"
                    value={formData.bonusValue}
                    onChange={(e) => setFormData({ ...formData, bonusValue: e.target.value })}
                    placeholder="Enter bonus value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Category</label>
                  <select
                    value={formData.bonusCategory}
                    onChange={(e) => setFormData({ ...formData, bonusCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="FTD">FTD</option>
                    <option value="OnDeposit">OnDeposit</option>
                    <option value="LossBack">LossBack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="Select start date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    placeholder="Select end date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={formData.tierId}
                    onChange={(e) => setFormData({ ...formData, tierId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Tier</option>
                    {tiers.map((tier) => (
                      <option key={tier._id || tier.id} value={tier._id || tier.id}>
                        {tier.teirName || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    placeholder="Enter max amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Bonus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <UpdateBonusModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedBonus(null);
          }}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleUpdateBonus}
          updating={updating}
          tiers={tiers}
          selectedBonus={selectedBonus}
        />
      )}
    </div>
  );
};

export default SABonuses;
