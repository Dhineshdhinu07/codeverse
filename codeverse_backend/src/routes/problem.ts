import express, { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

const router = express.Router();

// Get all problems
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const problems = await prisma.problem.findMany();
    res.json(problems);
  } catch (err) {
    console.error("Error fetching problems:", err);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// Get a specific problem
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const problem = await prisma.problem.findUnique({ where: { id } });
    
    if (!problem) {
      res.status(404).json({ error: "Problem not found" });
      return;
    }
    
    res.json(problem);
  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// Create a new problem
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, difficulty, inputFormat, outputFormat, examples, constraints, starterCode, testCases } = req.body;

    if (!title || !description || !difficulty || !inputFormat || !outputFormat || !examples || !constraints || !starterCode) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        inputFormat,
        outputFormat,
        examples,
        constraints,
        starterCode,
        testCases: typeof testCases !== "undefined" ? testCases : Prisma.JsonNull
      }
    });

    res.status(201).json(problem);
  } catch (err) {
    console.error("Error creating problem:", err);
    res.status(500).json({ error: "Failed to create problem" });
  }
});

// Update a problem
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, inputFormat, outputFormat, examples, constraints, starterCode } = req.body;

    const problem = await prisma.problem.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        inputFormat,
        outputFormat,
        examples,
        constraints,
        starterCode
      }
    });

    res.json(problem);
  } catch (err) {
    console.error("Error updating problem:", err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: "Problem not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update problem" });
  }
});

// Delete a problem
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.problem.delete({ where: { id } });
    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error("Error deleting problem:", err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: "Problem not found" });
      return;
    }
    res.status(500).json({ error: "Failed to delete problem" });
  }
});

export default router;
