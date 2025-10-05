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
import notificationRoutes from './routes/notificationRoutes';
import templateRoutes from './routes/templateRoutes';
import channelRoutes from './routes/channelRoutes';
import webhookRoutes from './routes/webhookRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { NotificationManager } from './services/NotificationManager';
import { TemplateService } from './services/TemplateService';
import { ChannelService } from './services/ChannelService';
import { WebhookService } from './services/WebhookService';
import { QueueService } from './services/QueueService';

// Notification Channels
import { EmailChannel } from './channels/EmailChannel';
import { SMSChannel } from './channels/SMSChannel';
import { PushChannel } from './channels/PushChannel';
import { WebSocketChannel } from './channels/WebSocketChannel';
import { InAppChannel } from './channels/InAppChannel';

// Utils
import { logger } from './utils/logger';
import { config } from './config/config';

class NotificationService {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private notificationManager: NotificationManager;
  private templateService: TemplateService;
  private channelService: ChannelService;
  private webhookService: WebhookService;
  private queueService: QueueService;

  // Notification channels
  private emailChannel: EmailChannel;
  private smsChannel: SMSChannel;
  private pushChannel: PushChannel;
  private webSocketChannel: WebSocketChannel;
  private inAppChannel: InAppChannel;

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
    this.notificationManager = new NotificationManager();
    this.templateService = new TemplateService();
    this.channelService = new ChannelService();
    this.webhookService = new WebhookService();
    this.queueService = new QueueService();

    // Initialize notification channels
    this.emailChannel = new EmailChannel();
    this.smsChannel = new SMSChannel();
    this.pushChannel = new PushChannel();
    this.webSocketChannel = new WebSocketChannel();
    this.inAppChannel = new InAppChannel();

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
      max: 500, // Notification service needs moderate limits
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
        service: 'notification-service',
        version: process.env.npm_package_version || '1.0.0',
        channels: this.channelService.getActiveChannels(),
      });
    });

    // API routes
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/templates', templateRoutes);
    this.app.use('/api/v1/channels', channelRoutes);
    this.app.use('/api/v1/webhooks', webhookRoutes);

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
      logger.info(`Notification client connected: ${socket.id}`);

      // Join user to their notification room
      socket.on('join-notification-room', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined notification room`);
      });

      // Handle notification preferences
      socket.on('update-preferences', async (data) => {
        try {
          await this.notificationManager.updateUserPreferences(data.userId, data.preferences);
          socket.emit('preferences-updated', data);
        } catch (error) {
          socket.emit('preferences-error', { error: error.message });
        }
      });

      // Handle real-time notifications
      socket.on('send-notification', async (data) => {
        try {
          const result = await this.notificationManager.sendNotification(data);
          socket.emit('notification-sent', result);
        } catch (error) {
          socket.emit('notification-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Notification client disconnected: ${socket.id}`);
      });
    });
  }

  private setupCronJobs(): void {
    // Process notification queue every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.queueService.processQueue();
      } catch (error) {
        logger.error('Error processing notification queue:', error);
      }
    });

    // Send scheduled notifications every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.notificationManager.sendScheduledNotifications();
      } catch (error) {
        logger.error('Error sending scheduled notifications:', error);
      }
    });

    // Clean old notifications every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      try {
        await this.notificationManager.cleanOldNotifications();
      } catch (error) {
        logger.error('Error cleaning old notifications:', error);
      }
    });

    // Update delivery statistics every hour
    cron.schedule('0 * * * *', async () => {
      try {
        await this.notificationManager.updateDeliveryStats();
      } catch (error) {
        logger.error('Error updating delivery stats:', error);
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
      await this.notificationManager.initialize();
      await this.templateService.initialize();
      await this.channelService.initialize();
      await this.webhookService.initialize();
      await this.queueService.initialize();

      // Register notification channels
      await this.channelService.registerChannel('email', this.emailChannel);
      await this.channelService.registerChannel('sms', this.smsChannel);
      await this.channelService.registerChannel('push', this.pushChannel);
      await this.channelService.registerChannel('websocket', this.webSocketChannel);
      await this.channelService.registerChannel('in-app', this.inAppChannel);

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 Notification Service running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
        logger.info(`🔗 API Documentation: http://localhost:${config.PORT}/api-docs`);
        logger.info(`📡 Active Channels: ${this.channelService.getActiveChannels().join(', ')}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start Notification Service:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down Notification Service...');
    
    try {
      // Stop cron jobs
      cron.getTasks().forEach(task => task.stop());
      
      // Close database connections
      await this.databaseService.disconnect();
      await this.redisService.disconnect();
      
      // Close server
      this.server.close(() => {
        logger.info('Notification Service stopped');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the service
const notificationService = new NotificationService();
notificationService.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default notificationService;
