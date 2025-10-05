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
import analyticsRoutes from './routes/analyticsRoutes';
import metricsRoutes from './routes/metricsRoutes';
import reportsRoutes from './routes/reportsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { AnalyticsManager } from './services/AnalyticsManager';
import { MetricsCollector } from './services/MetricsCollector';
import { ReportGenerator } from './services/ReportGenerator';
import { DashboardService } from './services/DashboardService';

// Utils
import { logger } from './utils/logger';
import { config } from './config/config';

class AnalyticsService {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private analyticsManager: AnalyticsManager;
  private metricsCollector: MetricsCollector;
  private reportGenerator: ReportGenerator;
  private dashboardService: DashboardService;

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
    this.analyticsManager = new AnalyticsManager();
    this.metricsCollector = new MetricsCollector();
    this.reportGenerator = new ReportGenerator();
    this.dashboardService = new DashboardService();

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
      max: 1000, // Analytics service needs higher limits
      message: 'Too many requests from this IP, please try again later.',
    }));

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Custom middleware
    this.app.use(rateLimitMiddleware);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'analytics-service',
        version: process.env.npm_package_version || '1.0.0',
        metrics: this.metricsCollector.getSystemMetrics(),
      });
    });

    // API routes
    this.app.use('/api/v1/analytics', analyticsRoutes);
    this.app.use('/api/v1/metrics', metricsRoutes);
    this.app.use('/api/v1/reports', reportsRoutes);
    this.app.use('/api/v1/dashboard', dashboardRoutes);

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
      logger.info(`Analytics client connected: ${socket.id}`);

      // Join dashboard room
      socket.on('join-dashboard', (dashboardId: string) => {
        socket.join(`dashboard-${dashboardId}`);
        logger.info(`Client joined dashboard: ${dashboardId}`);
      });

      // Handle real-time metrics
      socket.on('request-metrics', async (data) => {
        try {
          const metrics = await this.metricsCollector.getMetrics(data.type, data.filters);
          socket.emit('metrics-response', metrics);
        } catch (error) {
          socket.emit('metrics-error', { error: error.message });
        }
      });

      // Handle report generation
      socket.on('generate-report', async (data) => {
        try {
          const report = await this.reportGenerator.generateReport(data.type, data.params);
          socket.emit('report-generated', report);
        } catch (error) {
          socket.emit('report-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Analytics client disconnected: ${socket.id}`);
      });
    });
  }

  private setupCronJobs(): void {
    // Collect metrics every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.metricsCollector.collectSystemMetrics();
        this.io.emit('metrics-updated', { timestamp: new Date() });
      } catch (error) {
        logger.error('Error collecting metrics:', error);
      }
    });

    // Generate daily reports at 2 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        await this.analyticsManager.generateDailyReports();
      } catch (error) {
        logger.error('Error generating daily reports:', error);
      }
    });

    // Clean old analytics data every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      try {
        await this.analyticsManager.cleanOldData();
      } catch (error) {
        logger.error('Error cleaning old data:', error);
      }
    });

    // Update dashboard data every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.dashboardService.updateDashboardData();
        this.io.emit('dashboard-updated', { timestamp: new Date() });
      } catch (error) {
        logger.error('Error updating dashboard:', error);
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
      await this.analyticsManager.initialize();
      await this.metricsCollector.initialize();
      await this.reportGenerator.initialize();
      await this.dashboardService.initialize();

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 Analytics Service running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
        logger.info(`🔗 API Documentation: http://localhost:${config.PORT}/api-docs`);
        logger.info(`📈 Dashboard: http://localhost:${config.PORT}/dashboard`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start Analytics Service:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down Analytics Service...');
    
    try {
      // Stop cron jobs
      cron.getTasks().forEach(task => task.stop());
      
      // Close database connections
      await this.databaseService.disconnect();
      await this.redisService.disconnect();
      
      // Close server
      this.server.close(() => {
        logger.info('Analytics Service stopped');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the service
const analyticsService = new AnalyticsService();
analyticsService.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default analyticsService;
