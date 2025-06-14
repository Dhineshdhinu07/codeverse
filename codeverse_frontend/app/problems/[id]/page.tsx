"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { runCode } from "@/utils/runCode";
import { submitCode } from "@/lib/api";
import SubmitSuccessAnimation from '@/components/SubmitSuccessAnimation';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/problems/${id}`)
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

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setSubmitResult("Submitting...");
    try {
      const result = await submitCode({
        problemId: problem.id,
        code,
        language: "javascript", // or dynamically set based on user selection
        isCorrect: true // or determine based on test results
      });
      setSubmitResult("✅ Submission successful: " + JSON.stringify(result));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      setSubmitResult("❌ Submission failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
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
      <button 
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition ml-2"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Solution"}
      </button>

      {output && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Output:</h3>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-line">{output}</pre>
        </div>
      )}
      {submitResult && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Submission Result:</h3>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-line">{submitResult}</pre>
        </div>
      )}
      {showSuccess && <SubmitSuccessAnimation />}
    </div>
  );
}
