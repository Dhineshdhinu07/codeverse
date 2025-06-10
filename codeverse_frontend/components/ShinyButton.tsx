'use client';
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const ShinyButton = ({ 
  children, 
  className = '', 
  variant = 'default',
  type = 'button',
  ...props 
}: ShinyButtonProps) => {
  const baseClasses = "relative overflow-hidden rounded-lg font-medium transition-all duration-300";
  const variantClasses = {
    default: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
    outline: "bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    >
      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear'
        }}
      />
      
      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
};

export default ShinyButton; 