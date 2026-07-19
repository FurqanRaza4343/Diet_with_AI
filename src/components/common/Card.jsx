import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  variant = 'default',
  ...props 
}) => {
  const baseClass = 'rounded-2xl p-6 transition-all duration-300';
  
  const variants = {
    default: 'bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary-400/30',
    glass: 'glass backdrop-blur-sm border border-white/10 hover:border-primary-400/30',
    dark: 'bg-primary-900/50 border border-white/5 hover:border-primary-400/20',
    gradient: 'bg-gradient-to-br from-primary-400/10 to-accent/5 border border-primary-400/20 hover:border-primary-400/40',
  };

  const hoverClass = hover ? 'hover:-translate-y-1 hover:shadow-xl' : '';

  return (
    <div className={`${baseClass} ${variants[variant] || variants.default} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;