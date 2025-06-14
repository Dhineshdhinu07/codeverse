import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import problemRoutes from "./routes/problem";
import runRoutes from "./routes/run";
import submissionRoutes from "./routes/submission";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { authenticateToken } from "./middleware/authMiddleware";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import progressRoutes from "./routes/progress";
import battleRoutes from "./routes/battle";

const app = express();

// CORS & Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/problems", authenticateToken, problemRoutes);
app.use("/api/run", authenticateToken, runRoutes);
app.use("/api/submissions", authenticateToken, submissionRoutes);
app.use("/api/progress", authenticateToken, progressRoutes);
app.use("/api/battle", authenticateToken, battleRoutes);

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1];
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join:room", (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("code:submit", (data) => {
    console.log("Code submitted:", data);
    const { roomId, userId, problemId } = data;
    // Broadcast to all other clients in the room
    socket.to(roomId).emit("opponent:submitted", {
      userId,
      problemId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server on port 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}); 