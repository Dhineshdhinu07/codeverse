import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends express.Request {
  userId?: string;
}

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  // Debug logs
  console.log('[Progress API] req.user:', (req as any).user);
  console.log('[Progress API] req.userId:', req.userId);
  const userId = req.userId;
  
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const total = await prisma.submission.count({ where: { userId } });
    const correct = await prisma.submission.count({ where: { userId, isCorrect: true } });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const level = Math.floor(correct / 5); // Every 5 correct submissions = 1 level

    res.json({ total, correct, accuracy, level });
  } catch (err) {
    console.error('[Progress API] Error:', err);
    res.status(500).json({ message: "Error fetching progress", error: err instanceof Error ? err.message : err });
  }
});

export default router;