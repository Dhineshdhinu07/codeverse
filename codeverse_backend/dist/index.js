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
const problem_1 = __importDefault(require("./routes/problem"));
const run_1 = __importDefault(require("./routes/run"));
const submission_1 = __importDefault(require("./routes/submission"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const config_1 = require("./config");
console.log('JWT_SECRET in index.ts:', config_1.JWT_SECRET);
const prisma = new client_1.PrismaClient();
const prismaClient = prisma;
const app = (0, express_1.default)();
console.log('Setting up middleware...');
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        cookies: req.cookies,
        headers: Object.assign(Object.assign({}, req.headers), { cookie: req.headers.cookie ? 'present' : 'missing', authorization: req.headers.authorization ? 'present' : 'missing' })
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
console.log('Setting up routes...');
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
        const existingUser = await prismaClient.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prismaClient.user.create({
            data: { email, password: hashedPassword },
            select: { id: true, email: true }
        });
        res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await prismaClient.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        console.log('Creating token with secret:', config_1.JWT_SECRET);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.JWT_SECRET, {
            expiresIn: '7d'
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.use("/api/problems", authMiddleware_1.authenticateToken, problem_1.default);
app.use("/api/run", authMiddleware_1.authenticateToken, run_1.default);
app.use("/api/submissions", authMiddleware_1.authenticateToken, submission_1.default);
app.get('/api/me', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await prismaClient.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, createdAt: true }
        });
        res.json(user);
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/logout', (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
    res.json({ message: 'Logged out successfully' });
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Something went wrong!';
    const errorResponse = Object.assign({ error: errorMessage }, (process.env.NODE_ENV === 'development' && { stack: err.stack }));
    res.status(statusCode).json(errorResponse);
});
const server = app.listen(config_1.PORT, () => {
    console.log(`Server running on port ${config_1.PORT}`);
    console.log('Server configuration:');
    console.log('- CORS enabled for:', config_1.CORS_ORIGIN);
    console.log('- Credentials allowed:', true);
    console.log('- Available routes:');
    console.log('  - POST /api/register');
    console.log('  - POST /api/login');
    console.log('  - GET /api/me');
    console.log('  - POST /api/logout');
    console.log('  - GET /api/problems');
    console.log('  - GET /api/problems/:id');
    console.log('  - POST /api/run');
    console.log('  - POST /api/submissions');
});
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${config_1.PORT} is already in use. Please try a different port.`);
    }
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map