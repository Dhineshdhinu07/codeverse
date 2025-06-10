import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient() as any;

router.get("/", authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const total = await prisma.submission.count({ where: { userId } });
    const correct = await prisma.submission.count({ where: { userId, isCorrect: true } });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const level = Math.floor(correct / 5); // Every 5 correct submissions = 1 level

    res.json({ total, correct, accuracy, level });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching progress" });
  }
});

export default router;