"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prismaAny = prisma_1.default;
const prismaClient = new client_1.PrismaClient();
router.post("/start", authMiddleware_1.authenticateToken, async (req, res) => {
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
    }
    catch (error) {
        console.error("Battle creation error:", error);
        res.status(500).json({ error: "Failed to start battle" });
    }
});
router.get("/random", authMiddleware_1.authenticateToken, async (_req, res) => {
    try {
        const problemCount = await prismaClient.problem.count();
        const randomSkip = Math.floor(Math.random() * problemCount);
        const problem = await prismaClient.problem.findFirst({
            skip: randomSkip,
            take: 1
        });
        if (!problem) {
            res.status(404).json({ message: "No problems available" });
            return;
        }
        res.json(problem);
    }
    catch (err) {
        console.error("Error fetching random problem:", err);
        res.status(500).json({ message: "Server error" });
    }
});
router.get("/:problemId", authMiddleware_1.authenticateToken, async (req, res) => {
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
    }
    catch (err) {
        console.error("Error fetching problem:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=battle.js.map