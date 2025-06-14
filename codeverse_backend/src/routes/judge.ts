import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { runInSandbox } from "../utils/runInSandbox"; 
import { runJudge } from "../utils/runJudge";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code || !language) {
    res.status(400).json({ message: "Missing fields" });
    return;
  }

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      res.status(404).json({ message: "Problem not found" });
      return;
    }

    const testCases = JSON.parse(problem.testCases as string);
    const results = [];

    for (const testCase of testCases) {
      const inputData = JSON.parse(testCase.input);
      const expectedOutput = testCase.output;

      // Execute user code safely in sandbox
      const result = await runInSandbox(code, inputData);
      const passed = runJudge(result, expectedOutput);
      
      results.push({
        input: testCase.input,
        expected: expectedOutput,
        actual: result,
        passed
      });

      if (!passed) {
        break;
      }
    }

    const allPassed = results.every(r => r.passed);
    res.json({ 
      passed: allPassed,
      results: results.map(r => ({
        input: r.input,
        expected: r.expected,
        actual: r.actual,
        passed: r.passed
      }))
    });
  } catch (err) {
    console.error("Judge error:", err);
    res.status(500).json({ 
      message: "Internal server error",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

export default router; 