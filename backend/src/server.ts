import express, { Application, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Load env vars
dotenv.config();

// Connect to database (only in non-production/local environment)
if (process.env.NODE_ENV !== 'production') {
  connectDB();
}

// Initialize express
const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Body parser with limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import chatRoutes from './routes/chatRoutes';
import matchRoutes from './routes/matchRoutes';
import notificationRoutes from './routes/notificationRoutes';
import invitationRoutes from './routes/invitationRoutes';
import connectionRoutes from './routes/connectionRoutes';
import followRoutes from './routes/followRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/follows', followRoutes);

// Handle payload-too-large errors gracefully
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message:
        'Uploads are too large. Please keep profile photos under 5MB and resumes under 10MB.',
    });
  }
  return next(err);
});

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'MATCHBOX API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server (only in development, not in serverless)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   MATCHBOX API Server Running         ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
    ║   Port: ${PORT}                          ║
    ╚═══════════════════════════════════════╝
    `);
  });

  // Handle unhandled promise rejections (development only)
  process.on('unhandledRejection', (err: Error) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

// Export for serverless (Vercel)
export default app;
