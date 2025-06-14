"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = express_1.default.Router();
const prismaAny = prisma_1.default;
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
exports.default = router;
//# sourceMappingURL=battle.js.map