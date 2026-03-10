import { useState } from 'react';
import { apiHelper } from '../utils/apiHelper';
import { useToastContext } from '../App';
import { X, Check } from 'lucide-react';
import PasswordInput from './PasswordInput';
import PhoneInput from './PhoneInput';

const AddUserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    fullName: '',
    email: '',
    password: '',
    transactionPassword: '',
    city: '',
    phone: '',
    branchName: '',
    role: 'User'
  });
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await apiHelper.post('/user/register', formData);
      toast.success('User added successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to add user: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
      <div className="gaming-card p-6 max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
            <p className="text-gray-600 text-sm mt-1">Create a new user account</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input name="clientName" placeholder="Enter username" value={formData.clientName} onChange={handleChange} className="gaming-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="fullName" placeholder="Enter full name" value={formData.fullName} onChange={handleChange} className="gaming-input" required />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} className="gaming-input" required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Password</label>
              <PasswordInput name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} className="gaming-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Transaction PIN</label>
              <PasswordInput name="transactionPassword" placeholder="Enter PIN" value={formData.transactionPassword} onChange={handleChange} className="gaming-input" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">City</label>
              <input name="city" placeholder="Enter city" value={formData.city} onChange={handleChange} className="gaming-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <PhoneInput value={formData.phone} onChange={(value) => setFormData({...formData, phone: value})} placeholder="Enter mobile number" />
            </div>
          </div>
          
          <div className="form-group mb-6">
            <label className="form-label">Branch Name</label>
            <input name="branchName" placeholder="Enter branch name" value={formData.branchName} onChange={handleChange} className="gaming-input" required />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 gaming-btn flex items-center justify-center">
              {loading ? (
                <><span className="loading-spinner mr-2"></span>Adding...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Add User</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;