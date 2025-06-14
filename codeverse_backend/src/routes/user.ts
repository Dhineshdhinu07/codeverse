// routes/user.ts
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends express.Request {
  userId?: string;
}

// Test route
router.get("/test", (_req, res) => {
  res.json({ message: "User routes are working" });
});

// Get all users (protected route)
router.get("/", authenticateToken, async (_req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: express.Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
    return;
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

export default router;
