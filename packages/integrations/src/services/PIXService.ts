import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface PIXConfig {
  clientId: string;
  clientSecret: string;
  certificatePath: string;
  privateKeyPath: string;
  baseUrl: string;
  sandbox: boolean;
}

export interface PIXPayment {
  id: string;
  endToEndId: string;
  txId: string;
  amount: number;
  currency: string;
  payer: PIXPayer;
  payee: PIXPayee;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export interface PIXPayer {
  type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  value: string;
  name: string;
  document?: string;
}

export interface PIXPayee {
  type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  value: string;
  name: string;
  document?: string;
  account: PIXAccount;
}

export interface PIXAccount {
  bankCode: string;
  branch: string;
  account: string;
  accountType: 'checking' | 'savings';
}

export interface PIXQRCode {
  id: string;
  qrCode: string;
  qrCodeImage: string;
  expirationDate: Date;
  amount?: number;
  description?: string;
  payer?: PIXPayer;
  status: 'active' | 'expired' | 'used';
  createdAt: Date;
  usedAt?: Date;
}

export interface PIXRefund {
  id: string;
  originalPaymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export interface PIXWebhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret: string;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

export class PIXService {
  private config: PIXConfig;
  private httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(config: PIXConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para adicionar autenticação
    this.httpClient.interceptors.request.use(
      async (config) => {
        if (!this.accessToken || !this.tokenExpiresAt || this.tokenExpiresAt <= new Date()) {
          await this.authenticate();
        }
        
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para lidar com erros
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.accessToken = null;
          this.tokenExpiresAt = null;
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await this.httpClient.post('/auth/token', {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials'
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);
    } catch (error) {
      console.error('Erro na autenticação PIX:', error);
      throw new Error('Falha na autenticação PIX');
    }
  }

  async createPayment(payment: Omit<PIXPayment, 'id' | 'status' | 'createdAt'>): Promise<PIXPayment> {
    try {
      const response = await this.httpClient.post('/pix/payments', {
        amount: payment.amount,
        currency: payment.currency,
        payer: payment.payer,
        payee: payment.payee,
        description: payment.description
      });

      return {
        id: response.data.id,
        endToEndId: response.data.endToEndId,
        txId: response.data.txId,
        amount: payment.amount,
        currency: payment.currency,
        payer: payment.payer,
        payee: payment.payee,
        description: payment.description,
        status: 'pending',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error('Falha ao criar pagamento PIX');
    }
  }

  async getPayment(paymentId: string): Promise<PIXPayment> {
    try {
      const response = await this.httpClient.get(`/pix/payments/${paymentId}`);
      
      return {
        id: response.data.id,
        endToEndId: response.data.endToEndId,
        txId: response.data.txId,
        amount: response.data.amount,
        currency: response.data.currency,
        payer: response.data.payer,
        payee: response.data.payee,
        description: response.data.description,
        status: response.data.status,
        createdAt: new Date(response.data.createdAt),
        completedAt: response.data.completedAt ? new Date(response.data.completedAt) : undefined,
        failedAt: response.data.failedAt ? new Date(response.data.failedAt) : undefined,
        failureReason: response.data.failureReason
      };
    } catch (error) {
      console.error('Erro ao buscar pagamento PIX:', error);
      throw new Error('Falha ao buscar pagamento PIX');
    }
  }

  async getPayments(filters?: {
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<PIXPayment[]> {
    try {
      const params: any = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.fromDate) params.fromDate = filters.fromDate.toISOString();
      if (filters?.toDate) params.toDate = filters.toDate.toISOString();
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;

      const response = await this.httpClient.get('/pix/payments', { params });

      return response.data.payments.map((payment: any) => ({
        id: payment.id,
        endToEndId: payment.endToEndId,
        txId: payment.txId,
        amount: payment.amount,
        currency: payment.currency,
        payer: payment.payer,
        payee: payment.payee,
        description: payment.description,
        status: payment.status,
        createdAt: new Date(payment.createdAt),
        completedAt: payment.completedAt ? new Date(payment.completedAt) : undefined,
        failedAt: payment.failedAt ? new Date(payment.failedAt) : undefined,
        failureReason: payment.failureReason
      }));
    } catch (error) {
      console.error('Erro ao buscar pagamentos PIX:', error);
      throw new Error('Falha ao buscar pagamentos PIX');
    }
  }

  async createQRCode(qrCode: Omit<PIXQRCode, 'id' | 'status' | 'createdAt'>): Promise<PIXQRCode> {
    try {
      const response = await this.httpClient.post('/pix/qrcodes', {
        amount: qrCode.amount,
        description: qrCode.description,
        payer: qrCode.payer,
        expirationDate: qrCode.expirationDate.toISOString()
      });

      return {
        id: response.data.id,
        qrCode: response.data.qrCode,
        qrCodeImage: response.data.qrCodeImage,
        expirationDate: new Date(response.data.expirationDate),
        amount: qrCode.amount,
        description: qrCode.description,
        payer: qrCode.payer,
        status: 'active',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar QR Code PIX:', error);
      throw new Error('Falha ao criar QR Code PIX');
    }
  }

  async getQRCode(qrCodeId: string): Promise<PIXQRCode> {
    try {
      const response = await this.httpClient.get(`/pix/qrcodes/${qrCodeId}`);
      
      return {
        id: response.data.id,
        qrCode: response.data.qrCode,
        qrCodeImage: response.data.qrCodeImage,
        expirationDate: new Date(response.data.expirationDate),
        amount: response.data.amount,
        description: response.data.description,
        payer: response.data.payer,
        status: response.data.status,
        createdAt: new Date(response.data.createdAt),
        usedAt: response.data.usedAt ? new Date(response.data.usedAt) : undefined
      };
    } catch (error) {
      console.error('Erro ao buscar QR Code PIX:', error);
      throw new Error('Falha ao buscar QR Code PIX');
    }
  }

  async processQRCode(qrCode: string, payer: PIXPayer): Promise<PIXPayment> {
    try {
      const response = await this.httpClient.post('/pix/qrcodes/process', {
        qrCode,
        payer
      });

      return {
        id: response.data.id,
        endToEndId: response.data.endToEndId,
        txId: response.data.txId,
        amount: response.data.amount,
        currency: response.data.currency,
        payer: response.data.payer,
        payee: response.data.payee,
        description: response.data.description,
        status: response.data.status,
        createdAt: new Date(response.data.createdAt)
      };
    } catch (error) {
      console.error('Erro ao processar QR Code PIX:', error);
      throw new Error('Falha ao processar QR Code PIX');
    }
  }

  async createRefund(refund: Omit<PIXRefund, 'id' | 'status' | 'createdAt'>): Promise<PIXRefund> {
    try {
      const response = await this.httpClient.post('/pix/refunds', {
        originalPaymentId: refund.originalPaymentId,
        amount: refund.amount,
        reason: refund.reason
      });

      return {
        id: response.data.id,
        originalPaymentId: refund.originalPaymentId,
        amount: refund.amount,
        reason: refund.reason,
        status: 'pending',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar estorno PIX:', error);
      throw new Error('Falha ao criar estorno PIX');
    }
  }

  async getRefund(refundId: string): Promise<PIXRefund> {
    try {
      const response = await this.httpClient.get(`/pix/refunds/${refundId}`);
      
      return {
        id: response.data.id,
        originalPaymentId: response.data.originalPaymentId,
        amount: response.data.amount,
        reason: response.data.reason,
        status: response.data.status,
        createdAt: new Date(response.data.createdAt),
        completedAt: response.data.completedAt ? new Date(response.data.completedAt) : undefined,
        failedAt: response.data.failedAt ? new Date(response.data.failedAt) : undefined,
        failureReason: response.data.failureReason
      };
    } catch (error) {
      console.error('Erro ao buscar estorno PIX:', error);
      throw new Error('Falha ao buscar estorno PIX');
    }
  }

  async getRefunds(filters?: {
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<PIXRefund[]> {
    try {
      const params: any = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.fromDate) params.fromDate = filters.fromDate.toISOString();
      if (filters?.toDate) params.toDate = filters.toDate.toISOString();
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.offset) params.offset = filters.offset;

      const response = await this.httpClient.get('/pix/refunds', { params });

      return response.data.refunds.map((refund: any) => ({
        id: refund.id,
        originalPaymentId: refund.originalPaymentId,
        amount: refund.amount,
        reason: refund.reason,
        status: refund.status,
        createdAt: new Date(refund.createdAt),
        completedAt: refund.completedAt ? new Date(refund.completedAt) : undefined,
        failedAt: refund.failedAt ? new Date(refund.failedAt) : undefined,
        failureReason: refund.failureReason
      }));
    } catch (error) {
      console.error('Erro ao buscar estornos PIX:', error);
      throw new Error('Falha ao buscar estornos PIX');
    }
  }

  async createWebhook(webhook: Omit<PIXWebhook, 'id' | 'secret' | 'createdAt'>): Promise<PIXWebhook> {
    try {
      const response = await this.httpClient.post('/pix/webhooks', {
        url: webhook.url,
        events: webhook.events
      });

      return {
        id: response.data.id,
        url: webhook.url,
        events: webhook.events,
        status: 'active',
        secret: response.data.secret,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar webhook PIX:', error);
      throw new Error('Falha ao criar webhook PIX');
    }
  }

  async getWebhook(webhookId: string): Promise<PIXWebhook> {
    try {
      const response = await this.httpClient.get(`/pix/webhooks/${webhookId}`);
      
      return {
        id: response.data.id,
        url: response.data.url,
        events: response.data.events,
        status: response.data.status,
        secret: response.data.secret,
        createdAt: new Date(response.data.createdAt),
        lastTriggeredAt: response.data.lastTriggeredAt ? new Date(response.data.lastTriggeredAt) : undefined
      };
    } catch (error) {
      console.error('Erro ao buscar webhook PIX:', error);
      throw new Error('Falha ao buscar webhook PIX');
    }
  }

  async updateWebhook(webhookId: string, updates: Partial<PIXWebhook>): Promise<PIXWebhook> {
    try {
      const response = await this.httpClient.put(`/pix/webhooks/${webhookId}`, updates);
      
      return {
        id: response.data.id,
        url: response.data.url,
        events: response.data.events,
        status: response.data.status,
        secret: response.data.secret,
        createdAt: new Date(response.data.createdAt),
        lastTriggeredAt: response.data.lastTriggeredAt ? new Date(response.data.lastTriggeredAt) : undefined
      };
    } catch (error) {
      console.error('Erro ao atualizar webhook PIX:', error);
      throw new Error('Falha ao atualizar webhook PIX');
    }
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/pix/webhooks/${webhookId}`);
    } catch (error) {
      console.error('Erro ao deletar webhook PIX:', error);
      throw new Error('Falha ao deletar webhook PIX');
    }
  }

  async getPaymentStatistics(filters?: {
    fromDate?: Date;
    toDate?: Date;
    status?: string;
  }): Promise<any> {
    try {
      const params: any = {};
      if (filters?.fromDate) params.fromDate = filters.fromDate.toISOString();
      if (filters?.toDate) params.toDate = filters.toDate.toISOString();
      if (filters?.status) params.status = filters.status;

      const response = await this.httpClient.get('/pix/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas PIX:', error);
      throw new Error('Falha ao buscar estatísticas PIX');
    }
  }

  async validatePIXKey(key: string, keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'): Promise<boolean> {
    try {
      const response = await this.httpClient.post('/pix/validate-key', {
        key,
        keyType
      });

      return response.data.valid;
    } catch (error) {
      console.error('Erro ao validar chave PIX:', error);
      return false;
    }
  }

  async getPIXKeyInfo(key: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/pix/keys/${key}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações da chave PIX:', error);
      throw new Error('Falha ao buscar informações da chave PIX');
    }
  }

  async createPIXKey(key: string, keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random', account: PIXAccount): Promise<any> {
    try {
      const response = await this.httpClient.post('/pix/keys', {
        key,
        keyType,
        account
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao criar chave PIX:', error);
      throw new Error('Falha ao criar chave PIX');
    }
  }

  async deletePIXKey(key: string): Promise<void> {
    try {
      await this.httpClient.delete(`/pix/keys/${key}`);
    } catch (error) {
      console.error('Erro ao deletar chave PIX:', error);
      throw new Error('Falha ao deletar chave PIX');
    }
  }

  async getPIXKeys(): Promise<any[]> {
    try {
      const response = await this.httpClient.get('/pix/keys');
      return response.data.keys;
    } catch (error) {
      console.error('Erro ao buscar chaves PIX:', error);
      throw new Error('Falha ao buscar chaves PIX');
    }
  }

  async processWebhook(payload: any, signature: string, secret: string): Promise<boolean> {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('Erro ao processar webhook PIX:', error);
      return false;
    }
  }

  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await this.httpClient.get('/pix/payment-methods');
      return response.data.methods;
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      throw new Error('Falha ao buscar métodos de pagamento');
    }
  }

  async getSupportedBanks(): Promise<any[]> {
    try {
      const response = await this.httpClient.get('/pix/banks');
      return response.data.banks;
    } catch (error) {
      console.error('Erro ao buscar bancos suportados:', error);
      throw new Error('Falha ao buscar bancos suportados');
    }
  }
}

export const pixService = new PIXService({
  clientId: process.env.PIX_CLIENT_ID || '',
  clientSecret: process.env.PIX_CLIENT_SECRET || '',
  certificatePath: process.env.PIX_CERTIFICATE_PATH || '',
  privateKeyPath: process.env.PIX_PRIVATE_KEY_PATH || '',
  baseUrl: process.env.PIX_BASE_URL || 'https://api.pix.com.br',
  sandbox: process.env.NODE_ENV !== 'production'
});