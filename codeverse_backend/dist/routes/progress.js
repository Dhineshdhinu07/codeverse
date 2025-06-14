"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/", authMiddleware_1.authenticateToken, async (req, res) => {
    const userId = req.userId;
    try {
        const total = await prisma.submission.count({ where: { userId } });
        const correct = await prisma.submission.count({ where: { userId, isCorrect: true } });
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        const level = Math.floor(correct / 5);
        res.json({ total, correct, accuracy, level });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching progress" });
    }
});
exports.default = router;
//# sourceMappingURL=progress.js.map