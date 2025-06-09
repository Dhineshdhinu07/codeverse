"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { runCode } from "@/utils/runCode";

type Example = {
  input: string;
  output: string;
};

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  inputFormat: string;
  outputFormat: string;
  examples: string;
  starterCode: string;
};

type RunCodeResult = {
  stdout?: string;
  stderr?: string;
};

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [examples, setExamples] = useState<Example[]>([]);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:5000/api/problems/${id}`)
      .then(res => {
        setProblem(res.data);
        setCode(res.data.starterCode);
        try {
          const parsedExamples = JSON.parse(res.data.examples);
          setExamples(parsedExamples);
        } catch (error) {
          console.error("Error parsing examples:", error);
          setExamples([]);
        }
      })
      .catch(err => console.error("Problem fetch error", err));
  }, [id]);

  const handleRunCode = async () => {
    setOutput("Running...");
    try {
      const result = await runCode({
        language_id: 71, // Python by default
        source_code: code
      });
      if (result.stderr) return setOutput(`❌ Error:\n${result.stderr}`);
      setOutput(result.stdout || "✅ No output");
    } catch (e) {
      setOutput("❌ Failed to run code.");
    }
  };

  if (!problem) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{problem.title}</h1>
      <p><strong>Difficulty:</strong> {problem.difficulty}</p>
      <p className="text-gray-700 whitespace-pre-line">{problem.description}</p>

      <h3 className="font-semibold mt-4">Examples:</h3>
      <pre className="bg-gray-100 p-2 rounded">
        {examples.map((e, idx) => (
          <div key={idx}>
            <p><strong>Input:</strong> {e.input}</p>
            <p><strong>Output:</strong> {e.output}</p>
            <hr className="my-2" />
          </div>
        ))}
      </pre>

      <textarea
        className="w-full border p-3 rounded font-mono min-h-[200px]"
        value={code}
        onChange={e => setCode(e.target.value)}
      />

      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={handleRunCode}
      >
        Run Code 🚀
      </button>

      {output && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Output:</h3>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-line">{output}</pre>
        </div>
      )}
    </div>
  );
}
