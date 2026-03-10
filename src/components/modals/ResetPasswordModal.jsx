import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PasswordInput from '../PasswordInput';


const ResetPasswordModal = ({
    isOpen,
    onClose,
    passwordForm,
    onPasswordFormChange,
    onSubmit,
    isLoading,
    selectedSubUserId
}) => {
    const { t } = useTranslation();

    console.log('--------ResetPasswordModal-----')


    // Don't render if modal is closed
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('resetPassword')}</h2>
                        <p className="text-gray-600 text-sm mt-1">ID: {selectedSubUserId || 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">{t('processing')}...</p>
                        <p className="text-sm text-gray-600">Please wait while we process your password reset</p>
                    </div>
                ) : (
                    // Password Reset Form
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">{t('newPassword')}</label>
                            <PasswordInput
                                name="newPassword"
                                placeholder="Example@1256"
                                value={passwordForm.newPassword}
                                onChange={(e) => onPasswordFormChange({ ...passwordForm, newPassword: e.target.value })}
                                className="gaming-input"
                                required
                            />
                            {/* Password Requirements Hint */}
                            <p className="text-xs text-gray-500 mt-1">
                                Must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character.
                                Avoid common passwords and sequential patterns
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button type="submit" className="w-full sm:flex-1 gaming-btn">
                                {t('resetPassword')}
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

export default ResetPasswordModal;
