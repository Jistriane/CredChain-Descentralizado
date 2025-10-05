import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import 'express-async-errors';

// Routes
import userRoutes from './routes/userRoutes';
import profileRoutes from './routes/profileRoutes';
import preferencesRoutes from './routes/preferencesRoutes';
import kycRoutes from './routes/kycRoutes';
import documentRoutes from './routes/documentRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { NotificationService } from './services/NotificationService';
import { FileService } from './services/FileService';
import { KYCService } from './services/KYCService';

// Utils
import { logger } from './utils/logger';
import { config } from './config/config';

class UserService {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private notificationService: NotificationService;
  private fileService: FileService;
  private kycService: KYCService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.CORS_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Initialize services
    this.databaseService = new DatabaseService();
    this.redisService = new RedisService();
    this.notificationService = new NotificationService();
    this.fileService = new FileService();
    this.kycService = new KYCService();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.CORS_ORIGINS,
      credentials: true,
    }));

    // Logging
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    // Compression
    this.app.use(compression());

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Custom middleware
    this.app.use(rateLimitMiddleware);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'user-service',
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // API routes
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/profiles', authMiddleware, profileRoutes);
    this.app.use('/api/v1/preferences', authMiddleware, preferencesRoutes);
    this.app.use('/api/v1/kyc', authMiddleware, kycRoutes);
    this.app.use('/api/v1/documents', authMiddleware, documentRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    });
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Join user to their personal room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      // Handle profile updates
      socket.on('profile-update', async (data) => {
        try {
          // Broadcast to user's room
          socket.to(`user-${data.userId}`).emit('profile-updated', data);
        } catch (error) {
          logger.error('Error handling profile update:', error);
        }
      });

      // Handle KYC status updates
      socket.on('kyc-status-update', async (data) => {
        try {
          socket.to(`user-${data.userId}`).emit('kyc-status-updated', data);
        } catch (error) {
          logger.error('Error handling KYC status update:', error);
        }
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize services
      await this.databaseService.connect();
      await this.redisService.connect();
      await this.notificationService.initialize();
      await this.fileService.initialize();
      await this.kycService.initialize();

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 User Service running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
        logger.info(`🔗 API Documentation: http://localhost:${config.PORT}/api-docs`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start User Service:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down User Service...');
    
    try {
      // Close database connections
      await this.databaseService.disconnect();
      await this.redisService.disconnect();
      
      // Close server
      this.server.close(() => {
        logger.info('User Service stopped');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the service
const userService = new UserService();
userService.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default userService;
