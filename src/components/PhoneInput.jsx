import { useState } from 'react';

const PhoneInput = ({ value = '', onChange, placeholder = "Enter mobile number", disabled = false, className = "gaming-input" }) => {
  const [phone, setPhone] = useState(value);

  const handleChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 10) {
      setPhone(input);
      onChange(input);
    }
  };

  return (
    <div className="relative">
      <input
        type="tel"
        value={phone}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        maxLength={10}
      />
      {phone && phone.length < 10 && (
        <p className="text-red-500 text-xs mt-1">Mobile number must be 10 digits</p>
      )}
    </div>
  );
};

export default PhoneInput;