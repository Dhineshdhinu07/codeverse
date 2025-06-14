"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const problem_1 = __importDefault(require("./routes/problem"));
const run_1 = __importDefault(require("./routes/run"));
const submission_1 = __importDefault(require("./routes/submission"));
const config_1 = require("./config");
const progress_1 = __importDefault(require("./routes/progress"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
console.log('JWT_SECRET in index.ts:', config_1.JWT_SECRET);
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: {
        name: "io",
        httpOnly: true,
        sameSite: "lax"
    },
    allowEIO3: true,
    path: '/socket.io/'
});
app.use((0, cors_1.default)({
    origin: config_1.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        cookies: req.cookies,
        headers: Object.assign(Object.assign({}, req.headers), { cookie: req.headers.cookie ? 'present' : 'missing', authorization: req.headers.authorization ? 'present' : 'missing' }),
        body: req.method !== 'GET' ? req.body : undefined
    });
    res.locals.requestTime = new Date().toISOString();
    next();
});
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const validatePassword = (password) => {
    return password.length >= 6;
};
app.use('/api/problems', problem_1.default);
app.use('/api/runs', run_1.default);
app.use('/api/submissions', submission_1.default);
app.use('/api/users', user_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/progress', progress_1.default);
app.get('/api/test', (_req, res) => {
    res.json({ message: 'API is working' });
});
app.get('/api/users/test', (_req, res) => {
    res.json({ message: 'Users route is working' });
});
io.use(async (socket, next) => {
    var _a, _b, _c;
    try {
        const token = socket.handshake.auth.token ||
            ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) ||
            ((_c = (_b = socket.handshake.headers.cookie) === null || _b === void 0 ? void 0 : _b.split('; ').find(row => row.startsWith('token='))) === null || _c === void 0 ? void 0 : _c.split('=')[1]);
        console.log('Socket connection attempt:', {
            id: socket.id,
            hasToken: !!token,
            auth: socket.handshake.auth,
            headers: socket.handshake.headers,
            transport: socket.conn.transport.name
        });
        if (!token) {
            console.error('No authentication token found in socket connection');
            return next(new Error('Authentication error'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            console.error('User not found for socket connection');
            return next(new Error('Authentication error'));
        }
        socket.data.user = user;
        console.log('Socket authenticated successfully:', {
            socketId: socket.id,
            userId: user.id,
            email: user.email,
            transport: socket.conn.transport.name
        });
        next();
    }
    catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
    }
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join:room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    socket.on('code:submit', ({ roomId }) => {
        socket.to(roomId).emit('opponent:submitted');
        console.log(`Code submission in room ${roomId}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        if (!validateEmail(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
        if (!validatePassword(password)) {
            res.status(400).json({ error: 'Password must be at least 6 characters long' });
            return;
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const username = email.split('@')[0];
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username
            },
            select: { id: true, email: true, username: true }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error during login' });
    }
});
app.post('/api/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});
app.use((err, req, res, _next) => {
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
app.use((req, res) => {
    console.log('404 Not Found:', req.url);
    res.status(404).json({ error: 'Not found' });
});
const port = config_1.PORT || 5000;
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`CORS origin: ${config_1.CORS_ORIGIN}`);
});
//# sourceMappingURL=index.js.map