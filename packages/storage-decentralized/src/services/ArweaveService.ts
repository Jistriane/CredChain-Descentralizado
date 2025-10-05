import Arweave from 'arweave';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class ArweaveService {
  private client: Arweave | null = null;
  private connected: boolean = false;

  public async initialize(): Promise<void> {
    try {
      this.client = Arweave.init({
        host: config.ARWEAVE_HOST,
        port: config.ARWEAVE_PORT,
        protocol: config.ARWEAVE_PROTOCOL,
        timeout: 30000,
      });

      // Test connection
      const network = await this.client.network.getInfo();
      this.connected = true;
      logger.info(`Arweave connected: ${network.version}`);
    } catch (error) {
      logger.error('Failed to connect to Arweave:', error);
      this.connected = false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async upload(data: any, tags?: Record<string, string>): Promise<{ txId: string; fee: string }> {
    if (!this.client) {
      throw new Error('Arweave client not initialized');
    }

    try {
      const wallet = await this.client.wallets.generate();
      const transaction = await this.client.createTransaction({
        data: JSON.stringify(data),
        target: '',
        quantity: '0',
        tags: tags || {},
      }, wallet);

      await this.client.transactions.sign(transaction, wallet);
      const response = await this.client.transactions.post(transaction);

      logger.info(`Arweave upload successful: ${transaction.id}`);
      
      return {
        txId: transaction.id,
        fee: transaction.reward,
      };
    } catch (error) {
      logger.error('Arweave upload failed:', error);
      throw error;
    }
  }

  public async download(txId: string): Promise<any> {
    if (!this.client) {
      throw new Error('Arweave client not initialized');
    }

    try {
      const transaction = await this.client.transactions.get(txId);
      const data = await this.client.transactions.getData(txId, { decode: true, string: true });
      
      logger.info(`Arweave download successful: ${txId}`);
      return JSON.parse(data as string);
    } catch (error) {
      logger.error('Arweave download failed:', error);
      throw error;
    }
  }

  public async getTransaction(txId: string): Promise<any> {
    if (!this.client) {
      throw new Error('Arweave client not initialized');
    }

    try {
      const transaction = await this.client.transactions.get(txId);
      return transaction;
    } catch (error) {
      logger.error('Arweave get transaction failed:', error);
      throw error;
    }
  }

  public async getBalance(address: string): Promise<string> {
    if (!this.client) {
      throw new Error('Arweave client not initialized');
    }

    try {
      const balance = await this.client.wallets.getBalance(address);
      return this.client.ar.winstonToAr(balance);
    } catch (error) {
      logger.error('Arweave get balance failed:', error);
      throw error;
    }
  }
}
