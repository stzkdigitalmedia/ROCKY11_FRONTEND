import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * CreateIdModal Component
 * Allows users to create a new game sub-account (ID)
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Object} props.formData - Form data for ID creation
 * @param {Function} props.onInputChange - Callback for input changes
 * @param {Function} props.onSubmit - Callback for form submission
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {boolean} props.isCreated - Success state indicator
 * @param {Array} props.games - List of available games
 */
const CreateIdModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  isCreated,
  games
}) => {

      console.log('--------CreateIdModal-----')

  const { t } = useTranslation();

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
      <div className="gaming-card p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('createNewId')}</h2>
            <p className="text-gray-600 text-sm mt-1">
              Game: {games.find(g => (g.id || g._id) === formData.gameId)?.name || 'Select a game'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {isCreated ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-green-600 mb-2">{t('idCreated')}</p>
            <p className="text-sm text-gray-600">{t('idCreatedSuccess')}</p>
          </div>
        ) : isLoading ? (
          // Loading state
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
            <p className="text-lg font-semibold text-gray-900 mb-2">{t('creatingId')}</p>
            <p className="text-sm text-gray-600">{t('pleaseWait')}</p>
          </div>
        ) : (
          // Form
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">{t('clientName')}</label>
              <input
                type="text"
                name="clientName"
                placeholder={t('enterClientName')}
                value={formData.clientName}
                onChange={onInputChange}
                maxLength={6}
                className="gaming-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{t('maxChars')}</p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button type="submit" className="w-full sm:flex-1 gaming-btn">
                {t('createId')}
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

export default CreateIdModal;
