import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface OpenBankingConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
  sandbox: boolean;
}

export interface BankAccount {
  id: string;
  bankCode: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branchNumber: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  category?: string;
  merchant?: string;
  reference?: string;
}

export interface CreditCard {
  id: string;
  bankCode: string;
  bankName: string;
  cardNumber: string;
  cardType: string;
  creditLimit: number;
  availableLimit: number;
  usedLimit: number;
  dueDate: Date;
  status: string;
  createdAt: Date;
}

export interface Loan {
  id: string;
  bankCode: string;
  bankName: string;
  loanType: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: Date;
  status: string;
  createdAt: Date;
}

export interface OpenBankingConsent {
  id: string;
  userId: string;
  bankCode: string;
  permissions: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  approvedAt?: Date;
}

export class OpenBankingService {
  private config: OpenBankingConfig;
  private httpClient: AxiosInstance;
  private accessTokens: Map<string, string> = new Map();
  private refreshTokens: Map<string, string> = new Map();

  constructor(config: OpenBankingConfig) {
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
      (config) => {
        const userId = config.headers['x-user-id'] as string;
        const token = this.accessTokens.get(userId);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para lidar com tokens expirados
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const userId = error.config.headers['x-user-id'] as string;
          const refreshToken = this.refreshTokens.get(userId);
          
          if (refreshToken) {
            try {
              await this.refreshAccessToken(userId, refreshToken);
              // Retry original request
              return this.httpClient.request(error.config);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              throw new Error('Sessão expirada. Faça login novamente.');
            }
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async createConsent(userId: string, bankCode: string, permissions: string[]): Promise<OpenBankingConsent> {
    try {
      const response = await this.httpClient.post('/consents', {
        userId,
        bankCode,
        permissions,
        redirectUri: this.config.redirectUri,
        expiresIn: 3600 // 1 hora
      });

      const consent: OpenBankingConsent = {
        id: response.data.id,
        userId,
        bankCode,
        permissions,
        status: 'pending',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        createdAt: new Date()
      };

      return consent;
    } catch (error) {
      console.error('Erro ao criar consentimento Open Banking:', error);
      throw new Error('Falha ao criar consentimento Open Banking');
    }
  }

  async authorizeConsent(consentId: string, authorizationCode: string): Promise<OpenBankingConsent> {
    try {
      const response = await this.httpClient.post(`/consents/${consentId}/authorize`, {
        authorizationCode
      });

      const consent = response.data;
      consent.status = 'approved';
      consent.approvedAt = new Date();

      // Armazenar tokens
      this.accessTokens.set(consent.userId, response.data.accessToken);
      this.refreshTokens.set(consent.userId, response.data.refreshToken);

      return consent;
    } catch (error) {
      console.error('Erro ao autorizar consentimento:', error);
      throw new Error('Falha ao autorizar consentimento');
    }
  }

  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
      const response = await this.httpClient.get('/accounts', {
        headers: { 'x-user-id': userId }
      });

      return response.data.accounts.map((account: any) => ({
        id: account.id,
        bankCode: account.bankCode,
        bankName: account.bankName,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        branchNumber: account.branchNumber,
        balance: account.balance,
        currency: account.currency,
        status: account.status,
        createdAt: new Date(account.createdAt),
        updatedAt: new Date(account.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
      throw new Error('Falha ao buscar contas bancárias');
    }
  }

  async getTransactions(userId: string, accountId: string, fromDate?: Date, toDate?: Date): Promise<Transaction[]> {
    try {
      const params: any = { accountId };
      if (fromDate) params.fromDate = fromDate.toISOString();
      if (toDate) params.toDate = toDate.toISOString();

      const response = await this.httpClient.get('/transactions', {
        headers: { 'x-user-id': userId },
        params
      });

      return response.data.transactions.map((transaction: any) => ({
        id: transaction.id,
        accountId: transaction.accountId,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        type: transaction.type,
        status: transaction.status,
        date: new Date(transaction.date),
        category: transaction.category,
        merchant: transaction.merchant,
        reference: transaction.reference
      }));
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Falha ao buscar transações');
    }
  }

  async getCreditCards(userId: string): Promise<CreditCard[]> {
    try {
      const response = await this.httpClient.get('/credit-cards', {
        headers: { 'x-user-id': userId }
      });

      return response.data.creditCards.map((card: any) => ({
        id: card.id,
        bankCode: card.bankCode,
        bankName: card.bankName,
        cardNumber: card.cardNumber,
        cardType: card.cardType,
        creditLimit: card.creditLimit,
        availableLimit: card.availableLimit,
        usedLimit: card.usedLimit,
        dueDate: new Date(card.dueDate),
        status: card.status,
        createdAt: new Date(card.createdAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar cartões de crédito:', error);
      throw new Error('Falha ao buscar cartões de crédito');
    }
  }

  async getLoans(userId: string): Promise<Loan[]> {
    try {
      const response = await this.httpClient.get('/loans', {
        headers: { 'x-user-id': userId }
      });

      return response.data.loans.map((loan: any) => ({
        id: loan.id,
        bankCode: loan.bankCode,
        bankName: loan.bankName,
        loanType: loan.loanType,
        principalAmount: loan.principalAmount,
        outstandingAmount: loan.outstandingAmount,
        interestRate: loan.interestRate,
        monthlyPayment: loan.monthlyPayment,
        dueDate: new Date(loan.dueDate),
        status: loan.status,
        createdAt: new Date(loan.createdAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      throw new Error('Falha ao buscar empréstimos');
    }
  }

  async getAccountBalance(userId: string, accountId: string): Promise<number> {
    try {
      const response = await this.httpClient.get(`/accounts/${accountId}/balance`, {
        headers: { 'x-user-id': userId }
      });

      return response.data.balance;
    } catch (error) {
      console.error('Erro ao buscar saldo da conta:', error);
      throw new Error('Falha ao buscar saldo da conta');
    }
  }

  async getAccountStatement(userId: string, accountId: string, fromDate: Date, toDate: Date): Promise<any> {
    try {
      const response = await this.httpClient.get(`/accounts/${accountId}/statement`, {
        headers: { 'x-user-id': userId },
        params: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString()
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar extrato da conta:', error);
      throw new Error('Falha ao buscar extrato da conta');
    }
  }

  async getPaymentHistory(userId: string, fromDate?: Date, toDate?: Date): Promise<Transaction[]> {
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate.toISOString();
      if (toDate) params.toDate = toDate.toISOString();

      const response = await this.httpClient.get('/payments', {
        headers: { 'x-user-id': userId },
        params
      });

      return response.data.payments.map((payment: any) => ({
        id: payment.id,
        accountId: payment.accountId,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        type: payment.type,
        status: payment.status,
        date: new Date(payment.date),
        category: payment.category,
        merchant: payment.merchant,
        reference: payment.reference
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      throw new Error('Falha ao buscar histórico de pagamentos');
    }
  }

  async getCreditScore(userId: string): Promise<any> {
    try {
      const response = await this.httpClient.get('/credit-score', {
        headers: { 'x-user-id': userId }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar score de crédito:', error);
      throw new Error('Falha ao buscar score de crédito');
    }
  }

  async getFinancialSummary(userId: string): Promise<any> {
    try {
      const [accounts, creditCards, loans, transactions] = await Promise.all([
        this.getBankAccounts(userId),
        this.getCreditCards(userId),
        this.getLoans(userId),
        this.getTransactions(userId, '', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      ]);

      const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
      const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
      const totalUsedCredit = creditCards.reduce((sum, card) => sum + card.usedLimit, 0);
      const totalOutstandingLoans = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
      const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);

      return {
        accounts: {
          total: accounts.length,
          totalBalance,
          byBank: this.groupByBank(accounts)
        },
        creditCards: {
          total: creditCards.length,
          totalCreditLimit,
          totalUsedCredit,
          availableCredit: totalCreditLimit - totalUsedCredit,
          utilizationRate: totalCreditLimit > 0 ? (totalUsedCredit / totalCreditLimit) * 100 : 0
        },
        loans: {
          total: loans.length,
          totalOutstanding: totalOutstandingLoans,
          totalMonthlyPayments,
          byType: this.groupByType(loans)
        },
        transactions: {
          total: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          byCategory: this.groupByCategory(transactions),
          byType: this.groupByType(transactions)
        },
        summary: {
          netWorth: totalBalance - totalOutstandingLoans,
          monthlyObligations: totalMonthlyPayments,
          creditUtilization: totalCreditLimit > 0 ? (totalUsedCredit / totalCreditLimit) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Erro ao gerar resumo financeiro:', error);
      throw new Error('Falha ao gerar resumo financeiro');
    }
  }

  async revokeConsent(userId: string, consentId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/consents/${consentId}`, {
        headers: { 'x-user-id': userId }
      });

      // Remover tokens
      this.accessTokens.delete(userId);
      this.refreshTokens.delete(userId);
    } catch (error) {
      console.error('Erro ao revogar consentimento:', error);
      throw new Error('Falha ao revogar consentimento');
    }
  }

  async refreshAccessToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const response = await this.httpClient.post('/auth/refresh', {
        refreshToken
      });

      this.accessTokens.set(userId, response.data.accessToken);
      this.refreshTokens.set(userId, response.data.refreshToken);
    } catch (error) {
      console.error('Erro ao renovar token de acesso:', error);
      throw new Error('Falha ao renovar token de acesso');
    }
  }

  private groupByBank(items: any[]): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};
    items.forEach(item => {
      if (!grouped[item.bankCode]) {
        grouped[item.bankCode] = [];
      }
      grouped[item.bankCode].push(item);
    });
    return grouped;
  }

  private groupByType(items: any[]): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};
    items.forEach(item => {
      const type = item.loanType || item.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });
    return grouped;
  }

  private groupByCategory(transactions: Transaction[]): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};
    transactions.forEach(transaction => {
      const category = transaction.category || 'outros';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(transaction);
    });
    return grouped;
  }

  async validateConsent(userId: string, bankCode: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get(`/consents/validate`, {
        headers: { 'x-user-id': userId },
        params: { bankCode }
      });

      return response.data.valid;
    } catch (error) {
      console.error('Erro ao validar consentimento:', error);
      return false;
    }
  }

  async getSupportedBanks(): Promise<any[]> {
    try {
      const response = await this.httpClient.get('/banks');
      return response.data.banks;
    } catch (error) {
      console.error('Erro ao buscar bancos suportados:', error);
      throw new Error('Falha ao buscar bancos suportados');
    }
  }

  async getBankInfo(bankCode: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/banks/${bankCode}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações do banco:', error);
      throw new Error('Falha ao buscar informações do banco');
    }
  }
}

export const openBankingService = new OpenBankingService({
  clientId: process.env.OPEN_BANKING_CLIENT_ID || '',
  clientSecret: process.env.OPEN_BANKING_CLIENT_SECRET || '',
  redirectUri: process.env.OPEN_BANKING_REDIRECT_URI || '',
  baseUrl: process.env.OPEN_BANKING_BASE_URL || 'https://api.openbanking.com.br',
  sandbox: process.env.NODE_ENV !== 'production'
});