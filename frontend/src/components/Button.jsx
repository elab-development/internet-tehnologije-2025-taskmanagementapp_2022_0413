import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  icon = null,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variants = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-500 disabled:bg-indigo-500/40 disabled:cursor-not-allowed shadow-sm hover:shadow-md',
    secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed',
    danger: 'bg-purple-500 text-white hover:bg-rose-600 focus:ring-purple-500 disabled:bg-purple-500/40 disabled:cursor-not-allowed shadow-sm hover:shadow-md',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 disabled:bg-emerald-500/40 disabled:cursor-not-allowed shadow-sm hover:shadow-md',
    outline: 'bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 focus:ring-indigo-500 disabled:border-indigo-500/40 disabled:text-indigo-500/40 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-slate-500 disabled:text-slate-600 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;