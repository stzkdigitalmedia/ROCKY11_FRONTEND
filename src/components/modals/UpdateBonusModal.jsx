import { X } from 'lucide-react';

const UpdateBonusModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  onFormChange, 
  onSubmit, 
  updating, 
  tiers, 
  selectedBonus 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Update Bonus</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Name</label>
              <input
                type="text"
                value={formData.bonusName}
                onChange={(e) => onFormChange({ ...formData, bonusName: e.target.value })}
                placeholder="Enter bonus name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Type</label>
              <select
                value={formData.bonusType}
                onChange={(e) => onFormChange({ ...formData, bonusType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select Bonus Type</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Value</label>
              <input
                type="number"
                value={formData.bonusValue}
                onChange={(e) => onFormChange({ ...formData, bonusValue: e.target.value })}
                placeholder="Enter bonus value"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Category</label>
              <select
                value={formData.bonusCategory}
                onChange={(e) => onFormChange({ ...formData, bonusCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select Category</option>
                <option value="FTD">FTD</option>
                <option value="OnDeposit">OnDeposit</option>
                <option value="LossBack">LossBack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormChange({ ...formData, startDate: e.target.value })}
                placeholder="Select start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormChange({ ...formData, endDate: e.target.value })}
                placeholder="Select end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
              <select
                value={formData.tierId}
                onChange={(e) => onFormChange({ ...formData, tierId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Tier</option>
                {tiers.map((tier) => (
                  <option key={tier._id || tier.id} value={tier._id || tier.id}>
                    {tier.teirName || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => onFormChange({ ...formData, maxAmount: e.target.value })}
                placeholder="Enter max amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFormChange({ ...formData, image: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {selectedBonus?.bonusImage && (
                <img src={selectedBonus.bonusImage} alt="Current" className="mt-2 h-20 rounded" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Bonus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBonusModal;
