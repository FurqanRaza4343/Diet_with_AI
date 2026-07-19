import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceStatus = ({ isVisible, isRecording, transcript, error }) => {
  if (!isVisible) return null;

  const getStatusConfig = () => {
    if (error) {
      return {
        bg: 'bg-danger/10',
        border: 'border-danger/20',
        text: 'text-danger',
        icon: '❌',
        message: `Error: ${error}`,
      };
    }
    if (isRecording) {
      return {
        bg: 'bg-info/10',
        border: 'border-info/20',
        text: 'text-info',
        icon: '🎤',
        message: 'Listening... Speak now',
      };
    }
    if (transcript) {
      return {
        bg: 'bg-success/10',
        border: 'border-success/20',
        text: 'text-success',
        icon: '📝',
        message: `You said: "${transcript}"`,
      };
    }
    return {
      bg: 'bg-white/5',
      border: 'border-white/5',
      text: 'text-text-muted',
      icon: '💬',
      message: 'Ready to listen',
    };
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mt-3 p-3 rounded-xl border ${config.bg} ${config.border} ${config.text}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm">{config.message}</span>
          {isRecording && (
            <span className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 bg-danger rounded-full animate-pulse"></span>
              <span className="text-xs text-danger">Recording</span>
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceStatus;