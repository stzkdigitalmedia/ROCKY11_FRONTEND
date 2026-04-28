import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const defaultTierDetail = {
  tierId: '',
  is_Deposit: true,
  is_Withdraw: true,
  is_Deposit_RoleBack: false,
  is_Withdraw_RoleBack: false,
  is_Bonus_Assign: true,
  is_Block_User: false,
};

const RoleList = () => {
  const toast = useToastContext();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editForm, setEditForm] = useState({ clientName: '', isActive: true });
  const [editLoading, setEditLoading] = useState(false);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [addTierRole, setAddTierRole] = useState(null);
  const [addTierForm, setAddTierForm] = useState({ ...defaultTierDetail });
  const [addTierLoading, setAddTierLoading] = useState(false);
  const [showDeleteTierConfirm, setShowDeleteTierConfirm] = useState(false);
  const [deleteTierTarget, setDeleteTierTarget] = useState(null); // { role, tierId }
  const [deleteTierLoading, setDeleteTierLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    password: '',
    tierDetails: [{ ...defaultTierDetail }],
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get('/roleBaseTier/getAllRoles_User');
      setRoles(res?.data || res?.roles || res || []);
    } catch {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiers = async () => {
    try {
      const res = await apiHelper.get('/tier/getAllTiers_WithoutPagination');
      setTiers(res?.data?.tiers || []);
    } catch {
      console.error('Failed to fetch tiers');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchTiers();
  }, []);

  const openEditModal = (role) => {
    setEditingRole(role);
    setEditForm({ clientName: role.clientName, isActive: role.isActive });
    setShowEditModal(true);
  };

  const openAddTierModal = (role) => {
    setAddTierRole(role);
    setAddTierForm({ ...defaultTierDetail });
    setShowAddTierModal(true);
  };

  const handleToggleActive = async (role) => {
    try {
      await apiHelper.put(`/roleBaseTier/updateRoleById/${role._id}`, {
        clientName: role.clientName,
        isActive: !role.isActive,
      });
      toast.success('Status updated!');
      fetchRoles();
    } catch (error) {
      toast.error('Failed: ' + error.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.clientName.trim()) { toast.error('Client name is required'); return; }
    setEditLoading(true);
    try {
      await apiHelper.put(`/roleBaseTier/updateRoleById/${editingRole._id}`, editForm);
      toast.success('Role updated successfully!');
      setShowEditModal(false);
      fetchRoles();
    } catch (error) {
      toast.error('Failed: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTier = async () => {
    setDeleteTierLoading(true);
    try {
      await apiHelper.delete(`/roleBaseTier/remove-tier-from-role/${deleteTierTarget.role._id}`, { tierId: deleteTierTarget.tierId });
      toast.success('Tier removed successfully!');
      setShowDeleteTierConfirm(false);
      setDeleteTierTarget(null);
      fetchRoles();
    } catch (error) {
      toast.error('Failed: ' + error.message);
    } finally {
      setDeleteTierLoading(false);
    }
  };

  const handleAddTierSubmit = async (e) => {
    e.preventDefault();
    if (!addTierForm.tierId) { toast.error('Please select a tier'); return; }
    setAddTierLoading(true);
    try {
      await apiHelper.post(`/roleBaseTier/add-tier-to-role/${addTierRole._id}`, addTierForm);
      toast.success('Tier added successfully!');
      setShowAddTierModal(false);
      fetchRoles();
    } catch (error) {
      toast.error('Failed: ' + error.message);
    } finally {
      setAddTierLoading(false);
    }
  };

  const handlePermissionToggle = async (role, td, key) => {
    try {
      await apiHelper.put(`/roleBaseTier/${role._id}/update-tier-permissions`, {
        tierId: td.tierId?._id || td.tierId,
        permissions: {
          is_Deposit: td.is_Deposit,
          is_Withdraw: td.is_Withdraw,
          is_Deposit_RoleBack: td.is_Deposit_RoleBack,
          is_Withdraw_RoleBack: td.is_Withdraw_RoleBack,
          is_Bonus_Assign: td.is_Bonus_Assign,
          is_Block_User: td.is_Block_User,
          [key]: !td[key],
        },
      });
      toast.success('Permission updated!');
      fetchRoles();
    } catch (error) {
      toast.error('Failed: ' + error.message);
    }
  };

  const handleTierDetailChange = (index, field, value) => {
    const updated = [...form.tierDetails];
    updated[index][field] = value;
    setForm({ ...form, tierDetails: updated });
  };

  const addTierDetail = () => {
    setForm({ ...form, tierDetails: [...form.tierDetails, { ...defaultTierDetail }] });
  };

  const removeTierDetail = (index) => {
    if (form.tierDetails.length === 1) return;
    setForm({ ...form, tierDetails: form.tierDetails.filter((_, i) => i !== index) });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.password.trim()) {
      toast.error('Client name and password are required');
      return;
    }
    setCreateLoading(true);
    try {
      await apiHelper.post('/roleBaseTier/createRole', form);
      toast.success('Role created successfully!');
      setShowModal(false);
      setForm({ clientName: '', password: '', tierDetails: [{ ...defaultTierDetail }] });
      fetchRoles();
    } catch (error) {
      toast.error('Failed to create role: ' + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const permissionKeys = [
    { key: 'is_Deposit', label: 'Deposit' },
    { key: 'is_Withdraw', label: 'Withdraw' },
    { key: 'is_Deposit_RoleBack', label: 'D.Rollback' },
    { key: 'is_Withdraw_RoleBack', label: 'W.Rollback' },
    { key: 'is_Bonus_Assign', label: 'Bonus' },
    { key: 'is_Block_User', label: 'Block' },
  ];

  const Switch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
    </label>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-500 text-sm mt-1">{roles.length} role{roles.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Create New Role
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4" style={{ width: '36px', height: '36px' }}></div>
          <p className="text-gray-500">Loading roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">No roles found</p>
          <p className="text-sm">Create your first role using the button above</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Client Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Is Active</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Tier Details</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Created At</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 border-b">Edit</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, i) => (
                <tr key={role._id || i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{role.clientName || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-700">{role.role || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <Switch checked={role.isActive} onChange={() => handleToggleActive(role)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        {role.tierDetails?.length > 0 ? role.tierDetails.map((td, j) => (
                          <div key={j} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-blue-700">{td.tierId?.teirName || td.tierId || 'N/A'}</p>
                              <button
                                onClick={() => { setDeleteTierTarget({ role, tierId: td.tierId?._id || td.tierId }); setShowDeleteTierConfirm(true); }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove Tier"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {permissionKeys.map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                  <Switch checked={td[key]} onChange={() => handlePermissionToggle(role, td, key)} />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </div>
                        )) : <span className="text-gray-400">N/A</span>}
                      </div>
                      {/* <button
                        onClick={() => openAddTierModal(role)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0 mt-1"
                        title="Add Tier"
                      >
                        <Edit size={18} />
                      </button> */}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {role.createdAt ? new Date(role.createdAt).toLocaleString('en-IN') : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {/* <button
                      onClick={() => openEditModal(role)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button> */}
                    <button
                      onClick={() => openAddTierModal(role)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0 mt-1"
                      title="Add Tier"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Create New Role</h3>
                <p className="text-blue-100 text-sm mt-0.5">Configure role with tier permissions</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name</label>
                <input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Enter client name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Tier Details</label>
                  <button type="button" onClick={addTierDetail} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"><Plus size={12} /> Add Tier</button>
                </div>
                <div className="space-y-3">
                  {form.tierDetails.map((td, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">Tier {index + 1}</span>
                        {form.tierDetails.length > 1 && (
                          <button type="button" onClick={() => removeTierDetail(index)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Select Tier</label>
                        <select value={td.tierId} onChange={(e) => handleTierDetailChange(index, 'tierId', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select Tier</option>
                          {tiers.map((t) => (<option key={t._id} value={t._id}>{t.teirName}</option>))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {permissionKeys.map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={td[key]} onChange={(e) => handleTierDetailChange(index, key, e.target.checked)} className="w-3.5 h-3.5 text-blue-600" />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={createLoading} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {createLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : <><Plus size={16} /> Create Role</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tier to Role Modal */}
      {showAddTierModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Add Tier to Role</h3>
                <p className="text-green-100 text-sm mt-0.5">{addTierRole?.clientName}</p>
              </div>
              <button onClick={() => setShowAddTierModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTierSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Tier</label>
                <select value={addTierForm.tierId} onChange={(e) => setAddTierForm({ ...addTierForm, tierId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                  <option value="">Select Tier</option>
                  {tiers.map((t) => (<option key={t._id} value={t._id}>{t.teirName}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {permissionKeys.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={addTierForm[key]} onChange={(e) => setAddTierForm({ ...addTierForm, [key]: e.target.checked })} className="w-4 h-4 text-green-600" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTierModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={addTierLoading} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {addTierLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Adding...</> : 'Add Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tier Confirmation Modal */}
      {showDeleteTierConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg font-bold text-white">Remove Tier</h3>
              <p className="text-red-100 text-sm mt-0.5">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">Are you sure you want to remove this tier from <span className="font-semibold">{deleteTierTarget?.role?.clientName}</span>?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteTierConfirm(false); setDeleteTierTarget(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTier}
                  disabled={deleteTierLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteTierLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Removing...</> : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Role</h3>
                <p className="text-blue-100 text-sm mt-0.5">{editingRole?.clientName}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name</label>
                <input type="text" value={editForm.clientName} onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Is Active</span>
                <Switch checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {editLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Updating...</> : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleList;
