"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProblemDisplay from "@/components/ProblemDisplay";
import BattleClient from "@/lib/BattleClient";
import api from "@/lib/api";
import { compareOutputs } from "@/utils/compareOutputs";
import { validateTestcases } from "@/utils/validateTestcases";

interface Problem {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string }[];
  constraints: string[];
}

const BattlePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isCorrect: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [battleStatus, setBattleStatus] = useState<"waiting" | "ready" | "ended">("waiting");
  const [error, setError] = useState<string | null>(null);
  const battleClientRef = useRef<BattleClient | null>(null);
  const roomId = "battle_room_1"; // TODO: Get from URL or state

  const handleAuthError = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        router.push("/login");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      router.push("/login");
      return false;
    }
  };

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      router.push("/login");
      return;
    }

    // Initialize battle client
    battleClientRef.current = new BattleClient(roomId);

    // Set up battle client event handlers
    battleClientRef.current.onUpdate((data) => {
      console.log("Battle room updated:", data);
      if (data.players.length === 2) {
        setBattleStatus("ready");
      }
    });

    battleClientRef.current.onOpponentSubmit((data) => {
      console.log("Opponent submitted:", data);
      setOpponentSubmitted(true);
    });

    // Fetch random problem
    const fetchProblem = async () => {
      try {
        setError(null);
        const { data } = await api.get('/battle/random');
        setProblem(data);
      } catch (err: any) {
        console.error("Error fetching problem:", err);
        setError(err.message || "Failed to fetch problem");
      }
    };

    fetchProblem();

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setBattleStatus("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      battleClientRef.current?.disconnect();
    };
  }, [user, loading, router, roomId]);

  const handleSubmit = async () => {
    if (!problem || !code.trim() || !user) return;

    setIsSubmitting(true);
    setError(null);
    try {
      console.log("Submitting code for problem:", problem.id);
      console.log("Code:", code);

      // Emit battle submission
      battleClientRef.current?.submit({
        problemId: problem.id,
        code,
        language: "javascript",
        roomId: roomId,
        userId: user.id
      });

      // Listen for results
      battleClientRef.current?.onResult((result) => {
        if (result.winnerId === user.id) {
          setSubmissionResult({
            isCorrect: true,
            message: "🎉 You won!",
            details: result.results
          });
        } else {
          setSubmissionResult({
            isCorrect: false,
            message: "😢 You lost...",
            details: result.results
          });
        }
      });

      battleClientRef.current?.onFail((result) => {
        setSubmissionResult({
          isCorrect: false,
          message: "❌ Your submission failed.",
          details: result.results
        });
      });

      battleClientRef.current?.onError((error) => {
        setError(error.message);
        setSubmissionResult({
          isCorrect: false,
          message: error.message
        });
      });

    } catch (err: any) {
      console.error("Error submitting solution:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit solution";
      setError(errorMessage);
      setSubmissionResult({
        isCorrect: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Battle Mode</h1>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full ${
              battleStatus === "ready" ? 'bg-green-500' : 
              battleStatus === "waiting" ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {battleStatus === "ready" ? 'Battle Ready' : 
               battleStatus === "waiting" ? 'Waiting for Opponent' : 'Battle Ended'}
            </div>
            <div className="text-xl font-mono">
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 rounded-lg">
            <p className="text-white">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {problem ? (
              <ProblemDisplay problem={problem} />
            ) : (
              <div className="p-6 rounded-lg bg-[#1a1a1a]">
                <p>Loading problem...</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 bg-[#2a2a2a] text-white p-4 rounded font-mono"
                placeholder="Write your solution here..."
                disabled={battleStatus !== "ready"}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !code.trim() || battleStatus !== "ready"}
                className={`px-6 py-2 rounded ${
                  isSubmitting || !code.trim() || battleStatus !== "ready"
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Solution'}
              </button>

              {opponentSubmitted && (
                <div className="text-yellow-400">
                  Opponent has submitted their solution!
                </div>
              )}
            </div>

            {submissionResult && (
              <div className={`p-4 rounded ${
                submissionResult.isCorrect ? 'bg-green-900' : 'bg-red-900'
              }`}>
                {submissionResult.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePage;
