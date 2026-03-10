import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const SubUserDepositModal = ({
  isOpen,
  onClose,
  depositForm,
  onFormChange,
  onSubmit,
  isProcessing,
  userBalance,
  selectedSubUserId
}) => {
  const { t } = useTranslation();


      console.log('--------SubUserDepositModal-----')


  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
      <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('depositToSub')}</h2>
            <p className="text-gray-600 text-sm mt-1">ID: {selectedSubUserId || 'N/A'}</p>
            {/* Available Balance Display */}
            <div className="mt-2">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl shadow-sm">
                <span className="text-gray-700 font-medium text-sm">{t('availableBalance')}:</span>
                <span className="text-lg font-bold" style={{ color: '#1477b0' }}>
                  ₹{userBalance}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
            <p className="text-lg font-semibold text-gray-900 mb-2">{t('processing')}...</p>
            <p className="text-sm text-gray-600">Please wait while we process your deposit</p>
          </div>
        ) : (
          // Deposit Form
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Amount Field */}
            <div className="form-group">
              <label className="form-label">{t('amount')} ({t('minimumAmount')})</label>
              <input
                type="number"
                placeholder={t('enterAmount')}
                value={depositForm.amount}
                onChange={(e) => onFormChange({ ...depositForm, amount: e.target.value })}
                onWheel={(e) => e.target.blur()}
                className="gaming-input"
                required
                min="100"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button type="submit" className="w-full sm:flex-1 gaming-btn">
                {t('deposit')}
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

export default SubUserDepositModal;
