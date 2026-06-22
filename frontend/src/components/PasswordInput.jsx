import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = "Enter password", 
  error, 
  required = false,
  showStrength = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pass) => {
    if (!pass) return '';
    let score = 0;
    if (pass.length > 8) score += 1;
    if (pass.match(/[A-Z]/)) score += 1;
    if (pass.match(/[0-9]/)) score += 1;
    if (pass.match(/[^A-Za-z0-9]/)) score += 1;
    
    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  };

  const strength = calculateStrength(value);
  
  const getStrengthText = () => {
    if (strength === 'weak') return 'Weak';
    if (strength === 'medium') return 'Fair';
    if (strength === 'strong') return 'Strong';
    return '';
  };

  // 🟢 Helper to dynamically allocate Tailwind style classes for the meter fills
  const getStrengthClass = () => {
    if (strength === 'weak') return 'w-1/3 bg-ntc-danger';
    if (strength === 'medium') return 'w-2/3 bg-amber-500';
    if (strength === 'strong') return 'w-full bg-ntc-success';
    return 'w-0';
  };

  return (
    // 🟢 FIXED: Converted spacing properties to match the new Tailwind FormInput profile
    <div className="mb-4">
      <label 
        htmlFor={name} 
        className="block font-medium text-ntc-dark-text text-[0.9rem] mb-1.5"
      >
        {label} {required && <span className="text-ntc-danger">*</span>}
      </label>
      
      {/* 🟢 FIXED: Created relative wrapper layer replacing input-group framework */}
      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full p-3 pr-11 border rounded-lg text-sm transition-all duration-200 outline-none
            ${error 
              ? 'border-ntc-danger focus:ring-4 focus:ring-ntc-danger/15' 
              : 'border-gray-300 focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15'
            }`}
        />
        
        {/* 🟢 FIXED: Positioned icon inside input with cursor control classes */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 p-1 rounded-md text-ntc-muted hover:bg-gray-100 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <div className="text-ntc-danger text-xs mt-1.5 font-medium">
          {error}
        </div>
      )}
      
      {/* 🟢 FIXED: Converted password health parameters to use standard tailwind tracking rules */}
      {showStrength && value && (
        <div className="mt-2">
          <div className="h-1 w-full bg-gray-200 rounded-sm overflow-hidden">
            <div className={`h-full transition-all duration-300 ${getStrengthClass()}`} />
          </div>
          <p className="text-ntc-muted text-xs mt-1.5">
            Password strength: <span className="font-semibold">{getStrengthText()}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
