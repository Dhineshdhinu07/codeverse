"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const username = email.split("@")[0];
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.JWT_SECRET, { expiresIn: "24h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "24h" });
        console.log('Login successful, setting cookie for user:', user.id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            domain: "localhost",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            token: token
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
});
exports.default = router;
//# sourceMappingURL=auth.js.map