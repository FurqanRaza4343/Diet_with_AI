import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-400/20 border-t-primary-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-accent/20 border-b-accent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-text-secondary text-sm animate-pulse">{message}</p>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;