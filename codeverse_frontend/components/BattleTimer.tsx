"use client";
import { useEffect, useState } from "react";

export default function BattleTimer({ duration = 180, onEnd }: { duration?: number; onEnd: () => void }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onEnd]);

  return (
    <div className="text-white text-2xl font-mono bg-black bg-opacity-30 px-4 py-2 rounded shadow-xl">
      ⏳ Time Left: {timeLeft}s
    </div>
  );
}
