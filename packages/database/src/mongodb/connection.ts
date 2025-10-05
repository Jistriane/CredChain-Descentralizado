import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { config } from '../config/config';

class MongoDBConnection {
  private connection: mongoose.Connection | null = null;
  private isConnected: boolean = false;

  public async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        return;
      }

      const mongoURI = config.MONGODB_URI || 'mongodb://localhost:27017/credchain';
      
      await mongoose.connect(mongoURI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
      });

      this.connection = mongoose.connection;
      this.isConnected = true;

      // Event listeners
      this.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
      });

      this.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      this.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', this.disconnect.bind(this));
      process.on('SIGTERM', this.disconnect.bind(this));

      logger.info(`MongoDB connected to: ${mongoURI}`);
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        logger.info('MongoDB disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnection(): mongoose.Connection | null {
    return this.connection;
  }

  public isConnectedToDB(): boolean {
    return this.isConnected && this.connection?.readyState === 1;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnectedToDB()) {
        return false;
      }

      await this.connection?.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('MongoDB health check failed:', error);
      return false;
    }
  }

  public async getStats(): Promise<any> {
    try {
      if (!this.isConnectedToDB()) {
        throw new Error('MongoDB not connected');
      }

      const stats = await this.connection?.db.stats();
      return {
        collections: stats?.collections || 0,
        dataSize: stats?.dataSize || 0,
        storageSize: stats?.storageSize || 0,
        indexes: stats?.indexes || 0,
        objects: stats?.objects || 0,
      };
    } catch (error) {
      logger.error('Failed to get MongoDB stats:', error);
      throw error;
    }
  }
}

export const mongoConnection = new MongoDBConnection();
export default mongoConnection;
