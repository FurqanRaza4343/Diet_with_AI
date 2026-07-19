import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import MobileBottomNav from '../common/MobileBottomNav';
import FloatingAIAssistant from '../common/FloatingAIAssistant';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fcf8fa]">
      <Sidebar />
      <Navbar />
      <main className="lg:ml-[72px] pt-16 pb-20 md:pb-6 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileBottomNav />
      <FloatingAIAssistant />
    </div>
  );
};

export default MainLayout;
