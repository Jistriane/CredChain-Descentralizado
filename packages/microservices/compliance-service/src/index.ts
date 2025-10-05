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
import complianceRoutes from './routes/complianceRoutes';
import auditRoutes from './routes/auditRoutes';
import regulationRoutes from './routes/regulationRoutes';
import policyRoutes from './routes/policyRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { ComplianceManager } from './services/ComplianceManager';
import { AuditService } from './services/AuditService';
import { RegulationService } from './services/RegulationService';
import { PolicyService } from './services/PolicyService';

// Utils
import { logger } from './utils/logger';
import { config } from './config/config';

class ComplianceService {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private complianceManager: ComplianceManager;
  private auditService: AuditService;
  private regulationService: RegulationService;
  private policyService: PolicyService;

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
    this.complianceManager = new ComplianceManager();
    this.auditService = new AuditService();
    this.regulationService = new RegulationService();
    this.policyService = new PolicyService();

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
      max: 500, // Compliance service needs moderate limits
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
        service: 'compliance-service',
        version: process.env.npm_package_version || '1.0.0',
        regulations: this.regulationService.getActiveRegulations(),
      });
    });

    // API routes
    this.app.use('/api/v1/compliance', complianceRoutes);
    this.app.use('/api/v1/audit', auditRoutes);
    this.app.use('/api/v1/regulations', regulationRoutes);
    this.app.use('/api/v1/policies', policyRoutes);

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
      logger.info(`Compliance client connected: ${socket.id}`);

      // Join compliance room
      socket.on('join-compliance-room', (userId: string) => {
        socket.join(`compliance-${userId}`);
        logger.info(`Client joined compliance room: ${userId}`);
      });

      // Handle compliance checks
      socket.on('check-compliance', async (data) => {
        try {
          const result = await this.complianceManager.checkCompliance(data.operation, data.userId);
          socket.emit('compliance-result', result);
        } catch (error) {
          socket.emit('compliance-error', { error: error.message });
        }
      });

      // Handle audit requests
      socket.on('request-audit', async (data) => {
        try {
          const audit = await this.auditService.generateAuditReport(data.userId, data.period);
          socket.emit('audit-report', audit);
        } catch (error) {
          socket.emit('audit-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Compliance client disconnected: ${socket.id}`);
      });
    });
  }

  private setupCronJobs(): void {
    // Run compliance checks every hour
    cron.schedule('0 * * * *', async () => {
      try {
        await this.complianceManager.runScheduledChecks();
        this.io.emit('compliance-checks-completed', { timestamp: new Date() });
      } catch (error) {
        logger.error('Error running compliance checks:', error);
      }
    });

    // Generate audit reports daily at 1 AM
    cron.schedule('0 1 * * *', async () => {
      try {
        await this.auditService.generateDailyReports();
      } catch (error) {
        logger.error('Error generating audit reports:', error);
      }
    });

    // Update regulation database weekly
    cron.schedule('0 2 * * 0', async () => {
      try {
        await this.regulationService.updateRegulations();
      } catch (error) {
        logger.error('Error updating regulations:', error);
      }
    });

    // Clean old audit logs monthly
    cron.schedule('0 3 1 * *', async () => {
      try {
        await this.auditService.cleanOldLogs();
      } catch (error) {
        logger.error('Error cleaning audit logs:', error);
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
      await this.complianceManager.initialize();
      await this.auditService.initialize();
      await this.regulationService.initialize();
      await this.policyService.initialize();

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 Compliance Service running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
        logger.info(`🔗 API Documentation: http://localhost:${config.PORT}/api-docs`);
        logger.info(`📋 Active Regulations: ${this.regulationService.getActiveRegulations().join(', ')}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start Compliance Service:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down Compliance Service...');
    
    try {
      // Stop cron jobs
      cron.getTasks().forEach(task => task.stop());
      
      // Close database connections
      await this.databaseService.disconnect();
      await this.redisService.disconnect();
      
      // Close server
      this.server.close(() => {
        logger.info('Compliance Service stopped');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the service
const complianceService = new ComplianceService();
complianceService.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default complianceService;
