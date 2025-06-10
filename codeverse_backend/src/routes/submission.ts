// routes/submission.ts
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/authMiddleware";

const prisma = new PrismaClient();
const router = express.Router();

// Custom type to access user from JWT-authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Type assertion for Prisma client methods
const prismaClient = prisma as any;

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("Received submission request:", { body: req.body, user: req.user });
  const userId = req.user?.id;
  const { problemId, code, language, isCorrect } = req.body;

  if (!userId || !problemId || !code || !language) {
    console.log("Missing fields:", { userId, problemId, code, language });
    res.status(400).json({ message: "Missing fields" });
    return;
  }

  try {
    // First verify that both user and problem exist
    console.log("Checking user and problem existence...");
    const [user, problem] = await Promise.all([
      prismaClient.user.findUnique({ where: { id: userId } }),
      prismaClient.problem.findUnique({ where: { id: problemId } })
    ]);

    console.log("User and problem check result:", { user: !!user, problem: !!problem });

    if (!user || !problem) {
      res.status(404).json({ message: "User or problem not found" });
      return;
    }

    // Create submission
    console.log("Creating submission...");
    const submission = await prismaClient.submission.create({
      data: {
        userId,
        problemId,
        code,
        language,
        isCorrect: isCorrect ?? false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        }
      }
    });

    console.log("Submission created successfully:", submission);
    res.status(201).json(submission);
  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Error saving submission", error: err });
  }
});

export default router;
