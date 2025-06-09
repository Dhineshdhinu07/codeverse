import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", (_req: Request, res: Response): void => {
  prisma.problem.findMany()
    .then(problems => res.json(problems))
    .catch(() => res.status(500).json({ message: "Server error" }));
});

router.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  prisma.problem.findUnique({ where: { id } })
    .then(problem => {
      if (!problem) {
        res.status(404).json({ message: "Problem not found" });
        return;
      }
      res.json(problem);
    })
    .catch(() => res.status(500).json({ message: "Server error" }));
});

export default router;
