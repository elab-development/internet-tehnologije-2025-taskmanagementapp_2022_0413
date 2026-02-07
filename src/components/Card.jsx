import React from 'react';

const Card = ({ 
  children, 
  title = null,
  className = '',
  hoverable = false,
  onClick = null,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-800/90 rounded-xl border border-slate-700/50 p-6
        ${hoverable ? 'hover:border-slate-600/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {title && (
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;