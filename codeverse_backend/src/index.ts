import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import problemRoutes from './routes/problem';
import runRoutes from './routes/run';
import submissionRoutes from './routes/submission';
import { authenticateToken } from './middleware/authMiddleware';
import { JWT_SECRET, PORT, CORS_ORIGIN } from './config';
import progressRoutes from './routes/progress';

// Debug log to print JWT_SECRET
console.log('JWT_SECRET in index.ts:', JWT_SECRET);

const prisma = new PrismaClient();
const prismaClient = prisma as any;
const app = express();

console.log('Setting up middleware...');

// Basic middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/progress', progressRoutes);

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    cookies: req.cookies,
    headers: {
      ...req.headers,
      cookie: req.headers.cookie ? 'present' : 'missing',
      authorization: req.headers.authorization ? 'present' : 'missing'
    }
  });
  // Use res to ensure it's not marked as unused
  res.locals.requestTime = new Date().toISOString();
  next();
});

// Input validation middleware
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

console.log('Setting up routes...');

// Public routes
app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true }
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    console.log('Creating token with secret:', JWT_SECRET);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes
app.use("/api/problems", authenticateToken, problemRoutes);
app.use("/api/run", authenticateToken, runRoutes);
app.use("/api/submissions", authenticateToken, submissionRoutes);

app.get('/api/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, email: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', (_req, res) => {
  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Something went wrong!';
  const errorResponse = {
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  res.status(statusCode).json(errorResponse);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server configuration:');
  console.log('- CORS enabled for:', CORS_ORIGIN);
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

server.on('error', (error: any) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
