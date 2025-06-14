import React from 'react';

interface ProblemProps {
  title: string;
  description: string;
  examples?: { input: string; output: string }[];
  constraints?: string[];
}

const ProblemDisplay: React.FC<{ problem: ProblemProps }> = ({ problem }) => {
  // Ensure examples and constraints are arrays
  const examples = Array.isArray(problem.examples) ? problem.examples : [];
  const constraints = Array.isArray(problem.constraints) ? problem.constraints : [];

  return (
    <div className="p-6 rounded-lg bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] shadow-lg text-white">
      <h2 className="text-3xl font-bold mb-4">{problem.title}</h2>
      <p className="mb-4">{problem.description}</p>

      {examples.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Examples:</h3>
          {examples.map((ex, idx) => (
            <div key={idx} className="bg-[#1f1f2f] p-2 mb-2 rounded">
              <p><strong>Input:</strong> {ex.input}</p>
              <p><strong>Output:</strong> {ex.output}</p>
            </div>
          ))}
        </div>
      )}

      {constraints.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Constraints:</h3>
          <ul className="list-disc pl-5">
            {constraints.map((c, idx) => <li key={idx}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProblemDisplay; 