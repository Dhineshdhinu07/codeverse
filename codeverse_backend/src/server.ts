import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import problemRoutes from "./routes/problem";
import runRoutes from "./routes/run";
import submissionRoutes from "./routes/submission";
import validateRoutes from "./routes/validate";
import http from "http";
import { Server } from "socket.io";
import { authenticateToken } from "./middleware/authMiddleware";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import progressRoutes from "./routes/progress";
import battleRoutes from "./routes/battle";
import { verifyToken } from "./middleware/authMiddleware";
import judgeRoutes from './routes/judge';
import { setupBattleSocket } from "./socket";

const app = express();

// CORS & Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400 // 24 hours
}));

app.use(cookieParser());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/problems", authenticateToken, problemRoutes);
app.use("/api/run", authenticateToken, runRoutes);
app.use("/api/submissions", authenticateToken, submissionRoutes);
app.use("/api/validate", authenticateToken, validateRoutes);
app.use("/api/progress", authenticateToken, progressRoutes);
app.use("/api/battle", authenticateToken, battleRoutes);
app.use("/api/judge", authenticateToken, judgeRoutes);

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  }
});

// Maintain current battle rooms state (in-memory for now)
const battleRooms: { [roomId: string]: { players: string[] } } = {};

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.error("No token provided in socket handshake");
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      console.error("Invalid token format in socket handshake");
      return next(new Error("Authentication error: Invalid token format"));
    }
    socket.data.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Token verification failed in socket handshake:", err);
    next(new Error("Authentication error: Token verification failed"));
  }
});

// Setup battle socket
setupBattleSocket(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Join battle room
  socket.on("battle:join", ({ roomId }) => {
    socket.join(roomId);

    if (!battleRooms[roomId]) {
      battleRooms[roomId] = { players: [] };
    }

    battleRooms[roomId].players.push(socket.id);

    // Notify both clients that battle is ready
    io.to(roomId).emit("battle:update", {
      players: battleRooms[roomId].players,
    });

    console.log("Room", roomId, "Players", battleRooms[roomId].players);
  });

  // Submission event
  socket.on("battle:submit", ({ roomId, result }) => {
    io.to(roomId).emit("battle:opponentSubmit", { result, from: socket.id });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    // Cleanup battle rooms
    Object.keys(battleRooms).forEach(roomId => {
      const room = battleRooms[roomId];
      room.players = room.players.filter(id => id !== socket.id);
      if (room.players.length === 0) {
        delete battleRooms[roomId];
      }
    });
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers
  });

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Start server on port 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 