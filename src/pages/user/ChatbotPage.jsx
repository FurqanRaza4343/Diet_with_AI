import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Bot, User, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../lib/insforge';

const quickQuestions = [
  'What should I eat for breakfast?',
  'How much water should I drink daily?',
  'Best foods for muscle gain?',
  'How many calories do I need?',
  'Healthy snacks for weight loss?',
  'What are good sources of protein?',
];

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', text: "Hi! I'm your AI nutrition assistant. Ask me anything about diet, nutrition, and fitness!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg, timestamp: new Date() }]);
    setLoading(true);
    try {
      const { data, error } = await client.functions.invoke('ai-chat', {
        body: { message: userMsg, history: messages.slice(-10).map(m => ({ role: m.role, text: m.text })) },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: data.response || data.message || 'Got it!', timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        text: getFallbackResponse(userMsg),
        timestamp: new Date(), isFallback: true,
      }]);
    } finally { setLoading(false); }
  };

  const getFallbackResponse = (question) => {
    const q = question.toLowerCase();
    if (q.includes('breakfast')) return 'A balanced breakfast should include protein (eggs, yogurt), complex carbs (oats, whole grain toast), and healthy fats (avocado, nuts). Aim for 300-400 calories.';
    if (q.includes('water')) return 'The general recommendation is 8 glasses (about 2 liters) per day, but it varies based on activity level, climate, and body size. A simple rule: drink when thirsty and keep urine light yellow.';
    if (q.includes('muscle') || q.includes('protein')) return 'For muscle gain, aim for 1.6-2.2g of protein per kg of body weight. Great sources: chicken breast, eggs, Greek yogurt, tofu, lentils, and protein shakes. Combine with progressive resistance training.';
    if (q.includes('calories')) return 'Daily calorie needs depend on age, gender, weight, height, and activity level. For most adults: 1800-2400 kcal for women, 2200-3000 kcal for men. Use a TDEE calculator for precision.';
    if (q.includes('snack') || q.includes('weight loss')) return 'Healthy low-calorie snacks: apple slices with almond butter, Greek yogurt with berries, carrot sticks with hummus, a handful of nuts, or rice cakes with avocado. Aim for 100-200 calorie snacks.';
    if (q.includes('protein source')) return 'Top protein sources: chicken breast (31g/100g), eggs (13g/100g), Greek yogurt (10g/100g), tofu (8g/100g), lentils (9g/100g), cottage cheese (11g/100g), and fish like salmon (20g/100g).';
    return 'Great question! For personalized nutrition advice, try our AI meal planner or food scanner features. In general, focus on whole foods, balanced macros, and staying hydrated.';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
          <MessageCircle className="text-primary-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">AI Nutrition Chatbot</h1>
          <p className="text-on-surface-variant text-sm">Ask anything about diet, fitness, and nutrition</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-100' : 'bg-[#f1edee]'}`}>
              {msg.role === 'user' ? <User size={16} className="text-primary-600" /> : <Bot size={16} className="text-on-surface-variant" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-[#e5e1e3] text-on-surface'} rounded-2xl px-4 py-3`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              {msg.isFallback && (
                <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
                  <Sparkles size={12} /> AI response (offline mode)
                </p>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f1edee] flex items-center justify-center shrink-0">
              <Bot size={16} className="text-on-surface-variant" />
            </div>
            <div className="bg-white border border-[#e5e1e3] rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 space-y-3">
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button key={i} onClick={() => handleSend(q)}
                className="text-xs bg-white border border-[#e5e1e3] px-3 py-1.5 rounded-full text-on-surface-variant hover:border-primary-300 hover:text-primary-600 transition-colors"
              >{q}</button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Ask about nutrition, diet, or fitness..."
            className="flex-1 px-4 py-3 bg-white border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all"
            disabled={loading}
          />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
