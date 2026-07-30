import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import client from '../../lib/insforge';

const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m your AI nutrition assistant. How can I help you today?', sender: 'ai' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const userMsg = message.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await client.functions.invoke('chat', {
        body: { message: userMsg },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { text: data.reply, sender: 'ai' }]);
    } catch {
      setMessages(prev => [...prev, { text: 'I\'m having trouble connecting right now. Please try again later.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 shadow-[0_8px_32px_rgba(74,222,128,0.4)] flex items-center justify-center hover:scale-105 transition-all duration-300"
      >
        {isOpen ? <FaTimes className="text-2xl text-primary-950" /> : <FaRobot className="text-2xl text-primary-950" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-96 glass-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="glass px-4 py-3 border-b border-white/5 flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse"></div>
              <span className="font-semibold">AI Nutrition Assistant</span>
              <span className="text-xs text-text-muted ml-auto">Online</span>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary-400/20 text-text-primary' : 'glass text-text-secondary'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about nutrition..."
                className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-primary-400 text-primary-950 flex items-center justify-center hover:bg-primary-500 transition-colors disabled:opacity-50"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIAssistant;
