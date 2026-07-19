import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';
import { Check } from 'lucide-react';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

const services = ['Meal Planning', 'Calorie Tracking', 'Macro Counting', 'Health Analytics'];
const navLinks = ['Features', 'How It Works', 'Contact'];

const springSlow = { type: "spring", stiffness: 80, damping: 20, mass: 1 };
const springBouncy = { type: "spring", stiffness: 250, damping: 18 };

const HeroSection = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const targetTimeRef = useRef(0);
  const rafRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState(['Meal Planning', 'Calorie Tracking']);

  const { displayed, done } = useTypewriter("we'd love to\nhear from you!", 38, 600);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.innerWidth < 1024) {
      video.autoplay = true;
      video.play();
      return;
    }

    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !video.duration) return;
      const x = (e.clientX - rect.left) / rect.width;
      targetTimeRef.current = Math.max(0, Math.min(video.duration, x * video.duration));
    };

    const tick = () => {
      if (video.readyState > 0) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.01) {
          video.currentTime += diff * 0.15;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  return (
    <div ref={containerRef} className="relative bg-[#fcf8fa] text-on-surface font-sans selection:bg-primary-400/30 selection:text-white antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen">
      <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-[#fcf8fa] lg:bg-transparent">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-right lg:object-right-bottom opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fcf8fa]/90 via-[#fcf8fa]/50 to-[#fcf8fa]/90" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-transparent"
      >
        <Link to="/" className="flex flex-row items-center gap-3">
          <span className="text-[25px] sm:text-[30px] text-primary-500 select-none tracking-[-0.02em] font-medium leading-none mb-1">&#10033;</span>
          <span className="text-[21px] sm:text-[26px] tracking-tight text-on-surface font-medium select-none">DietAI&reg;</span>
        </Link>

        <div className="hidden md:flex flex-row items-center gap-0 text-lg text-on-surface-variant">
          {navLinks.map((link, i) => (
            <React.Fragment key={link}>
              {i > 0 && <span className="opacity-40 mx-1">/</span>}
              <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-on-surface transition-colors px-2">
                {link}
              </a>
            </React.Fragment>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">Log In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-[2px] bg-on-surface transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`w-6 h-[2px] bg-on-surface transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-[2px] bg-on-surface transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9] bg-[#fcf8fa]/95 backdrop-blur-md md:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8 text-xl font-medium">
              {navLinks.map((link) => (
                <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                   className="text-on-surface-variant hover:text-on-surface transition-colors"
                   onClick={() => setIsMobileMenuOpen(false)}>
                  {link}
                </a>
              ))}
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/login" className="text-on-surface-variant hover:text-on-surface" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col order-first lg:order-none w-full pb-8 lg:pb-0 lg:min-h-screen">
        <main id="spade-hero" className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pt-24 lg:pt-0"
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-2 text-sm font-medium text-primary-700 mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              AI-Powered Nutrition
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[76px] font-bold tracking-tight text-on-surface leading-[1.08] mb-6 select-none w-full whitespace-pre-wrap">
              {displayed}
              {!done && <span className="inline-block w-[2px] h-[1.1em] bg-primary-500 align-middle ml-[2px] animate-blink" />}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-normal mb-14 max-w-2xl">
              Whether you want to lose weight, build muscle, or just eat healthier,<br /> our AI creates personalized meal plans tailored to your goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-on-surface">What sort of nutrition support?</h2>
            <p className="text-on-surface-variant/70 mb-8">Select all that apply</p>

            <div className="flex flex-wrap gap-3 mb-6">
              {services.map((service, i) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <motion.button
                    key={service}
                    onClick={() => toggleService(service)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, ...springSlow }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 border border-primary-500'
                        : 'bg-white text-on-surface border border-[#e5e1e3] hover:bg-[#f1edee] hover:border-[#c8c5cc]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={springBouncy}
                        >
                          <Check size={14} />
                        </motion.span>
                      )}
                      {service}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {selectedServices.length === 0 ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="italic text-xs text-on-surface-variant"
                >
                  Please click to select services above.
                </motion.p>
              ) : (
                <motion.div
                  key="active"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    transition={springSlow}
                    className="bg-[#f6f3f4] border border-[#e5e1e3] rounded-2xl p-4 flex items-center justify-between"
                  >
                    <span className="text-sm text-on-surface-variant">
                      Ready to start with: <strong className="text-primary-700">{selectedServices.join(', ')}</strong>
                    </span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/register" className="text-primary-600 uppercase text-xs font-semibold hover:underline whitespace-nowrap ml-4">
                        Let's Go &rarr;
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default HeroSection;
