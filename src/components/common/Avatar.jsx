import React from 'react';

const Avatar = ({
  src,
  name,
  size = 'medium',
  className = '',
  ...props
}) => {
  const sizes = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center font-bold text-primary-950 ${sizes[size]} ${className}`}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;