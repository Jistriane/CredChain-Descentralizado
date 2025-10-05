import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { IPFSService } from './services/IPFSService';
import { ArweaveService } from './services/ArweaveService';
import { StorageManager } from './services/StorageManager';
import { logger } from './utils/logger';
import { config } from './config/config';

class DecentralizedStorageService {
  private app: express.Application;
  private server: any;
  private ipfsService: IPFSService;
  private arweaveService: ArweaveService;
  private storageManager: StorageManager;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    
    // Initialize services
    this.ipfsService = new IPFSService();
    this.arweaveService = new ArweaveService();
    this.storageManager = new StorageManager();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'decentralized-storage',
        ipfs: this.ipfsService.isConnected(),
        arweave: this.arweaveService.isConnected(),
      });
    });

    // IPFS routes
    this.app.post('/api/v1/ipfs/upload', async (req, res) => {
      try {
        const { data, metadata } = req.body;
        const result = await this.ipfsService.upload(data, metadata);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/v1/ipfs/:hash', async (req, res) => {
      try {
        const { hash } = req.params;
        const data = await this.ipfsService.download(hash);
        res.json({ data });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Arweave routes
    this.app.post('/api/v1/arweave/upload', async (req, res) => {
      try {
        const { data, tags } = req.body;
        const result = await this.arweaveService.upload(data, tags);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/v1/arweave/:txId', async (req, res) => {
      try {
        const { txId } = req.params;
        const data = await this.arweaveService.download(txId);
        res.json({ data });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Storage manager routes
    this.app.post('/api/v1/storage/upload', async (req, res) => {
      try {
        const { data, type, permanent } = req.body;
        const result = await this.storageManager.upload(data, type, permanent);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/v1/storage/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const data = await this.storageManager.download(id);
        res.json({ data });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize services
      await this.ipfsService.initialize();
      await this.arweaveService.initialize();
      await this.storageManager.initialize();

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 Decentralized Storage Service running on port ${config.PORT}`);
        logger.info(`📊 Health check: http://localhost:${config.PORT}/health`);
      });

    } catch (error) {
      logger.error('Failed to start service:', error);
      process.exit(1);
    }
  }
}

// Start the service
const storageService = new DecentralizedStorageService();
storageService.start().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});

export default storageService;
