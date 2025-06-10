'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeSnippet {
  id: number;
  text: string;
  x: number;
  y: number;
  rotation: number;
  duration: number;
}

const codeSnippets = [
  'function battle() {',
  'const xp = 1000;',
  'if (level > 10) {',
  'return "Victory!";',
  'class Player {',
  'async function attack() {',
  'while (enemy.health > 0) {',
  'for (let i = 0; i < 10; i++) {',
  'try { await battle(); }',
  'const score = 0;',
  'export default class Game {',
  'interface BattleStats {',
  'type Skill = {',
  'enum GameState {',
  'const player = new Player();',
];

const FloatingCodeSnippets = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);

  useEffect(() => {
    const createSnippet = () => {
      const id = Date.now();
      const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 100;
      const rotation = Math.random() * 20 - 10;
      const duration = 8 + Math.random() * 7;

      setSnippets(prev => [...prev, { id, text, x, y, rotation, duration }]);

      // Remove snippet after animation
      setTimeout(() => {
        setSnippets(prev => prev.filter(s => s.id !== id));
      }, duration * 1000);
    };

    // Create new snippets periodically
    const interval = setInterval(createSnippet, 2000);
    createSnippet(); // Create first snippet immediately

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {snippets.map((snippet) => (
          <motion.div
            key={snippet.id}
            initial={{ 
              opacity: 0,
              y: snippet.y,
              x: snippet.x,
              rotate: snippet.rotation
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: -100,
              x: snippet.x + (Math.random() * 100 - 50),
              rotate: snippet.rotation + (Math.random() * 20 - 10)
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: snippet.duration,
              ease: "linear",
              times: [0, 0.1, 0.9, 1]
            }}
            className="absolute font-mono text-sm md:text-base"
            style={{
              textShadow: `
                0 0 5px #0ff,
                0 0 10px #0ff,
                0 0 20px #0ff,
                0 0 40px #0ff
              `,
              color: '#fff',
              whiteSpace: 'nowrap'
            }}
          >
            {snippet.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingCodeSnippets; 