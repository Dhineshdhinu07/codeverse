"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

type Problem = {
  id: string;
  title: string;
  difficulty: string;
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/problems")
      .then(res => setProblems(res.data))
      .catch(err => console.error("Error loading problems", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧩 Problems</h1>
      <div className="grid gap-3">
        {problems.map(problem => (
          <Link key={problem.id} href={`/problems/${problem.id}`}>
            <div className="border p-4 rounded-lg hover:bg-gray-100 transition">
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <p className="text-sm text-gray-500">{problem.difficulty}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
