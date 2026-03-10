import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const SubUserWithdrawModal = ({
    isOpen,
    onClose,
    withdrawForm,
    onFormChange,
    onSubmit,
    isProcessing,
    subUserBalance,
    isBalanceLoading,
    selectedSubUserId
}) => {
    const { t } = useTranslation();



    console.log('--------SubUserWithdrawModal-----')

    // Don't render if modal is closed
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('withdrawFromSub')}</h2>
                        <p className="text-gray-600 text-sm mt-1">ID: {selectedSubUserId || 'N/A'}</p>
                        {/* Sub User Balance Display */}
                        <div className="mt-2">
                            {isBalanceLoading ? (
                                <div className="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-xl shadow-sm">
                                    {/* Loading Spinner */}
                                    <div className="w-5 h-5 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    {/* Loading Text */}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">{t('balance')}</span>
                                        <span className="text-sm text-gray-500 animate-pulse">{t('loading')}...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl shadow-sm">
                                    <span className="text-gray-700 font-medium text-sm">{t('balance')}:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ₹{Number(subUserBalance).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Loading State for Balance */}
                {isBalanceLoading ? (
                    <div className="text-center py-8">
                        <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">{t('loadingBalance')}</p>
                        <p className="text-sm text-gray-600">Please wait while we fetch the current balance</p>
                    </div>
                ) : (
                    // Withdraw Form
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Amount Field - Minimum ₹500 */}
                        <div className="form-group">
                            <label className="form-label">Amount (Minimum ₹500)</label>
                            <input
                                type="number"
                                placeholder="Enter Amount (min 500)"
                                value={withdrawForm.amount}
                                onChange={(e) => onFormChange({ ...withdrawForm, amount: e.target.value })}
                                onWheel={(e) => e.target.blur()}
                                className="gaming-input"
                                required
                                min="500"
                            />
                        </div>

                        {/* Bank Selection Section - Currently Commented Out */}
                        {/* Bank selection will be implemented when needed */}

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button type="submit" disabled={isProcessing} className="w-full sm:flex-1 gaming-btn">
                                {isProcessing ? (
                                    <>{t('processing')}</>
                                ) : (
                                    <>{t('withdraw')}</>
                                )}
                            </button>
                            <button type="button" onClick={onClose} className="w-full sm:flex-1 btn-secondary">
                                {t('cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SubUserWithdrawModal;
