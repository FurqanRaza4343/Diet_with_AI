import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FaRobot, FaArrowRight, FaUtensils, FaShoppingBag, FaHeartbeat, 
  FaCommentDots, FaCamera, FaStar, FaUsers, FaCheckCircle,
  FaLeaf, FaMicrophone, FaShieldAlt, FaCloudSun
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import HeroSection from '../../components/common/HeroSection';

const features = [
  { icon: FaRobot, title: 'AI-Powered Planning', desc: 'Get personalized meal plans tailored to your goals, allergies, and preferences.', color: 'from-primary-500 to-primary-700', path: '/ai-planner' },
  { icon: FaCamera, title: 'Smart Food Scanner', desc: 'Upload food images to detect ingredients and get instant nutrition info.', color: 'from-primary-500 to-emerald-600', path: '/food-scanner' },
  { icon: FaCommentDots, title: 'AI Nutrition Chatbot', desc: 'Ask anything about diet, fitness, and get expert advice in real-time.', color: 'from-purple-500 to-pink-500', path: '/chat' },
  { icon: FaHeartbeat, title: 'Health Analytics', desc: 'Monitor your BMI, weight, water intake, and workout progress with charts.', color: 'from-red-500 to-orange-500', path: '/health-tracker' },
  { icon: FaShoppingBag, title: 'Smart Grocery Lists', desc: 'Generate automatic grocery lists with budget tracking and categories.', color: 'from-amber-500 to-yellow-500', path: '/grocery' },
  { icon: FaStar, title: 'Weekly Meal Plans', desc: 'Plan your entire week with balanced breakfast, lunch, dinner, and snacks.', color: 'from-teal-500 to-cyan-500', path: '/weekly-planner' },
];

const LandingPage = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div>
      <HeroSection />

      <section id="features" className="py-24 bg-[#fcf8fa]">
        <div className="max-w-7xl mx-auto px-6" ref={ref}>
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-on-surface">
              Everything You Need for <span className="gradient-text">Smart Nutrition</span>
            </h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">AI-powered tools to plan, track, and optimize your diet.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Link key={i} to={f.path}>
                <motion.div
                  className="group relative overflow-hidden rounded-2xl bg-white border border-[#e5e1e3] hover:border-primary-300 transition-all duration-500 cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(34,197,94,0.15)' }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-${i === 0 ? '1535378917042-10a22c95931a' : i === 1 ? '1547592180-85f173990554' : i === 2 ? '1531746020798-e6953c6e8e04' : i === 3 ? '1571019613454-1cb2f99b2d8b' : i === 4 ? '1542838132-92c53300491e' : '1546069901-ba9599a7e63c'}?w=400&h=300&fit=crop`} alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                    <div className={`absolute bottom-4 left-4 bg-gradient-to-r ${f.color} p-2.5 rounded-xl shadow-lg`}>
                      <f.icon className="text-white text-lg" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 text-on-surface">{f.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-y border-[#e5e1e3]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Meal Plans Generated', icon: FaUtensils },
              { value: '98%', label: 'User Satisfaction', icon: FaStar },
              { value: '4.9', label: 'Average Rating', icon: FaCheckCircle },
              { value: '5K+', label: 'Active Users', icon: FaUsers },
            ].map((s, i) => (
              <motion.div key={i} className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <s.icon className="text-3xl text-primary-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary-600">{s.value}</div>
                <div className="text-on-surface-variant text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#fcf8fa]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-bold mt-3 mb-4 text-on-surface">What Our <span className="gradient-text">Users Say</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Johnson', role: 'Fitness Enthusiast', text: 'This AI diet planner completely transformed my eating habits. I\'ve lost 15 pounds in just 2 months!' },
              { name: 'Mike Chen', role: 'Professional Athlete', text: 'The meal plans are tailored perfectly to my training needs. My performance has improved significantly.' },
              { name: 'Emily Davis', role: 'Health Coach', text: 'I recommend this to all my clients. The AI recommendations are spot-on and easy to follow.' },
            ].map((t, i) => (
              <motion.div key={i}
                className="bg-white rounded-2xl p-6 border border-[#e5e1e3] hover:border-primary-200 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.05)' }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface">{t.name}</h4>
                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
                <div className="flex text-amber-400 mb-2 gap-0.5">{[...Array(5)].map((_, j) => <FaStar key={j} className="text-sm" />)}</div>
                <p className="text-on-surface-variant text-sm leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-[#e5e1e3]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 via-white/50 to-primary-50/50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-on-surface">Ready to Transform Your Diet?</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto mb-8">
                Join thousands of users who are achieving their health goals with AI-powered meal planning.
              </p>
              <Link to="/register" className="btn-primary btn-large inline-flex">
                Get Started Free <FaArrowRight className="ml-2" />
              </Link>
              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5"><FaShieldAlt className="text-primary-500" /> 256-bit SSL</span>
                <span className="flex items-center gap-1.5"><FaCloudSun className="text-primary-500" /> Cloud Sync</span>
                <span className="flex items-center gap-1.5"><FaMicrophone className="text-primary-500" /> Voice Input</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5e1e3] py-8 bg-[#fcf8fa]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaLeaf className="text-primary-500" />
            <span className="font-bold text-on-surface">VitaAI</span>
            <span className="text-on-surface-variant text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-on-surface-variant">
            {['Privacy', 'Terms', 'Support', 'Blog'].map((item, i) => (
              <a key={i} href="#" className="hover:text-on-surface transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
