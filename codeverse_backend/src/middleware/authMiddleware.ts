// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from '../config';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; username: string };
}

// Debug log to print JWT_SECRET
console.log('JWT_SECRET in authMiddleware.ts:', JWT_SECRET);

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log the request details for debugging (excluding sensitive data)
    console.log('Auth request received:', {
      method: req.method,
      url: req.url,
      hasCookies: !!req.cookies,
      hasAuthHeader: !!req.headers.authorization,
      hasCookieString: !!req.headers.cookie
    });

    // Try to get token from multiple sources
    let token: string | undefined;

    // 1. Try cookie first
    if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('Token found in cookie');
    }
    // 2. Try Authorization header
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
      console.log('Token found in Authorization header');
    }
    // 3. Try cookie string
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
      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Token decoded:', { userId: decoded.userId });
      
      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, username: true }
      });
      
      if (!user) {
        console.log('User not found for token');
        res.status(401).json({ error: 'User not found' });
        return;
      }

      console.log('User found:', { id: user.id, email: user.email });
      
      // Attach user to request and proceed
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid token' });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
  }
};
