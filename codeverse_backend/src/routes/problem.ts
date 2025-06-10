import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", (_req: Request, res: Response): void => {
  prisma.problem.findMany()
    .then((problems: any[]) => res.json(problems))
    .catch((err: any) => res.status(500).json({ error: err.message }));
});

router.get("/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  prisma.problem.findUnique({ where: { id } })
    .then((problem: any) => {
      if (!problem) {
        res.status(404).json({ error: "Problem not found" });
        return;
      }
      res.json(problem);
    })
    .catch((err: any) => res.status(500).json({ error: err.message }));
});

export default router;
