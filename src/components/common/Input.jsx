import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  icon,
  className = '',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClass = 'w-full bg-primary-950/50 border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none transition-colors duration-300';
  
  const stateClasses = error 
    ? 'border-danger/50 focus:border-danger' 
    : success 
      ? 'border-success/50 focus:border-success' 
      : 'border-white/10 focus:border-primary-400/50';

  const iconClass = icon ? 'pl-10' : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClass} ${stateClasses} ${iconClass} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      {success && <p className="mt-1 text-sm text-success">{success}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;