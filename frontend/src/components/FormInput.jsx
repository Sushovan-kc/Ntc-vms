import React from 'react';

const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  required = false 
}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={name} 
        // 🟢 FIXED: Updated text-ntc-dark-text to text-ntc-dark-text
        className="block font-medium text-ntc-dark-text text-[0.9rem] mb-1.5"
      >
        {label} {required && <span className="text-ntc-danger">*</span>}
      </label>
      
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        // 🟢 FIXED: Updated classes to match your nested tailwind config structure (ntc-danger and ntc-blue)
        className={`w-full p-3 border rounded-lg text-sm transition-all duration-200 outline-none
          ${error 
            ? 'border-ntc-danger focus:ring-4 focus:ring-ntc-danger/15 text-red-900 placeholder-red-300' 
            : 'border-gray-300 focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15 text-gray-900'
          }`}
      />
      
      {/* 🟢 FIXED: Updated text-ntc-danger to text-ntc-danger */}
      {error && (
        <div className="text-ntc-danger text-xs mt-1.5 font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormInput;
