import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  icon = null,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-purple-400">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 bg-slate-900/50 border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            text-slate-100 placeholder-slate-500
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-purple-500 focus:ring-purple-500' : 'border-slate-700'}
            ${disabled ? 'bg-slate-900/30 cursor-not-allowed text-slate-600' : ''}
          `}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-purple-400">{error}</p>}
    </div>
  );
};

export default Input;