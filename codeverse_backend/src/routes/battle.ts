import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";

const router = express.Router();
const prismaAny = prisma as any;

// Start a battle match
router.post("/start", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;
  const { opponentId, problemId } = req.body;

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  if (!opponentId || !problemId) {
    res.status(400).json({ error: "Missing opponentId or problemId" });
    return;
  }

  try {
    const battle = await prismaAny.battle.create({
      data: {
        user1Id: userId,
        user2Id: opponentId,
        problemId,
        status: "ONGOING",
      },
    });
    res.status(201).json(battle);
  } catch (error) {
    console.error("Battle creation error:", error);
    res.status(500).json({ error: "Failed to start battle" });
  }
});

export default router;
