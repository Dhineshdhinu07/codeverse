"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const prisma = new client_1.PrismaClient();
const prismaClient = prisma;
console.log('JWT_SECRET in authMiddleware.ts:', config_1.JWT_SECRET);
const authenticateToken = async (req, res, next) => {
    try {
        console.log('Auth request received:', {
            method: req.method,
            url: req.url,
            cookies: req.cookies,
            headers: Object.assign(Object.assign({}, req.headers), { cookie: req.headers.cookie ? 'present' : 'missing', authorization: req.headers.authorization ? 'present' : 'missing' })
        });
        let token = req.cookies.token;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        console.log('Token check:', {
            hasCookie: !!req.cookies.token,
            hasAuthHeader: !!req.headers.authorization,
            tokenFound: !!token,
            tokenValue: token ? `${token.substring(0, 10)}...` : 'none'
        });
        if (!token) {
            console.log('No token found');
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        try {
            console.log('Verifying token with secret:', config_1.JWT_SECRET);
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            console.log('Token decoded successfully:', { userId: decoded.userId });
            const user = await prismaClient.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true }
            });
            if (!user) {
                console.log('User not found for token');
                res.status(401).json({ error: 'User not found' });
                return;
            }
            console.log('User authenticated:', { userId: user.id });
            req.user = user;
            next();
        }
        catch (error) {
            console.error('JWT verification failed:', error);
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ error: 'Token expired' });
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({ error: 'Invalid token' });
            }
            else {
                res.status(401).json({ error: 'Authentication failed' });
            }
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=authMiddleware.js.map