import { useState, useEffect } from 'react';
import { Shield, Plus, Eye, EyeOff, Search, Edit } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToast } from '../hooks/useToast';

const PanelManagement = () => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    panelName: '',
    userName: '',
    password: '',
    transactionPin: '',
    gameId: '',
    adminLink: ''
  });
  const [editFormData, setEditFormData] = useState({
    panelName: '',
    userName: '',
    password: '',
    transactionPin: '',
    adminLink: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditPin, setShowEditPin] = useState(false);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  const fetchGames = async () => {
    setLoadingGames(true);
    try {
      const response = await apiHelper.get('/game/getAllGames_without_pagination');
      const gamesData = response?.games || response?.data || response || [];
      setGames(Array.isArray(gamesData) ? gamesData : []);
    } catch (error) {
      console.error('Fetch games error:', error);
      showToast(error?.message || 'Failed to fetch games', 'error');
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchPanels = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiHelper.get(`/panel/getAllPanels?page=${page}&limit=10`);
      // console.log('API Response:', response); // Debug log
      
      // Handle different response structures
      const panelsData = response.data?.panels || response.panels || response.data || response || [];
      const totalCount = response.data?.total || response.total || response.data?.count || panelsData.length || 0;
      
      setPanels(Array.isArray(panelsData) ? panelsData : []);
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (error) {
      console.error('Fetch panels error:', error);
      showToast(error.message || 'Failed to fetch panels', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanels(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchGames();
  }, []);

  const handleCreatePanel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiHelper.post('/panel/createPanel', formData);
      showToast('Panel created successfully', 'success');
      setShowCreateForm(false);
      setFormData({ panelName: '', userName: '', password: '', transactionPin: '', gameId: '', adminLink: '' });
      fetchPanels(currentPage);
    } catch (error) {
      showToast(error.message || 'Failed to create panel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (panelId, currentStatus) => {
    // Immediately update local state for instant UI feedback
    setPanels(prevPanels => 
      prevPanels.map(panel => {
        if ((panel._id || panel.id) === panelId) {
          return {
            ...panel,
            isActive: panel.isActive !== undefined ? !panel.isActive : !(panel.status === 'active' || panel.active),
            status: panel.isActive !== undefined 
              ? (!panel.isActive ? 'active' : 'inactive')
              : (panel.status === 'active' || panel.active ? 'inactive' : 'active'),
            active: panel.isActive !== undefined 
              ? !panel.isActive
              : !(panel.status === 'active' || panel.active)
          };
        }
        return panel;
      })
    );

    try {
      await apiHelper.patch(`/panel/updatePanelStatus/${panelId}`);
      showToast('Panel status updated successfully', 'success');
    } catch (error) {
      // Revert the local state change if API call fails
      setPanels(prevPanels => 
        prevPanels.map(panel => {
          if ((panel._id || panel.id) === panelId) {
            return {
              ...panel,
              isActive: panel.isActive !== undefined ? !panel.isActive : !(panel.status === 'active' || panel.active),
              status: panel.isActive !== undefined 
                ? (!panel.isActive ? 'inactive' : 'active')
                : (panel.status === 'active' || panel.active ? 'active' : 'inactive'),
              active: panel.isActive !== undefined 
                ? !panel.isActive
                : !(panel.status === 'active' || panel.active)
            };
          }
          return panel;
        })
      );
      showToast(error.message || 'Failed to update panel status', 'error');
    }
  };

  const handleDefaultToggle = async (panelId, currentDefault, panel) => {
    setPanels(prevPanels => 
      prevPanels.map(p => 
        (p._id || p.id) === panelId 
          ? { ...p, isDefault: !currentDefault }
          : p
      )
    );

    try {
      await apiHelper.patch(`/panel/updatePanelVisibility/${panelId}`, {
        isDefault: !currentDefault,
        isShow: panel.isShow
      });
      showToast('Panel default status updated successfully', 'success');
    } catch (error) {
      setPanels(prevPanels => 
        prevPanels.map(p => 
          (p._id || p.id) === panelId 
            ? { ...p, isDefault: currentDefault }
            : p
        )
      );
      showToast(error.message || 'Failed to update panel default status', 'error');
    }
  };

  const handleShowToggle = async (panelId, currentShow, panel) => {
    setPanels(prevPanels => 
      prevPanels.map(p => 
        (p._id || p.id) === panelId 
          ? { ...p, isShow: !currentShow }
          : p
      )
    );

    try {
      await apiHelper.patch(`/panel/updatePanelVisibility/${panelId}`, {
        isDefault: panel.isDefault,
        isShow: !currentShow
      });
      showToast('Panel show status updated successfully', 'success');
    } catch (error) {
      setPanels(prevPanels => 
        prevPanels.map(p => 
          (p._id || p.id) === panelId 
            ? { ...p, isShow: currentShow }
            : p
        )
      );
      showToast(error.message || 'Failed to update panel show status', 'error');
    }
  };

  const handleEditPanel = (panel) => {
    setEditingPanel(panel);
    setEditFormData({
      panelName: panel.panelName || panel.name || '',
      userName: panel.userName || panel.username || '',
      password: panel.password || '',
      transactionPin: panel.transactionPin || '',
      adminLink: panel.adminLink || ''
    });
    setShowEditForm(true);
  };

  const handleUpdatePanel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const panelId = editingPanel._id || editingPanel.id;
      await apiHelper.patch(`/panel/updatePanel_in_all_tables/${panelId}`, editFormData);
      showToast('Panel updated successfully', 'success');
      setShowEditForm(false);
      setEditingPanel(null);
      setEditFormData({ panelName: '', userName: '', password: '', transactionPin: '', adminLink: '' });
      fetchPanels(currentPage);
    } catch (error) {
      showToast(error.message || 'Failed to update panel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (gameId) => {
    const selectedGame = games.find(g => (g?._id || g?.id) === gameId);
    setFormData({
      ...formData,
      gameId: gameId,
      panelName: selectedGame?.name || ''
    });
  };

  const filteredPanels = panels
    .filter(panel =>
      panel.panelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = (a.panelName || a.name || '').toLowerCase();
      const nameB = (b.panelName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // Group panels by panel name
  const groupedPanels = filteredPanels.reduce((groups, panel) => {
    const panelName = panel.panelName || panel.name || 'Unknown';
    if (!groups[panelName]) {
      groups[panelName] = [];
    }
    groups[panelName].push(panel);
    return groups;
  }, {});

  return (
    <div>
      <div className="gaming-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" style={{color: '#1477b0'}} />
              Panel Management
            </h2>
            <p className="text-gray-600 text-sm mt-1">Create and manage exchange panels</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="gaming-btn flex items-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Create Panel
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search panels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Debug Info */}
        {panels.length > 0 && (
          <div className="mb-2 text-sm text-gray-600">
            Found {panels.length} panels
          </div>
        )}
        
        {/* Grouped Panels List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : Object.keys(groupedPanels).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No panels found</p>
              <p className="text-sm">Create some panels to get started</p>
            </div>
          ) : (
            Object.entries(groupedPanels).map(([panelName, panelGroup]) => (
              <div key={panelName} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{backgroundColor: '#1477b0'}}>
                        {panelName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{panelName}</h3>
                        <p className="text-sm text-gray-600">{panelGroup.length} panel{panelGroup.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-bold">
                        <span className="text-gray-700">Available Balance: </span>
                        <span className="text-green-600">₹{panelGroup[0]?.panelBalance || 0}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {panelGroup.filter(p => p.isActive !== undefined ? p.isActive : p.status === 'active' || p.active).length} active
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Panels Table in Group */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Default ID create</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Show panel</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {panelGroup.map((panel, index) => (
                        <tr key={panel._id || panel.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {(panel.userName || panel.username || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{panel.userName || panel.username || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              (panel.isActive !== undefined ? panel.isActive : panel.status === 'active' || panel.active)
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {(panel.isActive !== undefined ? panel.isActive : panel.status === 'active' || panel.active) ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {panel.createdAt ? new Date(panel.createdAt).toLocaleDateString() : 
                             panel.created_at ? new Date(panel.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer" title="Active/Inactive">
                              <input
                                type="checkbox"
                                checked={panel.isActive !== undefined ? panel.isActive : panel.status === 'active' || panel.active}
                                onChange={() => handleStatusToggle(panel._id || panel.id, panel.isActive)}
                                className="sr-only peer"
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer" title="Default">
                              <input
                                type="checkbox"
                                checked={panel.isDefault || false}
                                onChange={() => handleDefaultToggle(panel._id || panel.id, panel.isDefault, panel)}
                                className="sr-only peer"
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer" title="Show">
                              <input
                                type="checkbox"
                                checked={panel.isShow || false}
                                onChange={() => handleShowToggle(panel._id || panel.id, panel.isShow, panel)}
                                className="sr-only peer"
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleEditPanel(panel)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit Panel"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Panel Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Panel</h3>
            <form onSubmit={handleCreatePanel}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Game
                  </label>
                  <select
                    required
                    value={formData.gameId}
                    onChange={(e) => handleGameSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loadingGames}
                  >
                    <option value="">Select Game</option>
                    {games.map((game) => (
                      <option key={game?._id || game?.id} value={game?._id || game?.id}>
                        {game?.name}
                      </option>
                    ))}
                  </select>
                  {loadingGames && (
                    <p className="text-xs text-gray-500 mt-1">Loading games...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={formData.transactionPin}
                      onChange={(e) => setFormData({...formData, transactionPin: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Link
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminLink}
                    onChange={(e) => setFormData({...formData, adminLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Admin Link"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Panel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Panel Modal */}
      {showEditForm && editingPanel && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Panel</h3>
            <form onSubmit={handleUpdatePanel}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Panel Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.panelName}
                    onChange={(e) => setEditFormData({...editFormData, panelName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Panel Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editFormData.userName}
                    onChange={(e) => setEditFormData({...editFormData, userName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPin ? 'text' : 'password'}
                      value={editFormData.transactionPin}
                      onChange={(e) => setEditFormData({...editFormData, transactionPin: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction PIN"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPin(!showEditPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showEditPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Link
                  </label>
                  <input
                    type="text"
                    value={editFormData.adminLink}
                    onChange={(e) => setEditFormData({...editFormData, adminLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Admin Link"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPanel(null);
                    setEditFormData({ panelName: '', userName: '', password: '', transactionPin: '', adminLink: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Panel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelManagement;