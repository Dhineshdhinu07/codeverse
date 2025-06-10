// components/Navbar.tsx
"use client";

import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-50">
      <Link href="/" className="text-2xl font-bold text-cyan-400">
        ⚔️ Codeverse
      </Link>
      <div className="space-x-4 hidden md:flex">
        <Link href="/login" className="hover:text-cyan-400 transition">Login</Link>
        <Link href="/register" className="hover:text-cyan-400 transition">Register</Link>
        <Link href="/dashboard" className="hover:text-cyan-400 transition">Arena</Link>
      </div>
    </nav>
  );
};
