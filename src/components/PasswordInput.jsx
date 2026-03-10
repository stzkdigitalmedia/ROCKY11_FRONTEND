import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ 
  name, 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  required = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        name={name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`pr-10 ${className}`}
        required={required}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;