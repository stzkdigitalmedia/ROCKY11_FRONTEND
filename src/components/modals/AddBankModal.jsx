import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const AddBankModal = ({
  isOpen,
  onClose,
  bankForm,
  onBankFormChange,
  onSubmit
}) => {
  const { t } = useTranslation();


  console.log('--------bank-----')
  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[110]">
      <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('addBankDetails')}</h2>
            <p className="text-gray-600 text-sm mt-1">{t('saveBankForWithdrawals')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bank Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* UPI ID Field */}
          <div className="form-group">
            <label className="form-label">{t('upiId')}</label>
            <input
              type="text"
              placeholder={t('enterUpiId')}
              value={bankForm.upiId}
              onChange={(e) => onBankFormChange({ ...bankForm, upiId: e.target.value })}
              className="gaming-input"
              required
            />
          </div>

          {/* Bank Name Field */}
          <div className="form-group">
            <label className="form-label">{t('bankName')}</label>
            <input
              type="text"
              placeholder={t('enterBankName')}
              value={bankForm.bankName}
              onChange={(e) => onBankFormChange({ ...bankForm, bankName: e.target.value })}
              className="gaming-input"
              required
            />
          </div>

          {/* Account Number Field */}
          <div className="form-group">
            <label className="form-label">{t('accountNumber')}</label>
            <input
              type="text"
              placeholder={t('enterAccountNumber')}
              value={bankForm.accountNumber}
              onChange={(e) => onBankFormChange({ ...bankForm, accountNumber: e.target.value })}
              className="gaming-input"
              required
            />
          </div>

          {/* Account Holder Name Field */}
          <div className="form-group">
            <label className="form-label">{t('accountHolder')}</label>
            <input
              type="text"
              placeholder={t('enterAccountHolder')}
              value={bankForm.accountHolderName}
              onChange={(e) => onBankFormChange({ ...bankForm, accountHolderName: e.target.value })}
              className="gaming-input"
              required
            />
          </div>

          {/* IFSC Code Field */}
          <div className="form-group">
            <label className="form-label">{t('ifscCode')}</label>
            <input
              type="text"
              placeholder={t('enterIfscCode')}
              value={bankForm.ifscCode}
              onChange={(e) => onBankFormChange({ ...bankForm, ifscCode: e.target.value })}
              className="gaming-input"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} className="w-full sm:flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="w-full sm:flex-1 gaming-btn">
              {t('saveBank')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBankModal;
