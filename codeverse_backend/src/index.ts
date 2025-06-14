import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import problemRoutes from './routes/problem';
import runRoutes from './routes/run';
import submissionRoutes from './routes/submission';
import { JWT_SECRET, PORT, CORS_ORIGIN } from './config';
import progressRoutes from './routes/progress';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import { authenticateToken } from './middleware/authMiddleware';
import battleRoutes from './routes/battle';

// Debug log to print JWT_SECRET
console.log('JWT_SECRET in index.ts:', JWT_SECRET);

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
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

// Express middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

// Handle OPTIONS requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    cookies: req.cookies,
    headers: {
      ...req.headers,
      cookie: req.headers.cookie ? 'present' : 'missing',
      authorization: req.headers.authorization ? 'present' : 'missing'
    },
    body: req.method !== 'GET' ? req.body : undefined
  });
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

// API routes
app.use('/api/problems', authenticateToken, problemRoutes);
app.use('/api/runs', authenticateToken, runRoutes);
app.use('/api/submissions', authenticateToken, submissionRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', authenticateToken, progressRoutes);
app.use('/api/battle', authenticateToken, battleRoutes);

// Add a test route to verify the server is working
app.get('/api/test', (_req, res) => {
  res.json({ message: 'API is working' });
});

// Add a test route for users
app.get('/api/users/test', (_req, res) => {
  res.json({ message: 'Users route is working' });
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                 socket.handshake.headers.authorization?.split(' ')[1] ||
                 socket.handshake.headers.cookie?.split('; ')
                   .find(row => row.startsWith('token='))?.split('=')[1];

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

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.error('User not found for socket connection');
      return next(new Error('Authentication error'));
    }

    // Attach user to socket
    socket.data.user = user;
    console.log('Socket authenticated successfully:', {
      socketId: socket.id,
      userId: user.id,
      email: user.email,
      transport: socket.conn.transport.name
    });

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket.IO event handlers
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

// Auth routes
app.post('/api/register', async (req: express.Request, res: express.Response): Promise<void> => {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0]; // Generate username from email
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword,
        username
      },
      select: { id: true, email: true, username: true }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/login', async (req: express.Request, res: express.Response): Promise<void> => {
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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

app.post('/api/logout', (_req: express.Request, res: express.Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
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

// Catch-all route for 404 errors
app.use((req: express.Request, res: express.Response) => {
  console.log('404 Not Found:', req.url);
  res.status(404).json({ error: 'Not found' });
});

// Start server
const port = PORT || 5000;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
