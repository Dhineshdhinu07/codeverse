"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function BattlePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [timeLeft, setTimeLeft] = useState(300); // 5 min battle timer
  const [code, setCode] = useState("");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [problemId] = useState("battle-problem-1"); // You might want to get this from props or context
  const [language] = useState("javascript"); // You might want to get this from props or context

  const { 
    opponentSubmitted, 
    notifySubmission, 
    isConnected,
    isAuthenticated,
    isLoading: socketLoading 
  } = useBattleSocket(problemId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (!isConnected) {
      console.error("Cannot submit: Socket not connected");
      return;
    }
    
    notifySubmission();
    calculateXp(true); // Simulating correct submission
  };

  const calculateXp = (isCorrect: boolean) => {
    const earned = isCorrect ? 20 : 5;
    setXp((prev) => {
      const total = prev + earned;
      const newLevel = Math.floor(total / 100) + 1;
      setLevel(newLevel);
      return total;
    });
  };

  if (authLoading || socketLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-8 flex items-center justify-center">
      <div className="text-2xl">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-4">⚔️ Battle Mode</h1>
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="w-full md:w-1/2">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="w-full h-72 p-4 bg-[#1a1a2e] text-white rounded-lg shadow-lg"
          ></textarea>
          <button
            onClick={handleSubmit}
            disabled={!isConnected}
            className={`mt-4 px-6 py-2 rounded-lg text-white shadow-md ${
              isConnected 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            {isConnected ? 'Submit Code' : 'Connecting...'}
          </button>
        </div>

        <div className="w-full md:w-1/2 space-y-4">
          <div className="bg-[#1a1a2e] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">⏱️ Time Left</h2>
            <p className="text-2xl">{Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}</p>
          </div>

          <div className="bg-[#1a1a2e] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">🧑 Opponent Status</h2>
            <p>{opponentSubmitted ? "✅ Opponent has submitted!" : "Waiting..."}</p>
          </div>

          <div className="bg-[#1a1a2e] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">🎮 XP / Level</h2>
            <p>XP: {xp} / 100</p>
            <Progress value={xp % 100} />
            <p>Level: {level}</p>
          </div>

          <div className="bg-[#1a1a2e] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">🔌 Connection Status</h2>
            <p className={isConnected ? "text-green-400" : "text-red-400"}>
              {isConnected ? "✅ Connected" : "❌ Disconnected"}
            </p>
          </div>
        </div>
      </div>

      {opponentSubmitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center text-green-400 text-xl"
        >
          Opponent has finished. Can you beat them?
        </motion.div>
      )}
    </div>
  );
}
