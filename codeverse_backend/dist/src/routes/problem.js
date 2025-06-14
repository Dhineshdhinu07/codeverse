"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get("/", async (_req, res) => {
    try {
        const problems = await prisma_1.default.problem.findMany();
        res.json(problems);
    }
    catch (err) {
        console.error("Error fetching problems:", err);
        res.status(500).json({ error: "Failed to fetch problems" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await prisma_1.default.problem.findUnique({ where: { id } });
        if (!problem) {
            res.status(404).json({ error: "Problem not found" });
            return;
        }
        res.json(problem);
    }
    catch (err) {
        console.error("Error fetching problem:", err);
        res.status(500).json({ error: "Failed to fetch problem" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { title, description, difficulty, inputFormat, outputFormat, examples, constraints, starterCode, testCases } = req.body;
        if (!title || !description || !difficulty || !inputFormat || !outputFormat || !examples || !constraints || !starterCode) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const problem = await prisma_1.default.problem.create({
            data: {
                title,
                description,
                difficulty,
                inputFormat,
                outputFormat,
                examples,
                constraints,
                starterCode,
                testCases: typeof testCases !== "undefined" ? testCases : client_1.Prisma.JsonNull
            }
        });
        res.status(201).json(problem);
    }
    catch (err) {
        console.error("Error creating problem:", err);
        res.status(500).json({ error: "Failed to create problem" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, inputFormat, outputFormat, examples, constraints, starterCode } = req.body;
        const problem = await prisma_1.default.problem.update({
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
    }
    catch (err) {
        console.error("Error updating problem:", err);
        if (err.code === 'P2025') {
            res.status(404).json({ error: "Problem not found" });
            return;
        }
        res.status(500).json({ error: "Failed to update problem" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.problem.delete({ where: { id } });
        res.status(200).json({ message: "Problem deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting problem:", err);
        if (err.code === 'P2025') {
            res.status(404).json({ error: "Problem not found" });
            return;
        }
        res.status(500).json({ error: "Failed to delete problem" });
    }
});
exports.default = router;
//# sourceMappingURL=problem.js.map