import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Config } from '../config';
import { Logger } from '../utils/logger';

export interface BlockchainConfig {
  rpcUrl: string;
  networkId: string;
  chainId: string;
  decimals: number;
  symbol: string;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  success: boolean;
  error?: string;
}

export interface CreditScoreData {
  userId: string;
  score: number;
  calculatedAt: number;
  metadata: Record<string, any>;
}

export interface PaymentData {
  userId: string;
  amount: number;
  currency: string;
  dueDate: number;
  paidDate?: number;
  status: 'pending' | 'paid' | 'late' | 'defaulted';
  proofHash?: string;
}

export class BlockchainAdapter {
  private config: Config;
  private logger: Logger;
  private api: ApiPromise | null = null;
  private keyring: Keyring | null = null;
  private blockchainConfig: BlockchainConfig;

  constructor(config: Config) {
    this.config = config;
    this.logger = new Logger('BlockchainAdapter');
    this.blockchainConfig = {
      rpcUrl: config.get('POLKADOT_RPC_URL', 'ws://localhost:9944'),
      networkId: config.get('POLKADOT_NETWORK_ID', 'credchain'),
      chainId: config.get('POLKADOT_CHAIN_ID', 'credchain-dev'),
      decimals: parseInt(config.get('POLKADOT_DECIMALS', '12')),
      symbol: config.get('POLKADOT_SYMBOL', 'CRED'),
    };
  }

  /**
   * Conecta à blockchain
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando à blockchain...');

      // Conecta à API do Polkadot
      const provider = new WsProvider(this.blockchainConfig.rpcUrl);
      this.api = await ApiPromise.create({ provider });

      // Inicializa keyring
      this.keyring = new Keyring({ type: 'sr25519' });

      // Verifica se a conexão está funcionando
      const chain = await this.api.rpc.system.chain();
      const version = await this.api.rpc.system.version();

      this.logger.info(`✅ Conectado à blockchain: ${chain} (${version})`);
    } catch (error) {
      this.logger.error('❌ Erro ao conectar à blockchain:', error);
      throw error;
    }
  }

  /**
   * Obtém informações da blockchain
   */
  async getBlockchainInfo(): Promise<any> {
    if (!this.api) {
      throw new Error('API não conectada');
    }

    try {
      const chain = await this.api.rpc.system.chain();
      const version = await this.api.rpc.system.version();
      const health = await this.api.rpc.system.health();
      const properties = await this.api.rpc.system.properties();

      return {
        chain,
        version,
        health,
        properties,
        config: this.blockchainConfig,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter informações da blockchain:', error);
      throw error;
    }
  }

  /**
   * Obtém score de crédito da blockchain
   */
  async getCreditScore(userId: string): Promise<CreditScoreData | null> {
    if (!this.api) {
      throw new Error('API não conectada');
    }

    try {
      const score = await this.api.query.creditScore.creditScores(userId);
      if (score.isNone) {
        return null;
      }

      const scoreData = score.unwrap();
      return {
        userId,
        score: scoreData.score.toNumber(),
        calculatedAt: scoreData.calculatedAt.toNumber(),
        metadata: scoreData.metadata.toJSON(),
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao obter score de crédito para ${userId}:`, error);
      return null;
    }
  }

  /**
   * Atualiza score de crédito na blockchain
   */
  async updateCreditScore(
    userId: string,
    score: number,
    metadata: Record<string, any> = {}
  ): Promise<TransactionResult> {
    if (!this.api || !this.keyring) {
      throw new Error('API ou keyring não conectados');
    }

    try {
      // Obtém conta para assinar transação
      const account = this.getAccount();
      if (!account) {
        throw new Error('Conta não configurada para assinar transações');
      }

      // Cria transação
      const tx = this.api.tx.creditScore.updateScore(userId, score, metadata);

      // Assina e envia transação
      const result = await tx.signAndSend(account);
      const hash = result.toHex();

      // Aguarda confirmação
      const blockNumber = await this.waitForTransaction(hash);

      return {
        hash,
        blockNumber,
        success: true,
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao atualizar score de crédito para ${userId}:`, error);
      return {
        hash: '',
        blockNumber: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Registra pagamento na blockchain
   */
  async registerPayment(payment: PaymentData): Promise<TransactionResult> {
    if (!this.api || !this.keyring) {
      throw new Error('API ou keyring não conectados');
    }

    try {
      // Obtém conta para assinar transação
      const account = this.getAccount();
      if (!account) {
        throw new Error('Conta não configurada para assinar transações');
      }

      // Cria transação
      const tx = this.api.tx.paymentRegistry.recordPayment(
        payment.userId,
        payment.amount,
        payment.currency,
        payment.dueDate,
        payment.paidDate || 0,
        payment.status,
        payment.proofHash || ''
      );

      // Assina e envia transação
      const result = await tx.signAndSend(account);
      const hash = result.toHex();

      // Aguarda confirmação
      const blockNumber = await this.waitForTransaction(hash);

      return {
        hash,
        blockNumber,
        success: true,
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao registrar pagamento para ${payment.userId}:`, error);
      return {
        hash: '',
        blockNumber: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtém histórico de pagamentos
   */
  async getPaymentHistory(userId: string, limit: number = 100): Promise<PaymentData[]> {
    if (!this.api) {
      throw new Error('API não conectada');
    }

    try {
      const payments = await this.api.query.paymentRegistry.payments(userId);
      if (payments.isNone) {
        return [];
      }

      const paymentData = payments.unwrap();
      return paymentData.map(payment => ({
        userId: payment.userId.toString(),
        amount: payment.amount.toNumber(),
        currency: payment.currency.toString(),
        dueDate: payment.dueDate.toNumber(),
        paidDate: payment.paidDate.toNumber() || undefined,
        status: payment.status.toString() as PaymentData['status'],
        proofHash: payment.proofHash.toString() || undefined,
      }));
    } catch (error) {
      this.logger.error(`❌ Erro ao obter histórico de pagamentos para ${userId}:`, error);
      return [];
    }
  }

  /**
   * Obtém dados do oracle
   */
  async getOracleData(key: string): Promise<any> {
    if (!this.api) {
      throw new Error('API não conectada');
    }

    try {
      const data = await this.api.query.oracleIntegration.oracleData(key);
      if (data.isNone) {
        return null;
      }

      return JSON.parse(data.unwrap().toString());
    } catch (error) {
      this.logger.error(`❌ Erro ao obter dados do oracle para ${key}:`, error);
      return null;
    }
  }

  /**
   * Atualiza dados do oracle
   */
  async updateOracleData(key: string, value: any): Promise<TransactionResult> {
    if (!this.api || !this.keyring) {
      throw new Error('API ou keyring não conectados');
    }

    try {
      // Obtém conta para assinar transação
      const account = this.getAccount();
      if (!account) {
        throw new Error('Conta não configurada para assinar transações');
      }

      // Cria transação
      const tx = this.api.tx.oracleIntegration.submitData(key, JSON.stringify(value));

      // Assina e envia transação
      const result = await tx.signAndSend(account);
      const hash = result.toHex();

      // Aguarda confirmação
      const blockNumber = await this.waitForTransaction(hash);

      return {
        hash,
        blockNumber,
        success: true,
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao atualizar dados do oracle para ${key}:`, error);
      return {
        hash: '',
        blockNumber: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtém conta para assinar transações
   */
  private getAccount(): KeyringPair | null {
    if (!this.keyring) {
      return null;
    }

    try {
      const mnemonic = this.config.get('POLKADOT_MNEMONIC');
      if (!mnemonic) {
        this.logger.warn('POLKADOT_MNEMONIC não configurado, usando conta de desenvolvimento');
        return this.keyring.addFromUri('//Alice'); // Conta de desenvolvimento
      }

      return this.keyring.addFromMnemonic(mnemonic);
    } catch (error) {
      this.logger.error('❌ Erro ao obter conta:', error);
      return null;
    }
  }

  /**
   * Aguarda confirmação de transação
   */
  private async waitForTransaction(hash: string, timeout: number = 60000): Promise<number> {
    if (!this.api) {
      throw new Error('API não conectada');
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = 1000; // 1 segundo

      const checkTransaction = async () => {
        try {
          const blockHash = await this.api.rpc.chain.getBlockHash();
          const block = await this.api.rpc.chain.getBlock(blockHash);
          const blockNumber = block.block.header.number.toNumber();

          // Verifica se a transação foi incluída no bloco
          const included = block.block.extrinsics.some(extrinsic => 
            extrinsic.hash.toHex() === hash
          );

          if (included) {
            resolve(blockNumber);
            return;
          }

          // Verifica timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout aguardando confirmação da transação'));
            return;
          }

          // Continua verificando
          setTimeout(checkTransaction, checkInterval);
        } catch (error) {
          reject(error);
        }
      };

      checkTransaction();
    });
  }

  /**
   * Obtém saldo de uma conta
   */
  async getBalance(address: string): Promise<number> {
    if (!this.api) {
      throw new Error('API não conectada');
    }

    try {
      const accountInfo = await this.api.query.system.account(address);
      const balance = accountInfo.data.free.toNumber();
      return balance / Math.pow(10, this.blockchainConfig.decimals);
    } catch (error) {
      this.logger.error(`❌ Erro ao obter saldo para ${address}:`, error);
      return 0;
    }
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<any> {
    if (!this.api) {
      return {
        connected: false,
        error: 'API não conectada',
      };
    }

    try {
      const chain = await this.api.rpc.system.chain();
      const health = await this.api.rpc.system.health();
      
      return {
        connected: true,
        chain: chain.toString(),
        health: health.toJSON(),
        config: this.blockchainConfig,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Desconecta da blockchain
   */
  async disconnect(): Promise<void> {
    try {
      if (this.api) {
        await this.api.disconnect();
        this.api = null;
      }

      this.keyring = null;
      this.logger.info('✅ Desconectado da blockchain');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar da blockchain:', error);
      throw error;
    }
  }
}