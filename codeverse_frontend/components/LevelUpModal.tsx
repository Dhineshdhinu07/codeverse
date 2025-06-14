"use client";

import { motion } from "framer-motion";

export default function LevelUpModal({ level, onClose }: { level: number, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-8 rounded-2xl shadow-2xl text-center space-y-4"
      >
        <h2 className="text-4xl font-bold">🎉 Level Up!</h2>
        <p className="text-2xl">You reached Level {level}</p>
        <button
          onClick={onClose}
          className="mt-4 px-5 py-2 bg-white text-purple-800 font-bold rounded-lg hover:bg-gray-200"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
