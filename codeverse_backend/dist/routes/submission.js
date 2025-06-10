"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const prismaClient = prisma;
router.post("/", authMiddleware_1.authenticateToken, async (req, res) => {
    var _a;
    console.log("Received submission request:", { body: req.body, user: req.user });
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { problemId, code, language, isCorrect } = req.body;
    if (!userId || !problemId || !code || !language) {
        console.log("Missing fields:", { userId, problemId, code, language });
        res.status(400).json({ message: "Missing fields" });
        return;
    }
    try {
        console.log("Checking user and problem existence...");
        const [user, problem] = await Promise.all([
            prismaClient.user.findUnique({ where: { id: userId } }),
            prismaClient.problem.findUnique({ where: { id: problemId } })
        ]);
        console.log("User and problem check result:", { user: !!user, problem: !!problem });
        if (!user || !problem) {
            res.status(404).json({ message: "User or problem not found" });
            return;
        }
        console.log("Creating submission...");
        const submission = await prismaClient.submission.create({
            data: {
                userId,
                problemId,
                code,
                language,
                isCorrect: isCorrect !== null && isCorrect !== void 0 ? isCorrect : false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                },
                problem: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true
                    }
                }
            }
        });
        console.log("Submission created successfully:", submission);
        res.status(201).json(submission);
    }
    catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ message: "Error saving submission", error: err });
    }
});
exports.default = router;
//# sourceMappingURL=submission.js.map