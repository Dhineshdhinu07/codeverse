"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketServer = createSocketServer;
const socket_io_1 = require("socket.io");
function createSocketServer(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });
    const battleNamespace = io.of("/battle");
    battleNamespace.on("connection", (socket) => {
        console.log("🟢 A user connected to battle namespace: ", socket.id);
        socket.on("joinRoom", ({ roomId, username }) => {
            socket.join(roomId);
            console.log(`${username} joined room ${roomId}`);
            socket.to(roomId).emit("opponentJoined", { username });
        });
        socket.on("codeChange", ({ roomId, code }) => {
            socket.to(roomId).emit("receiveCode", { code });
        });
        socket.on("submitCode", ({ roomId, result }) => {
            socket.to(roomId).emit("opponentSubmitted", { result });
        });
        socket.on("win", ({ roomId, userId }) => {
            socket.to(roomId).emit("opponentWon", { userId });
        });
        socket.on("disconnect", () => {
            console.log("🔴 A user disconnected from battle namespace: ", socket.id);
        });
    });
    return io;
}
//# sourceMappingURL=socketServer.js.map