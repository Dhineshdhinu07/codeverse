// components/GlowingButton.tsx
"use client";
import { motion } from "framer-motion";

export default function GlowingButton({ children, onClick }: { children: string; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="bg-primary text-white px-6 py-2 rounded-full font-heading shadow-neon hover:scale-105 transition-all duration-200"
      whileHover={{ scale: 1.1 }}
    >
      {children}
    </motion.button>
  );
}
