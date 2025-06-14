import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "../config";

const router = express.Router();
const prisma = new PrismaClient();

// Register endpoint
router.post("/register", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, username },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "Registration successful",
      user: { id: user.id, email: user.email, username: user.username },
    });
    return;
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

// Login endpoint
router.post("/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, username: user.username },
      token: token
    });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

// Logout endpoint
router.post("/logout", (_req, res): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Logout successful" });
});

export default router; 