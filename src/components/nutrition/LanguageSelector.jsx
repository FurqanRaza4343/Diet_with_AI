import React from 'react';
import { motion } from 'framer-motion';

const languages = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'ur', label: '🇵🇰 Urdu' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'zh', label: '🇨🇳 Chinese' },
  { code: 'ja', label: '🇯🇵 Japanese' },
];

const LanguageSelector = ({ language, onLanguageChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-end gap-3 mb-4 flex-wrap"
    >
      <span className="text-text-muted text-sm">🌐 Language:</span>
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:border-primary-400/50 transition-colors"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-primary-950">
            {lang.label}
          </option>
        ))}
      </select>
      <span className="bg-success/20 text-success text-xs px-2 py-1 rounded-full">
        FREE
      </span>
    </motion.div>
  );
};

export default LanguageSelector;