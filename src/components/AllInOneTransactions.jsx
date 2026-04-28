import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { RotateCcw, Zap } from 'lucide-react';

const STATUS_OPTIONS = ['Initial', 'Pending', 'Accept', 'Reject', 'Insufficent'];

const statusStyle = (status) => {
    if (status === 'Accept') return 'bg-green-100 text-green-700';
    if (status === 'Reject') return 'bg-red-100 text-red-600';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Insufficent') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
};

const defaultFilters = {
    status: '',
    clientName: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
};

const AllInOneTransactions = ({ onRegisterRefresh }) => {
    const toast = useToastContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [confirm, setConfirm] = useState(null); // { tx, action: 'Processing' | 'Reject' }
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTransactions = async (currentPage = 1, currentFilters = appliedFilters) => {
        setLoading(true);
        try {
            const payload = { page: currentPage, limit: 20 };
            if (currentFilters.status) payload.status = currentFilters.status;
            if (currentFilters.clientName) payload.clientName = currentFilters.clientName;
            if (currentFilters.minAmount) payload.minAmount = Number(currentFilters.minAmount);
            if (currentFilters.maxAmount) payload.maxAmount = Number(currentFilters.maxAmount);
            if (currentFilters.startDate) payload.startDate = currentFilters.startDate;
            if (currentFilters.endDate) payload.endDate = currentFilters.endDate;

            const response = await apiHelper.post('/transaction/get_ALL_IN_ONE_Transactions', payload);
            const data = response?.data?.transactions || response?.transactions || response?.data || [];
            const pagination = response?.data || response || {};

            setTransactions(Array.isArray(data) ? data : []);
            setTotalPages(pagination.totalPages || 1);
            setTotalRecords(pagination.totalTransactions || pagination.total || 0);
        } catch (error) {
            toast.error('Failed to fetch transactions: ' + error.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page, appliedFilters);
    }, [page]);

    useEffect(() => {
        if (onRegisterRefresh) onRegisterRefresh(() => fetchTransactions(1, appliedFilters));
    }, [appliedFilters]);

    const applyFilters = () => {
        setAppliedFilters(filters);
        setPage(1);
        fetchTransactions(1, filters);
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setPage(1);
        fetchTransactions(1, defaultFilters);
    };

    const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '').length;

    const handleAction = async () => {
        if (!confirm) return;
        setActionLoading(true);
        try {
            const res = await apiHelper.post('/transaction/update_allinone_withdraw_transactions', {
                status: confirm.action,
                transactionId: confirm.tx._id,
            });
            toast.success(res?.message || 'Status updated successfully');
            fetchTransactions(page, appliedFilters);
        } catch (error) {
            toast.error(error.message || 'Action failed');
        } finally {
            setActionLoading(false);
            setConfirm(null);
        }
    };

    return (
        <div className="gaming-card p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">INSTANT PAYOUT Transactions</h2>
                        <p className="text-sm text-gray-500">{totalRecords} total records</p>
                    </div>
                </div>
            </div>

            {/* Inline Filters */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <select
                        value={filters.status}
                        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
                    >
                        <option value="">All Status</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <input
                        type="text"
                        placeholder="Client name"
                        value={filters.clientName}
                        onChange={e => setFilters(f => ({ ...f, clientName: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
                    />

                    <input
                        type="number"
                        placeholder="Min ₹"
                        value={filters.minAmount}
                        onChange={e => setFilters(f => ({ ...f, minAmount: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
                    />

                    <input
                        type="number"
                        placeholder="Max ₹"
                        value={filters.maxAmount}
                        onChange={e => setFilters(f => ({ ...f, maxAmount: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
                    />

                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
                    />

                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
                    />
                </div>

                <div className="flex gap-2 mt-3">
                    <button
                        onClick={applyFilters}
                        className="px-5 py-2 bg-[#1477b0] text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Apply
                    </button>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                        >
                            <RotateCcw size={13} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                    <p className="text-gray-600">Loading transactions...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Zap size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="table-header">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">remark</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={tx._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-500">{(page - 1) * 20 + index + 1}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-900">{tx.clientName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{tx.phone || tx.userId?.phone || ''}</div>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-gray-900">₹{tx.amount ?? 'N/A'}</td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs font-medium text-gray-800">{tx.bankName?.trim() || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">A/C: {tx.accNo || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">IFSC: {tx.ifscCode?.toUpperCase() || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">Holder Name: {tx.accHolderName?.trim() || ''}</div>
                                        <div className="text-xs text-gray-500">UPI: {tx.upiId}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                                            {tx.remarks || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.transactionType === 'Deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {tx.transactionType || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">
                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4">
                                        {tx.transactionStatus === 'Pending' ? (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setConfirm({ tx, action: 'Processing' })}
                                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => setConfirm({ tx, action: 'Reject' })}
                                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle(tx.status)}`}>
                                                {tx.status || 'N/A'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Confirmation Popup */}
            {confirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirm.action === 'Processing' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <span className="text-2xl">{confirm.action === 'Processing' ? '✓' : '✕'}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                            {confirm.action === 'Processing' ? 'Accept Transaction?' : 'Reject Transaction?'}
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-1">
                            {confirm.tx.clientName} — <span className="font-semibold text-gray-700">₹{confirm.tx.amount}</span>
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-5">ID: #{confirm.tx._id?.slice(-6)}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirm(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading}
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-60 ${
                                    confirm.action === 'Processing' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {actionLoading ? 'Processing...' : confirm.action === 'Processing' ? 'Yes, Accept' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 flex-wrap gap-3">
                    <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1 || loading}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages || loading}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AllInOneTransactions;
