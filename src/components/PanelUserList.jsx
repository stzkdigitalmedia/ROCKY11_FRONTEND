import { useState, useEffect } from 'react';
import { History, Search } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import PanelUserHistory from './PanelUserHistory';

const PanelUserList = ({ dateRange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToastContext();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].startDate.toISOString().split('T')[0];
      const endDate = dateRange[0].endDate.toISOString().split('T')[0];

      const response = await apiHelper.get(`/subAccount/getPanels_subUsers?page=${currentPage}&limit=50&clientName=${search}`);
      setUsers(response?.data || response?.users || []);
      setTotalPages(response?.totalPages || Math.ceil((response?.total || 0) / 10));
    } catch (error) {
      toast.error('Failed to fetch users: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, dateRange, search]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by client name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Client Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Panel Name</th>
                    {/* <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Balance</th> */}
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created At</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user, index) => (
                    <tr key={user._id || user.id || index} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="py-3 px-4 text-sm text-gray-900">{(currentPage - 1) * 50 + index + 1}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.clientName || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.panelName || 'N/A'}</td>
                      {/* <td className="py-3 px-4 text-sm text-gray-900">₹{user.totalBalance || 0}</td> */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedUser({ id: user._id, name: user.clientName })}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <History size={16} />
                          <span className="text-sm">History</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
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
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}
      </div>

      {/* History Modal */}
      {selectedUser && (
        <PanelUserHistory
          userId={selectedUser.id}
          userName={selectedUser.name}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default PanelUserList;
