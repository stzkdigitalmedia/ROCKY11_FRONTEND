import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const AddBankModal = ({
  isOpen,
  onClose,
  bankForm,
  onBankFormChange,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // UPI ID validation
    if (!bankForm.upiId?.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(bankForm.upiId.trim())) {
      newErrors.upiId = 'Invalid UPI ID format (e.g. name@bank)';
    }

    // Bank Name
    if (!bankForm.bankName?.trim()) {
      newErrors.bankName = 'Bank name is required';
    } else if (bankForm.bankName.trim().length < 3) {
      newErrors.bankName = 'Bank name must be at least 3 characters';
    }

    // Account Number
    if (!bankForm.accountNumber?.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^[0-9]{9,18}$/.test(bankForm.accountNumber.trim())) {
      newErrors.accountNumber = 'Account number must be 9-18 digits';
    }

    // Account Holder Name
    if (!bankForm.accountHolderName?.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    } else if (!/^[a-zA-Z ]+$/.test(bankForm.accountHolderName.trim())) {
      newErrors.accountHolderName = 'Only letters and spaces allowed';
    }

    // IFSC Code
    if (!bankForm.ifscCode?.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankForm.ifscCode.trim().toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code (e.g. SBIN0001234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Ensure IFSC is uppercase in payload before submitting
    onBankFormChange({ ...bankForm, ifscCode: bankForm.ifscCode.trim().toUpperCase() });
    onSubmit(e);
  };

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UPI ID Field */}
          <div className="form-group">
            <label className="form-label">{t('upiId')}</label>
            <input
              type="text"
              placeholder={t('enterUpiId')}
              value={bankForm.upiId}
              onChange={(e) => { onBankFormChange({ ...bankForm, upiId: e.target.value }); setErrors(p => ({ ...p, upiId: '' })); }}
              className="gaming-input"
            />
            {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
          </div>

          {/* Bank Name Field */}
          <div className="form-group">
            <label className="form-label">{t('bankName')}</label>
            <input
              type="text"
              placeholder={t('enterBankName')}
              value={bankForm.bankName}
              onChange={(e) => { onBankFormChange({ ...bankForm, bankName: e.target.value }); setErrors(p => ({ ...p, bankName: '' })); }}
              className="gaming-input"
            />
            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
          </div>

          {/* Account Number Field */}
          <div className="form-group">
            <label className="form-label">{t('accountNumber')}</label>
            <input
              type="text"
              placeholder={t('enterAccountNumber')}
              value={bankForm.accountNumber}
              onChange={(e) => { onBankFormChange({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') }); setErrors(p => ({ ...p, accountNumber: '' })); }}
              className="gaming-input"
            />
            {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
          </div>

          {/* Account Holder Name Field */}
          <div className="form-group">
            <label className="form-label">{t('accountHolder')}</label>
            <input
              type="text"
              placeholder={t('enterAccountHolder')}
              value={bankForm.accountHolderName}
              onChange={(e) => { onBankFormChange({ ...bankForm, accountHolderName: e.target.value }); setErrors(p => ({ ...p, accountHolderName: '' })); }}
              className="gaming-input"
            />
            {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
          </div>

          {/* IFSC Code Field */}
          <div className="form-group">
            <label className="form-label">{t('ifscCode')}</label>
            <input
              type="text"
              placeholder={t('enterIfscCode')}
              value={bankForm.ifscCode}
              onChange={(e) => {
                onBankFormChange({ ...bankForm, ifscCode: e.target.value.toUpperCase() });
                setErrors(p => ({ ...p, ifscCode: '' }));
              }}
              className="gaming-input uppercase"
            />
            {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
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
