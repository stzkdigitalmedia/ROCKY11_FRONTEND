import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import UserSidebar from '../components/UserSidebar';
import UserHeader from '../components/UserHeader';
import { X, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const SubAccounts = () => {
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subAccountsLoading, setSubAccountsLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [limit] = useState(5);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    city: '',
    phone: ''
  });
  const toast = useToastContext();

  const fetchSubAccounts = async (page = currentPage) => {
    setSubAccountsLoading(true);
    try {
      const response = await apiHelper.get(`/subAccount/getSubAccounts?page=${page}&limit=${limit}`);
      const accountsList = response?.subAccounts || response?.data || response || [];
      setSubAccounts(accountsList);
      setTotalPages(response?.totalPages || Math.ceil((response?.total || accountsList.length) / limit));
      setTotalAccounts(response?.total || accountsList.length);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to fetch sub accounts: ' + error.message);
    } finally {
      setSubAccountsLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setEditFormData({
      fullName: account?.fullName || '',
      email: account?.email || '',
      password: '',
      city: account?.city || '',
      phone: account?.phone || ''
    });
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiHelper.put(`/subAccount/updateSubAccount/${editingAccount?.id || editingAccount?._id}`, editFormData);
      toast.success('Account updated successfully!');
      setEditingAccount(null);
      fetchSubAccounts();
    } catch (error) {
      toast.error('Failed to update account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      await apiHelper.delete(`/subAccount/deleteSubAccount/${accountToDelete?.id || accountToDelete?._id}`);
      toast.success('Account deleted successfully!');
      setAccountToDelete(null);
      fetchSubAccounts();
    } catch (error) {
      toast.error('Failed to delete account: ' + error.message);
    }
  };

  const handleToggleAccountStatus = async (accountId) => {
    try {
      await apiHelper.patch(`/subAccount/activeInactiveSubAccount/${accountId}`);
      toast.success('Account status updated!');
      fetchSubAccounts();
    } catch (error) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSubAccounts();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar />

      <div className="flex-1 overflow-auto lg:ml-0">
        <UserHeader
          title="My IDs"
          subtitle="Manage your created sub accounts"
        />
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="gaming-card p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">IDs</h2>
                <p className="text-gray-600 text-sm mt-1">All your created IDs</p>
              </div>
              <button
                onClick={fetchSubAccounts}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Refresh
              </button>
            </div>

            {subAccountsLoading ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                <p className="text-gray-600">Loading IDs...</p>
              </div>
            ) : subAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No IDs found</p>
                <p className="text-sm">Create your first ID from dashboard</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead className="table-header">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      {/* <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subAccounts.map((account, index) => (
                      <tr key={account.id || account._id || index} className="table-row border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{(currentPage - 1) * limit + index + 1}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {account.clientName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{account.clientName}</h3>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{account.fullName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{account.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{account.phone}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{account.city}</p>
                        </td>
                        {/* <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleAccountStatus(account.id || account._id)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              account.status || account.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              account.status || account.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </td> */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setAccountToDelete(account)}
                              className="delete-btn text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalAccounts)} of {totalAccounts} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchSubAccounts(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                              <button
                                key={page}
                                onClick={() => fetchSubAccounts(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
                                  ? 'bg-green-600 text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2 text-gray-400">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => fetchSubAccounts(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Account Modal */}
          {editingAccount && (
            <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
              <div className="gaming-card p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto mx-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Edit Account</h2>
                    <p className="text-gray-600 text-sm mt-1">Update account details</p>
                  </div>
                  <button onClick={() => setEditingAccount(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateAccount} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={editFormData.fullName}
                      onChange={handleEditInputChange}
                      className="gaming-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      className="gaming-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter new password (optional)"
                      value={editFormData.password}
                      onChange={handleEditInputChange}
                      className="gaming-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      value={editFormData.city}
                      onChange={handleEditInputChange}
                      className="gaming-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      className="gaming-input"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={loading} className="flex-1 gaming-btn flex items-center justify-center">
                      {loading ? (
                        <><span className="loading-spinner mr-2"></span>Updating...</>
                      ) : (
                        <><Check className="w-4 h-4 mr-2" />Update Account</>
                      )}
                    </button>
                    <button type="button" onClick={() => setEditingAccount(null)} className="flex-1 btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {accountToDelete && (
            <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
              <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
                    <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
                  </div>
                  <button onClick={() => setAccountToDelete(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700">Are you sure you want to delete <strong>{accountToDelete.clientName}</strong>'s account?</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 mr-2" />Delete Account
                  </button>
                  <button onClick={() => setAccountToDelete(null)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubAccounts;