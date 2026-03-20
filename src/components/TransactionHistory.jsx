import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { Search, Filter, Settings, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', reason: '' });
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [games, setGames] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    clientName: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    mode: '',
    gameName: ''
  });

  const toast = useToastContext();

  const fetchTransactions = async (currentPage = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const payload = {
        page: currentPage,
        limit: 20,
        ...currentFilters
      };

      // Remove empty filters
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await apiHelper.post('/transaction/getAllUserTransactionsHistory_ForSuperAdmin', payload);
      const transactionsData = response?.data?.transactions || response?.transactions || response?.data || response || [];
      setTransactions(transactionsData);
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1);
      setTotalTransactions(response?.data?.totalTransactions || response?.totalTransactions || transactionsData?.length || 0);
    } catch (error) {
      toast.error('Failed to fetch transactions: ' + error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchTransactions(1, filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      transactionType: '',
      clientName: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      mode: '',
      gameName: ''
    };
    setFilters(clearedFilters);
    setPage(1);
    fetchTransactions(1, clearedFilters);
  };

  useEffect(() => {
    fetchTransactions(page, filters);
  }, [page]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await apiHelper.get('/game/getAllGamesWithPagination?page=1&limit=100');
        setGames(response?.data || response?.games || []);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View and filter all user transactions</p>
      </div>

      {/* Filters */}
      <div className="gaming-card mb-6 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="Initial">Initial</option>
              <option value="Pending">Pending</option>
              <option value="Accept">Accept</option>
              <option value="Reject">Reject</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              type="text"
              value={filters.clientName}
              onChange={(e) => handleFilterChange('clientName', e.target.value)}
              placeholder="Enter client name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              placeholder="Min amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              placeholder="Max amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div onClick={() => document.getElementById('startDate').showPicker?.()} className="cursor-pointer">
            <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            />
          </div>

          <div onClick={() => document.getElementById('endDate').showPicker?.()} className="cursor-pointer">
            <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">End Date</label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={filters.mode}
              onChange={(e) => handleFilterChange('mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Modes</option>
              <option value="PowerPay">PowerPay</option>
              <option value="Wallet">Wallet</option>
              <option value="ROCKY11">ROCKYIO</option>
              <option value="Bonus">Bonus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game Name</label>
            <select
              value={filters.gameName}
              onChange={(e) => handleFilterChange('gameName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Games</option>
              {games.map((game) => (
                <option key={game._id} value={game.gameName}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Search size={16} />
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <button
            onClick={async () => {
              setDownloading(true);
              try {
                const payload = { ...filters };
                Object.keys(payload).forEach(key => {
                  if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
                    delete payload[key];
                  }
                });
                const response = await apiHelper.post('/transaction/getAllUser_TrxsHistory_Without_Pagination', payload);
                const allData = response?.data?.transactions || response?.transactions || response?.data || response || [];
                const data = allData.map((t, i) => ({
                  'S.No': i + 1,
                  'Client Name': t?.clientName || t?.user?.clientName || 'N/A',
                  'Transaction Type': t?.transactionType || 'N/A',
                  'Amount': t?.amount || 0,
                  'Game Name': t?.gameName || 'N/A',
                  'Mode': t?.mode || 'N/A',
                  'Status': t?.status || 'Pending',
                  'Created At': t?.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : 'N/A',
                  'Updated At': t?.updatedAt ? new Date(t.updatedAt).toLocaleString('en-IN') : 'N/A'
                }));
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
                XLSX.writeFile(wb, `Transaction_History_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`);
                toast.success(`Downloaded ${data.length} transactions successfully!`);
              } catch (error) {
                toast.error('Failed to download report: ' + error.message);
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {downloading ? 'Downloading...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="gaming-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No transactions found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction?.id || transaction?._id || index} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{((page - 1) * 20) + index + 1}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(transaction?.clientName || transaction?.user?.clientName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction?.clientName || transaction?.user?.clientName || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${transaction?.transactionType === 'Deposit' ? 'badge-green' : 'badge-blue'
                        }`}>
                        {transaction?.transactionType || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-green-600">₹{transaction?.amount || 0}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{transaction?.gameName || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{transaction?.mode || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${transaction?.status === 'Accept' ? 'badge-green' :
                        transaction?.status === 'Reject' ? 'badge-red' : 'badge-blue'
                        }`}>
                        {transaction?.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">
                        {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('en-IN') : ''}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">
                        {transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction?.updatedAt ? new Date(transaction.updatedAt).toLocaleTimeString('en-IN') : ''}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setStatusForm({ status: transaction?.status || '', reason: '' });
                          setShowStatusModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <Settings size={14} />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages} (Total: {totalTransactions} transactions)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Transaction Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Transaction ID: {selectedTransaction?._id}</p>
              <p className="text-sm text-gray-600">Amount: ₹{selectedTransaction?.amount}</p>
              <p className="text-sm text-gray-600">User: {selectedTransaction?.clientName}</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setUpdating(true);
              try {
                const payload = {
                  transactionId: selectedTransaction?._id,
                  status: statusForm.status,
                  reason: statusForm.reason
                }
                await apiHelper.post('/transaction/update-status-by-super-admin', payload);
                toast.success('Transaction status updated successfully!');
                setShowStatusModal(false);
                fetchTransactions(page, filters);
              } catch (error) {
                toast.error('Failed to update status: ' + error.message);
              } finally {
                setUpdating(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Initial">Initial</option>
                  <option value="Pending">Pending</option>
                  <option value="Accept">Accept</option>
                  <option value="Reject">Reject</option>
                  <option value="Insufficent">Insufficient</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  placeholder="Enter reason for status change"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;