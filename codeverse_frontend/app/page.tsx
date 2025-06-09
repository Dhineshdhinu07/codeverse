// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <h1 className="text-5xl font-bold mb-4 text-blue-400 drop-shadow">Welcome to Codeverse</h1>
      <p className="text-lg mb-8 max-w-lg text-center text-gray-300">
        Dive into the ultimate coding battle experience. Compete, learn, and grow as a developer in a gamified arena built for the future.
      </p>

      <div className="space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white font-semibold"
          onClick={() => router.push('/signup')}
        >
          Get Started
        </button>
        <button
          className="border border-gray-400 hover:border-white px-6 py-2 rounded text-white font-semibold"
          onClick={() => router.push('/login')}
        >
          Login
        </button>
      </div>
    </main>
  );
}
