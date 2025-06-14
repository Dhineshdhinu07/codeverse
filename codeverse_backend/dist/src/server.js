"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
const authMiddleware_2 = require("./middleware/authMiddleware");
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
        methods: ["GET", "POST"],
        credentials: true
    }
});
const battleRooms = {};
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }
    try {
        const decoded = (0, authMiddleware_2.verifyToken)(token);
        socket.data.userId = decoded.id;
        next();
    }
    catch (err) {
        next(new Error("Authentication error"));
    }
});
io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    socket.on("battle:join", ({ roomId }) => {
        socket.join(roomId);
        if (!battleRooms[roomId]) {
            battleRooms[roomId] = { players: [] };
        }
        battleRooms[roomId].players.push(socket.id);
        io.to(roomId).emit("battle:update", {
            players: battleRooms[roomId].players,
        });
        console.log("Room", roomId, "Players", battleRooms[roomId].players);
    });
    socket.on("battle:submit", ({ roomId, result }) => {
        io.to(roomId).emit("battle:opponentSubmit", { result, from: socket.id });
    });
    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
        Object.keys(battleRooms).forEach(roomId => {
            const room = battleRooms[roomId];
            room.players = room.players.filter(id => id !== socket.id);
            if (room.players.length === 0) {
                delete battleRooms[roomId];
            }
        });
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
    console.log(`🚀 Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map