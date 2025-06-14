import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prismaAny = prisma as any;
const prismaClient = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Start a battle match
router.post("/start", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId;
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

// Get random problem for battle
router.get("/random", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const problemCount = await prismaClient.problem.count();
    if (problemCount === 0) {
      res.status(404).json({ message: "No problems available" });
      return;
    }

    const randomSkip = Math.floor(Math.random() * problemCount);
    const problem = await prismaClient.problem.findFirst({
      skip: randomSkip,
      take: 1,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        inputFormat: true,
        outputFormat: true,
        examples: true,
        constraints: true,
        starterCode: true,
        testCases: true
      }
    });

    if (!problem) {
      res.status(404).json({ message: "No problems available" });
      return;
    }

    res.json(problem);
  } catch (err) {
    console.error("Error fetching random problem:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get problem by ID
router.get("/:problemId", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const problemId = req.params.problemId;

  if (!problemId) {
    res.status(400).json({ message: "Invalid problem ID" });
    return;
  }

  try {
    const problem = await prismaClient.problem.findUnique({
      where: { 
        id: problemId 
      }
    });

    if (!problem) {
      res.status(404).json({ message: "Problem not found" });
      return;
    }

    res.json(problem);
  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
