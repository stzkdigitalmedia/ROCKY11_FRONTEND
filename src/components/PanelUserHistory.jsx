import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';

const PanelUserHistory = ({ userId, userName, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    minAmount: '',
    maxAmount: ''
  });
  const toast = useToastContext();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const payload = {
        page: currentPage,
        limit: 50,
        status: filters.status,
        transactionType: filters.transactionType,
        minAmount: filters.minAmount || undefined,
        maxAmount: filters.maxAmount || undefined
      };

      const response = await apiHelper.post(`/transaction/get_SubUser_Transactions/${userId}`, payload);
      setTransactions(response?.data?.transactions || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch transactions: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History - {userName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Initial">Initial</option>
              <option value="Pending">Pending</option>
              <option value="Accept">Accept</option>
              <option value="Reject">Reject</option>
              <option value="Insufficent">Insufficent</option>
            </select>

            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : transactions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn, index) => (
                  <tr key={txn._id || index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{(currentPage - 1) * 50 + index + 1}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        txn.transactionType === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {txn.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">₹{txn.amount || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        txn.status === 'Accept' ? 'bg-green-100 text-green-800' :
                        txn.status === 'Reject' ? 'bg-red-100 text-red-800' :
                        txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{txn.remarks || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          )}
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
      </div>
    </div>
  );
};

export default PanelUserHistory;
