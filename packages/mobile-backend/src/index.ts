import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cron from 'node-cron';
import 'express-async-errors';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import scoreRoutes from './routes/scoreRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import chatRoutes from './routes/chatRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { AuthService } from './services/AuthService';
import { ScoreService } from './services/ScoreService';
import { PaymentService } from './services/PaymentService';
import { NotificationService } from './services/NotificationService';
import { ChatService } from './services/ChatService';

// Utils
import { logger } from './utils/logger';
import { config } from './config/config';

class MobileBackend {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private authService: AuthService;
  private scoreService: ScoreService;
  private paymentService: PaymentService;
  private notificationService: NotificationService;
  private chatService: ChatService;

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
    this.authService = new AuthService();
    this.scoreService = new ScoreService();
    this.paymentService = new PaymentService();
    this.notificationService = new NotificationService();
    this.chatService = new ChatService();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
    this.setupCronJobs();
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
      max: 1000, // Mobile needs higher limits
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
        service: 'mobile-backend',
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/scores', scoreRoutes);
    this.app.use('/api/v1/payments', paymentRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/chat', chatRoutes);

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
      logger.info(`Mobile client connected: ${socket.id}`);

      // Join user room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`Client joined user room: ${userId}`);
      });

      // Handle real-time score updates
      socket.on('subscribe-score-updates', (userId: string) => {
        socket.join(`score-${userId}`);
        logger.info(`Client subscribed to score updates: ${userId}`);
      });

      // Handle payment notifications
      socket.on('subscribe-payment-updates', (userId: string) => {
        socket.join(`payment-${userId}`);
        logger.info(`Client subscribed to payment updates: ${userId}`);
      });

      // Handle chat with ElizaOS
      socket.on('chat-message', async (data) => {
        try {
          const response = await this.chatService.processMessage(data.message, data.userId);
          socket.emit('chat-response', response);
        } catch (error) {
          socket.emit('chat-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Mobile client disconnected: ${socket.id}`);
      });
    });
  }

  private setupCronJobs(): void {
    // Send push notifications every hour
    cron.schedule('0 * * * *', async () => {
      try {
        await this.notificationService.sendScheduledNotifications();
      } catch (error) {
        logger.error('Error sending scheduled notifications:', error);
      }
    });

    // Clean old notifications daily
    cron.schedule('0 2 * * *', async () => {
      try {
        await this.notificationService.cleanOldNotifications();
      } catch (error) {
        logger.error('Error cleaning old notifications:', error);
      }
    });

    // Update user scores daily
    cron.schedule('0 3 * * *', async () => {
      try {
        await this.scoreService.updateAllUserScores();
      } catch (error) {
        logger.error('Error updating user scores:', error);
      }
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
      await this.authService.initialize();
      await this.scoreService.initialize();
      await this.paymentService.initialize();
      await this.notificationService.initialize();
      await this.chatService.initialize();

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 Mobile Backend running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
        logger.info(`📱 Mobile API: http://localhost:${config.PORT}/api/v1`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start Mobile Backend:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down Mobile Backend...');
    
    try {
      // Stop cron jobs
      cron.getTasks().forEach(task => task.stop());
      
      // Close database connections
      await this.databaseService.disconnect();
      await this.redisService.disconnect();
      
      // Close server
      this.server.close(() => {
        logger.info('Mobile Backend stopped');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the service
const mobileBackend = new MobileBackend();
mobileBackend.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default mobileBackend;
