import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class IPFSService {
  private client: IPFSHTTPClient | null = null;
  private connected: boolean = false;

  public async initialize(): Promise<void> {
    try {
      this.client = create({
        url: config.IPFS_URL,
        timeout: 30000,
      });

      // Test connection
      const version = await this.client.version();
      this.connected = true;
      logger.info(`IPFS connected: ${version.version}`);
    } catch (error) {
      logger.error('Failed to connect to IPFS:', error);
      this.connected = false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async upload(data: any, metadata?: any): Promise<{ hash: string; size: number }> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      const content = JSON.stringify({ data, metadata });
      const result = await this.client.add(content);
      
      // Pin the content
      await this.client.pin.add(result.cid);
      
      logger.info(`IPFS upload successful: ${result.cid}`);
      
      return {
        hash: result.cid.toString(),
        size: result.size,
      };
    } catch (error) {
      logger.error('IPFS upload failed:', error);
      throw error;
    }
  }

  public async download(hash: string): Promise<any> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      const content = Buffer.concat(chunks).toString();
      const parsed = JSON.parse(content);
      
      logger.info(`IPFS download successful: ${hash}`);
      return parsed;
    } catch (error) {
      logger.error('IPFS download failed:', error);
      throw error;
    }
  }

  public async pin(hash: string): Promise<void> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      await this.client.pin.add(hash);
      logger.info(`IPFS pin successful: ${hash}`);
    } catch (error) {
      logger.error('IPFS pin failed:', error);
      throw error;
    }
  }

  public async unpin(hash: string): Promise<void> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      await this.client.pin.rm(hash);
      logger.info(`IPFS unpin successful: ${hash}`);
    } catch (error) {
      logger.error('IPFS unpin failed:', error);
      throw error;
    }
  }
}
