"use client";
import { motion } from "framer-motion";

export default function SubmitSuccessAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-1/3 left-1/2 transform -translate-x-1/2 text-center z-50 bg-gradient-to-br from-green-600 to-emerald-500 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-xl"
    >
      ✅ Submission Accepted!
    </motion.div>
  );
}
