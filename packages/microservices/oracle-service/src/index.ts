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
import oracleRoutes from './routes/oracleRoutes';
import dataRoutes from './routes/dataRoutes';
import integrationRoutes from './routes/integrationRoutes';
import webhookRoutes from './routes/webhookRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validationMiddleware } from './middleware/validation';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { OracleManager } from './services/OracleManager';
import { DataProcessor } from './services/DataProcessor';
import { WebhookService } from './services/WebhookService';
import { BlockchainService } from './services/BlockchainService';

// Oracle Providers
import { SerasaOracle } from './oracles/SerasaOracle';
import { SPCOracle } from './oracles/SPCOracle';
import { BoaVistaOracle } from './oracles/BoaVistaOracle';
import { ReceitaFederalOracle } from './oracles/ReceitaFederalOracle';
import { BancoCentralOracle } from './oracles/BancoCentralOracle';
import { OpenBankingOracle } from './oracles/OpenBankingOracle';
import { CryptoOracle } from './oracles/CryptoOracle';
import { WeatherOracle } from './oracles/WeatherOracle';
import { EconomicOracle } from './oracles/EconomicOracle';

// Utils
import { logger } from './utils/logger';
import { config } from './config/config';

class OracleService {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private oracleManager: OracleManager;
  private dataProcessor: DataProcessor;
  private webhookService: WebhookService;
  private blockchainService: BlockchainService;

  // Oracle providers
  private serasaOracle: SerasaOracle;
  private spcOracle: SPCOracle;
  private boaVistaOracle: BoaVistaOracle;
  private receitaFederalOracle: ReceitaFederalOracle;
  private bancoCentralOracle: BancoCentralOracle;
  private openBankingOracle: OpenBankingOracle;
  private cryptoOracle: CryptoOracle;
  private weatherOracle: WeatherOracle;
  private economicOracle: EconomicOracle;

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
    this.oracleManager = new OracleManager();
    this.dataProcessor = new DataProcessor();
    this.webhookService = new WebhookService();
    this.blockchainService = new BlockchainService();

    // Initialize oracle providers
    this.serasaOracle = new SerasaOracle();
    this.spcOracle = new SPCOracle();
    this.boaVistaOracle = new BoaVistaOracle();
    this.receitaFederalOracle = new ReceitaFederalOracle();
    this.bancoCentralOracle = new BancoCentralOracle();
    this.openBankingOracle = new OpenBankingOracle();
    this.cryptoOracle = new CryptoOracle();
    this.weatherOracle = new WeatherOracle();
    this.economicOracle = new EconomicOracle();

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
      max: 1000, // Oracle service needs higher limits
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
        service: 'oracle-service',
        version: process.env.npm_package_version || '1.0.0',
        oracles: this.oracleManager.getActiveOracles(),
      });
    });

    // API routes
    this.app.use('/api/v1/oracles', oracleRoutes);
    this.app.use('/api/v1/data', dataRoutes);
    this.app.use('/api/v1/integrations', integrationRoutes);
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
      logger.info(`Oracle client connected: ${socket.id}`);

      // Join oracle room for real-time data
      socket.on('join-oracle-room', (oracleType: string) => {
        socket.join(`oracle-${oracleType}`);
        logger.info(`Client joined oracle room: ${oracleType}`);
      });

      // Handle data requests
      socket.on('request-data', async (data) => {
        try {
          const result = await this.oracleManager.fetchData(data.oracleType, data.params);
          socket.emit('data-response', result);
        } catch (error) {
          socket.emit('data-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Oracle client disconnected: ${socket.id}`);
      });
    });
  }

  private setupCronJobs(): void {
    // Update credit bureau data every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running hourly oracle data update...');
      try {
        await this.oracleManager.updateCreditBureauData();
        this.io.emit('oracle-data-updated', { type: 'credit-bureau', timestamp: new Date() });
      } catch (error) {
        logger.error('Error updating credit bureau data:', error);
      }
    });

    // Update economic indicators every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Running economic indicators update...');
      try {
        await this.oracleManager.updateEconomicData();
        this.io.emit('oracle-data-updated', { type: 'economic', timestamp: new Date() });
      } catch (error) {
        logger.error('Error updating economic data:', error);
      }
    });

    // Update crypto prices every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      logger.info('Running crypto prices update...');
      try {
        await this.oracleManager.updateCryptoData();
        this.io.emit('oracle-data-updated', { type: 'crypto', timestamp: new Date() });
      } catch (error) {
        logger.error('Error updating crypto data:', error);
      }
    });

    // Clean old data every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Running daily data cleanup...');
      try {
        await this.oracleManager.cleanOldData();
      } catch (error) {
        logger.error('Error cleaning old data:', error);
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
      await this.oracleManager.initialize();
      await this.dataProcessor.initialize();
      await this.webhookService.initialize();
      await this.blockchainService.initialize();

      // Register oracle providers
      await this.oracleManager.registerOracle('serasa', this.serasaOracle);
      await this.oracleManager.registerOracle('spc', this.spcOracle);
      await this.oracleManager.registerOracle('boa-vista', this.boaVistaOracle);
      await this.oracleManager.registerOracle('receita-federal', this.receitaFederalOracle);
      await this.oracleManager.registerOracle('banco-central', this.bancoCentralOracle);
      await this.oracleManager.registerOracle('open-banking', this.openBankingOracle);
      await this.oracleManager.registerOracle('crypto', this.cryptoOracle);
      await this.oracleManager.registerOracle('weather', this.weatherOracle);
      await this.oracleManager.registerOracle('economic', this.economicOracle);

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 Oracle Service running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
        logger.info(`🔗 API Documentation: http://localhost:${config.PORT}/api-docs`);
        logger.info(`📡 Active Oracles: ${this.oracleManager.getActiveOracles().join(', ')}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start Oracle Service:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down Oracle Service...');
    
    try {
      // Stop cron jobs
      cron.getTasks().forEach(task => task.stop());
      
      // Close database connections
      await this.databaseService.disconnect();
      await this.redisService.disconnect();
      
      // Close server
      this.server.close(() => {
        logger.info('Oracle Service stopped');
        process.exit(0);
      });
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the service
const oracleService = new OracleService();
oracleService.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default oracleService;
