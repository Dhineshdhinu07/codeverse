"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    prisma.problem.findMany()
        .then((problems) => res.json(problems))
        .catch((err) => res.status(500).json({ error: err.message }));
});
router.get("/:id", (req, res) => {
    const { id } = req.params;
    prisma.problem.findUnique({ where: { id } })
        .then((problem) => {
        if (!problem) {
            res.status(404).json({ error: "Problem not found" });
            return;
        }
        res.json(problem);
    })
        .catch((err) => res.status(500).json({ error: err.message }));
});
exports.default = router;
//# sourceMappingURL=problem.js.map