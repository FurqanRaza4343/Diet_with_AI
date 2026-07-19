import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-400 to-primary-500 text-primary-950 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_16px_40px_-8px_rgba(74,222,128,0.5)]',
    secondary: 'border border-white/15 bg-white/5 text-text-primary hover:bg-white/10 hover:border-white/30 hover:-translate-y-1',
    danger: 'bg-gradient-to-r from-danger to-red-600 text-white hover:scale-105 hover:-translate-y-1',
    success: 'bg-gradient-to-r from-success to-emerald-600 text-white hover:scale-105 hover:-translate-y-1',
    warning: 'bg-gradient-to-r from-warning to-yellow-600 text-primary-950 hover:scale-105 hover:-translate-y-1',
    info: 'bg-gradient-to-r from-info to-blue-600 text-white hover:scale-105 hover:-translate-y-1',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
    outline: 'border-2 border-primary-400 text-primary-400 hover:bg-primary-400/10 hover:-translate-y-1',
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed hover:scale-100 hover:-translate-y-0';

  const buttonClass = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.medium} ${disabled || loading ? disabledStyles : ''} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;