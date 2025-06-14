import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends express.Request {
  user?: { id: string; email: string; username: string };
}

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  // Debug logs
  console.log('[Progress API] req.user:', req.user);
  
  if (!req.user?.id) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const total = await prisma.submission.count({ where: { userId: req.user.id } });
    const correct = await prisma.submission.count({ where: { userId: req.user.id, isCorrect: true } });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const level = Math.floor(correct / 5); // Every 5 correct submissions = 1 level

    res.json({ total, correct, accuracy, level });
  } catch (err) {
    console.error('[Progress API] Error:', err);
    res.status(500).json({ message: "Error fetching progress", error: err instanceof Error ? err.message : err });
  }
});

export default router;