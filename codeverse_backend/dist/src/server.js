"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const problem_1 = __importDefault(require("./routes/problem"));
const run_1 = __importDefault(require("./routes/run"));
const submission_1 = __importDefault(require("./routes/submission"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const authMiddleware_1 = require("./middleware/authMiddleware");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const progress_1 = __importDefault(require("./routes/progress"));
const battle_1 = __importDefault(require("./routes/battle"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/auth", auth_1.default);
app.use("/api/users", authMiddleware_1.authenticateToken, user_1.default);
app.use("/api/problems", authMiddleware_1.authenticateToken, problem_1.default);
app.use("/api/run", authMiddleware_1.authenticateToken, run_1.default);
app.use("/api/submissions", authMiddleware_1.authenticateToken, submission_1.default);
app.use("/api/progress", authMiddleware_1.authenticateToken, progress_1.default);
app.use("/api/battle", authMiddleware_1.authenticateToken, battle_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});
io.use((socket, next) => {
    var _a;
    const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.cookie) === null || _a === void 0 ? void 0 : _a.split('token=')[1]);
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.data.user = decoded;
        next();
    }
    catch (err) {
        next(new Error('Authentication error'));
    }
});
io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
    socket.on("join:room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });
    socket.on("code:submit", (data) => {
        console.log("Code submitted:", data);
        const { roomId, userId, problemId } = data;
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
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map