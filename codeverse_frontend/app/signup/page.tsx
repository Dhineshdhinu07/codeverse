// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await axios.post('/register', { email, username, password });
      router.push('/login');
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-6 text-blue-400">Create your Codeverse account</h2>
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Username"
          className="p-3 rounded bg-gray-800 border border-gray-600"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-gray-800 border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-gray-800 border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSignup}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded"
        >
          Sign Up
        </button>
      </div>
    </main>
  );
}
