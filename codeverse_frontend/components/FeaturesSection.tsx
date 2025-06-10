'use client';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: '⚔️',
    title: 'Code Battles',
    description: 'Challenge other developers in real-time coding duels. Show your skills and climb the ranks!',
    gradient: 'from-[#FF416C] via-[#FF4B2B] to-[#FF416C]',
  },
  {
    icon: '🎮',
    title: 'Gamified Learning',
    description: 'Earn XP, unlock achievements, and level up as you solve coding challenges and complete missions.',
    gradient: 'from-[#8E2DE2] via-[#4A00E0] to-[#8E2DE2]',
  },
  {
    icon: '🏆',
    title: 'Leaderboards',
    description: 'Compete with developers worldwide and see your name at the top of the global rankings.',
    gradient: 'from-[#00B4DB] via-[#0083B0] to-[#00B4DB]',
  },
  {
    icon: '🤖',
    title: 'AI Challenges',
    description: 'Face off against our AI opponents that adapt to your skill level and coding style.',
    gradient: 'from-[#11998e] via-[#38ef7d] to-[#11998e]',
  },
  {
    icon: '👥',
    title: 'Team Battles',
    description: 'Form teams with friends and compete in epic coding tournaments against other squads.',
    gradient: 'from-[#FC466B] via-[#3F5EFB] to-[#FC466B]',
  },
  {
    icon: '🎯',
    title: 'Daily Challenges',
    description: 'New coding challenges every day to keep your skills sharp and earn bonus rewards.',
    gradient: 'from-[#834d9b] via-[#d04ed6] to-[#834d9b]',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Features That Make You <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8e2de2] to-[#4a00e0]">Unstoppable</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Level up your coding skills with our unique gamified platform
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 