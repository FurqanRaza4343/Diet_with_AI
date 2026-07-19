import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export const useMouseParallax = (springConfig = { damping: 25, stiffness: 150 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const mouseX = useSpring(mousePosition.x, springConfig);
  const mouseY = useSpring(mousePosition.y, springConfig);

  const getParallaxStyle = (strength = 10) => ({
    rotateX: useTransform(mouseY, [-1, 1], [strength / 2, -strength / 2]),
    rotateY: useTransform(mouseX, [-1, 1], [-strength / 2, strength / 2]),
  });

  const getTranslateStyle = (strength = 20) => ({
    x: useTransform(mouseX, [-1, 1], [-strength, strength]),
    y: useTransform(mouseY, [-1, 1], [-strength, strength]),
  });

  return { mouseX, mouseY, getParallaxStyle, getTranslateStyle };
};
