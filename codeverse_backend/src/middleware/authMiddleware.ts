// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from '../config';

const prisma = new PrismaClient();
const prismaClient = prisma as any;

// Debug log to print JWT_SECRET
console.log('JWT_SECRET in authMiddleware.ts:', JWT_SECRET);

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log the full request details for debugging
    console.log('Auth request received:', {
      method: req.method,
      url: req.url,
      cookies: req.cookies,
      headers: {
        ...req.headers,
        cookie: req.headers.cookie ? 'present' : 'missing',
        authorization: req.headers.authorization ? 'present' : 'missing'
      }
    });

    // Try to get token from cookie first, then from Authorization header
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
      console.log('Verifying token with secret:', JWT_SECRET);
      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Token decoded successfully:', { userId: decoded.userId });
      
      // Find the user
      const user = await prismaClient.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true }
      });
      
      if (!user) {
        console.log('User not found for token');
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // Attach user to request and proceed
      console.log('User authenticated:', { userId: user.id });
      (req as any).user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid token' });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
