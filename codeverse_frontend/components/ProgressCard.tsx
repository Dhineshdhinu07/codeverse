"use client";
import { useEffect, useState } from "react";

export default function ProgressCard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/progress", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p>Loading progress...</p>;

  return (
    <div className="bg-gradient-to-r from-purple-700 to-indigo-900 text-white p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-2">Your Progress</h2>
      <p>Total Attempts: {data.total}</p>
      <p>Correct Submissions: {data.correct}</p>
      <p>Accuracy: {data.accuracy.toFixed(1)}%</p>
      <p className="mt-2">Level: {data.level} 🧠</p>
    </div>
  );
}