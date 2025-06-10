'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight drop-shadow-[0_0_0.8rem_#ffffff55]">
          Codeverse
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto">
          A new dimension of coding: battle your friends, defeat bugs, and level up your skills in real-time.
        </p>
        <Button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-[#8e2de2] hover:text-white transition-all duration-300 shadow-lg"
        >
          Enter the Arena 🚀
        </Button>
      </div>
    </main>
  );
}
