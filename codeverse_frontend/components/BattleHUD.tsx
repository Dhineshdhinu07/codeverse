'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const BattleHUD = () => {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Victories', value: 42, icon: '🏆', color: '#FFD700' },
    { label: 'Win Rate', value: 68, icon: '📊', color: '#00FF00' },
    { label: 'Rank', value: 7, icon: '⭐', color: '#FF69B4' },
    { label: 'XP', value: 1250, icon: '⚡', color: '#00FFFF' },
  ]);

  const controls = useAnimation();

  useEffect(() => {
    controls.start('visible');
  }, [controls]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: stat.label === 'Win Rate' 
            ? Math.min(100, Math.max(0, stat.value + (Math.random() > 0.5 ? 1 : -1)))
            : stat.value + Math.floor(Math.random() * 3)
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="fixed top-4 right-4 z-50"
    >
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="relative group"
          >
            {/* Glassmorphism Card */}
            <div className="relative p-4 rounded-lg backdrop-blur-md bg-black/30 border border-white/10 overflow-hidden">
              {/* Neon Border Effect */}
              <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `0 0 10px ${stat.color}, 0 0 20px ${stat.color}`,
                  border: `1px solid ${stat.color}`,
                }}
              />

              {/* Content */}
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <motion.div
                    key={stat.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.label === 'Win Rate' ? `${stat.value}%` : stat.value.toLocaleString()}
                  </motion.div>
                </div>
              </div>

              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20"
                style={{ backgroundColor: stat.color }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Battle Status */}
      <motion.div
        variants={itemVariants}
        className="mt-4 relative group"
      >
        <div className="relative p-4 rounded-lg backdrop-blur-md bg-black/30 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <span className="text-white">Battle Status</span>
            </div>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-green-400 text-sm font-semibold"
            >
              Ready to Battle
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BattleHUD;