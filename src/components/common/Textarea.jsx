import React from 'react';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  className = '',
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-primary-950/50 border ${
          error ? 'border-danger/50 focus:border-danger' : 'border-white/10 focus:border-primary-400/50'
        } rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none transition-colors duration-300 resize-y ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};

export default Textarea;