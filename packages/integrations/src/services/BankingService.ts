import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class BankingService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = config.BANKING_API_KEY;
    this.baseURL = config.BANKING_BASE_URL;
  }

  public async getAccountBalance(accountId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/accounts/${accountId}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get account balance:', error);
      throw error;
    }
  }

  public async getTransactionHistory(accountId: string, fromDate: string, toDate: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          from_date: fromDate,
          to_date: toDate,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  public async initiatePayment(paymentData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/payments`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to initiate payment:', error);
      throw error;
    }
  }
}
