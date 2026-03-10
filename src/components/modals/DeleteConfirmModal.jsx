import { X } from 'lucide-react';



const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    accountId
}) => {
    // Don't render if modal is closed
    if (!isOpen) return null;

    console.log('--------DeleteConfirmModal-----')


    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
            <div className="gaming-card p-4 sm:p-6 max-w-md w-full mx-4">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                        <p className="text-gray-600 text-sm mt-1">ID: {accountId || 'N/A'}</p>
                    </div>
                    {/* Hide close button during loading to prevent accidental close */}
                    {!isLoading && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">Deleting Account...</p>
                        <p className="text-sm text-gray-600">Please wait while we process your request</p>
                    </div>
                ) : (
                    // Confirmation Message
                    <div className="space-y-4">
                        <p className="text-gray-700">Are you sure you want to delete your ID?</p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={onClose}
                                className="w-full sm:flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
