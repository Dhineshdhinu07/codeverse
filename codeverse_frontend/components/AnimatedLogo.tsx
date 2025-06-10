'use client';
import { motion } from 'framer-motion';

export default function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <motion.h1
        className="text-6xl md:text-7xl font-bold leading-tight"
        style={{
          background: 'linear-gradient(45deg, #fff, #8e2de2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 0.8rem #ffffff55)',
        }}
      >
        Codeverse
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute -right-8 -top-4 text-4xl"
      >
        ⚔️
      </motion.div>
    </motion.div>
  );
} 