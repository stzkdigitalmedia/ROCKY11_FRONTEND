import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { History } from 'lucide-react';

const TransactionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const toast = useToastContext();

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await apiHelper.get(`/transaction/fetch-status-change-logs?page=${currentPage}&limit=10`);
      const logsData = Array.isArray(response) ? response : response?.data?.logs || response?.logs || response?.data || [];
      setLogs(Array.isArray(logsData) ? logsData : []);
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1);
      setTotalLogs(response?.data?.totalLogs || response?.totalLogs || logsData?.length || 0);
    } catch (error) {
      toast.error('Failed to fetch transaction logs: ' + error.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History size={24} />
          Transaction Logs
        </h1>
        <p className="text-gray-600 mt-1">View all transaction status change logs</p>
      </div>

      <div className="gaming-card">
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{width: '32px', height: '32px'}}></div>
            <p className="text-gray-600">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No logs found</p>
            <p className="text-sm">No transaction status changes recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">New Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Changed At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log?._id || index} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{((page - 1) * 10) + index + 1}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(log?.clientName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{log?.clientName || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-mono text-gray-900">{log?.transactionId || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log?.transactionType === 'Deposit' ? 'bg-green-100 text-green-800' : 
                        log?.transactionType === 'Withdrawal' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log?.transactionType || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-gray-900">₹{log?.amount || 0}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log?.previousStatus === 'Accept' ? 'bg-green-100 text-green-800' : 
                        log?.previousStatus === 'Reject' ? 'bg-red-100 text-red-800' : 
                        log?.previousStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log?.previousStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log?.newStatus === 'Accept' ? 'bg-green-100 text-green-800' : 
                        log?.newStatus === 'Reject' ? 'bg-red-100 text-red-800' : 
                        log?.newStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log?.newStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate" title={log?.reason}>
                        {log?.reason || 'No reason provided'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">
                        {log?.changedAt ? new Date(log.changedAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log?.changedAt ? new Date(log.changedAt).toLocaleTimeString() : ''}
                      </p>
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
              Showing page {page} of {totalPages} (Total: {totalLogs} logs)
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
                      className={`px-3 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        page === pageNum
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
    </div>
  );
};

export default TransactionLogs;