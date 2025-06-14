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
console.log('JWT_SECRET in authMiddleware.ts:', config_1.JWT_SECRET);
const authenticateToken = async (req, res, next) => {
    var _a;
    try {
        console.log('Auth request received:', {
            method: req.method,
            url: req.url,
            hasCookies: !!req.cookies,
            hasAuthHeader: !!req.headers.authorization,
            hasCookieString: !!req.headers.cookie
        });
        let token;
        if (req.cookies.token) {
            token = req.cookies.token;
            console.log('Token found in cookie');
        }
        else if ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
            console.log('Token found in Authorization header');
        }
        else if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';');
            const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
            if (tokenCookie) {
                token = tokenCookie.split('=')[1];
                console.log('Token found in cookie string');
            }
        }
        if (!token) {
            console.log('No token found in request');
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, username: true }
            });
            if (!user) {
                console.log('User not found for token');
                res.status(401).json({ error: 'User not found' });
                return;
            }
            req.userId = user.id;
            next();
        }
        catch (error) {
            console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
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
        console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=authMiddleware.js.map