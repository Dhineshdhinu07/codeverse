'use client';
import { motion } from 'framer-motion';

interface AnimatedGradientTextProps {
  text: string;
  className?: string;
}

export default function AnimatedGradientText({ text, className = '' }: AnimatedGradientTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_auto]"
        style={{
          filter: 'drop-shadow(0 0 0.5rem rgba(255, 255, 255, 0.3))',
        }}
      >
        {text}
      </motion.div>
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 -z-10"
      />
    </motion.div>
  );
} 