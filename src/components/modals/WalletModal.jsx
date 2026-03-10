import { X, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * WalletModal Component
 * Displays transaction history with filtering and pagination capabilities
 * Shows all user transactions in a detailed table format
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Array} props.transactions - List of user transactions
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback for filter changes
 * @param {Function} props.onApplyFilters - Callback to apply filters
 * @param {Function} props.onClearFilters - Callback to clear filters
 * @param {boolean} props.isLoading - Loading state for transactions
 * @param {number} props.currentPage - Current pagination page
 * @param {Function} props.onPageChange - Callback for page navigation
 * @param {Function} props.onViewScreenshot - Callback to view transaction screenshot
 */
const WalletModal = ({
  isOpen,
  onClose,
  transactions,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  isLoading,
  currentPage,
  onPageChange,
  onViewScreenshot
}) => {
  const { t } = useTranslation();

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
      <div className="gaming-card p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('transactionHistory')}</h2>
            <p className="text-gray-600 text-sm mt-1">{t('viewHistory')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">{t('allStatus')}</option>
                <option value="Initial">{t('initial')}</option>
                <option value="Pending">{t('pending')}</option>
                <option value="Accept">{t('accept')}</option>
                <option value="Reject">{t('reject')}</option>
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
              <select
                value={filters.transactionType}
                onChange={(e) => onFilterChange('transactionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">{t('allTypes')}</option>
                <option value="Deposit">{t('deposit')}</option>
                <option value="Withdrawal">{t('withdraw')}</option>
              </select>
            </div>

            {/* Minimum Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')} (Min)</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => onFilterChange('minAmount', e.target.value)}
                placeholder="Min amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Maximum Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')} (Max)</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => onFilterChange('maxAmount', e.target.value)}
                placeholder="Max amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              {t('applyFilters')}
            </button>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              {t('clearFilters')}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
            <p className="text-gray-600">{t('loadingTransactions')}...</p>
          </div>
        ) : transactions.length === 0 ? (
          // Empty State
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">{t('noTransactions')}</p>
            <p className="text-sm">{t('requestFirstTransaction')}</p>
          </div>
        ) : (
          // Transactions Table
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="table-header">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Game Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('clientName')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction From</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('createdAt')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id || transaction._id || index} className="table-row border-b border-gray-100">
                    {/* Row Number */}
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900">{((currentPage - 1) * 10) + index + 1}</p>
                    </td>
                    {/* Action Column - Screenshot Button */}
                    <td className="py-4 px-4">
                      {transaction?.transactionType === 'Withdrawal' && transaction?.mode === 'PowerPay' && transaction?.status === 'Accept' && (
                        <button
                          onClick={() => onViewScreenshot(transaction?._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                    {/* Amount Column */}
                    <td className="py-4 px-4">
                      <p className={`text-sm font-medium ${transaction.transactionType === 'Deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.transactionType === 'Deposit' ? '+' : '-'}₹{transaction.amount}
                      </p>
                    </td>
                    {/* Type Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${transaction.transactionType === 'Deposit'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transactionType}
                      </span>
                    </td>
                    {/* Game Name */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{transaction.gameName || 'Main Wallet'}</p>
                    </td>
                    {/* Client Name */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{transaction.clientName || 'N/A'}</p>
                    </td>
                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${transaction.status === 'Accept'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'Reject'
                          ? 'bg-red-100 text-red-800'
                          : transaction.status === 'Pending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status || 'Pending'}
                      </span>
                    </td>
                    {/* Remarks */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{transaction.remarks || 'No remark'}</p>
                    </td>
                    {/* Transaction Mode */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">
                        {transaction.mode === "Wallet"
                          ? "Game Transaction"
                          : transaction.mode === "PowerPay"
                            ? "Wallet Transaction"
                            : transaction.mode}
                      </p>
                    </td>
                    {/* Created Date */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{new Date(transaction.createdAt).toLocaleString('en-IN', { hour12: true })}</p>
                    </td>
                    {/* Updated Date */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString('en-IN', { hour12: true }) : 'N/A'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {t('showingPage')} {currentPage} {t('transactions')}
              </div>
              <div className="flex items-center gap-2">
                {/* Previous Page Button */}
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previous')}
                </button>
                {/* Current Page Indicator */}
                <span className="px-3 py-2 text-sm bg-gray-100 rounded-lg">
                  {t('page')} {currentPage}
                </span>
                {/* Next Page Button */}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
