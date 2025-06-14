import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);
const router = express.Router();

router.post("/", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, code, language } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!problemId || !code || !language) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Get problem details
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        testCases: true,
        examples: true
      }
    });

    if (!problem) {
      res.status(404).json({ error: "Problem not found" });
      return;
    }

    // Parse test cases
    const testCases = typeof problem.testCases === 'string' 
      ? JSON.parse(problem.testCases) 
      : problem.testCases;

    // Create temporary file
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `temp_${Date.now()}.js`);
    fs.writeFileSync(tempFile, code);

    try {
      // Run the code against test cases
      const results = await Promise.all(
        testCases.map(async (testCase: any) => {
          const { input, expected } = testCase;
          const { stdout, stderr } = await execAsync(`node "${tempFile}" "${input}"`);
          return {
            input,
            expected,
            actual: stdout.trim(),
            passed: stdout.trim() === expected
          };
        })
      );

      // Check if all test cases passed
      const isCorrect = results.every(r => r.passed);

      // Save submission
      await prisma.submission.create({
        data: {
          userId,
          problemId,
          code,
          language,
          isCorrect
        }
      });

      // Clean up
      fs.unlinkSync(tempFile);

      res.json({
        isCorrect,
        results,
        message: isCorrect ? "All test cases passed!" : "Some test cases failed."
      });
    } catch (error: any) {
      // Clean up on error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      console.error("Validation error:", error);
      res.status(500).json({
        isCorrect: false,
        message: "Error running code: " + (error.message || "Unknown error")
      });
    }
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({
      isCorrect: false,
      message: "Internal server error"
    });
  }
});

export default router; 