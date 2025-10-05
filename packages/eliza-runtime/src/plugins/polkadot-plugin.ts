import { Plugin, IAgentRuntime, Memory, State } from '@elizaos/core';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';

export interface PolkadotPluginConfig {
  rpcUrl: string;
  network: 'polkadot' | 'kusama' | 'rococo' | 'local';
  accountSeed?: string;
}

export class PolkadotPlugin implements Plugin {
  name = 'polkadotPlugin';
  version = '1.0.0';
  description = 'Plugin para integração com Polkadot/Substrate';
  
  private api: ApiPromise | null = null;
  private keyring: Keyring | null = null;
  private config: PolkadotPluginConfig;

  constructor(config: PolkadotPluginConfig) {
    this.config = config;
  }

  async initialize(runtime: IAgentRuntime): Promise<void> {
    try {
      const provider = new WsProvider(this.config.rpcUrl);
      this.api = await ApiPromise.create({ provider });
      
      if (this.config.accountSeed) {
        this.keyring = new Keyring({ type: 'sr25519' });
        this.keyring.addFromUri(this.config.accountSeed);
      }

      console.log(`🔗 Polkadot Plugin conectado à rede: ${this.config.network}`);
    } catch (error) {
      console.error('❌ Erro ao conectar com Polkadot:', error);
      throw error;
    }
  }

  async getCreditScore(userId: string): Promise<any> {
    if (!this.api) throw new Error('API não inicializada');
    
    try {
      const result = await this.api.query.palletCreditScore.creditScores(userId);
      return result.toHuman();
    } catch (error) {
      console.error('Erro ao buscar score:', error);
      return null;
    }
  }

  async registerCreditScore(userId: string, score: number, factors: any): Promise<string> {
    if (!this.api || !this.keyring) throw new Error('API ou keyring não inicializada');
    
    try {
      const tx = this.api.tx.palletCreditScore.updateCreditScore(userId, score, factors);
      const hash = await tx.signAndSend(this.keyring.getPair(0));
      return hash.toString();
    } catch (error) {
      console.error('Erro ao registrar score:', error);
      throw error;
    }
  }

  async getPaymentHistory(userId: string): Promise<any[]> {
    if (!this.api) throw new Error('API não inicializada');
    
    try {
      const result = await this.api.query.palletPaymentRegistry.payments(userId);
      return result.toHuman() as any[];
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      return [];
    }
  }

  async registerPayment(userId: string, amount: number, currency: string, description: string): Promise<string> {
    if (!this.api || !this.keyring) throw new Error('API ou keyring não inicializada');
    
    try {
      const tx = this.api.tx.palletPaymentRegistry.registerPayment(userId, amount, currency, description);
      const hash = await tx.signAndSend(this.keyring.getPair(0));
      return hash.toString();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  }

  async verifyIdentity(userId: string, identityData: any): Promise<boolean> {
    if (!this.api || !this.keyring) throw new Error('API ou keyring não inicializada');
    
    try {
      const tx = this.api.tx.palletIdentityVerification.verifyIdentity(userId, JSON.stringify(identityData));
      await tx.signAndSend(this.keyring.getPair(0));
      return true;
    } catch (error) {
      console.error('Erro ao verificar identidade:', error);
      return false;
    }
  }

  async getOracleData(dataType: string): Promise<any> {
    if (!this.api) throw new Error('API não inicializada');
    
    try {
      const result = await this.api.query.palletOracleIntegration.externalData(dataType);
      return result.toHuman();
    } catch (error) {
      console.error('Erro ao buscar dados do oráculo:', error);
      return null;
    }
  }

  async updateOracleData(dataType: string, data: any): Promise<string> {
    if (!this.api || !this.keyring) throw new Error('API ou keyring não inicializada');
    
    try {
      const tx = this.api.tx.palletOracleIntegration.updateExternalData(dataType, JSON.stringify(data), Date.now());
      const hash = await tx.signAndSend(this.keyring.getPair(0));
      return hash.toString();
    } catch (error) {
      console.error('Erro ao atualizar dados do oráculo:', error);
      throw error;
    }
  }

  async getBlockchainInfo(): Promise<any> {
    if (!this.api) throw new Error('API não inicializada');
    
    try {
      const [chain, nodeName, nodeVersion, blockNumber] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.name(),
        this.api.rpc.system.version(),
        this.api.rpc.chain.getBlockNumber()
      ]);

      return {
        chain: chain.toString(),
        nodeName: nodeName.toString(),
        nodeVersion: nodeVersion.toString(),
        blockNumber: blockNumber.toString()
      };
    } catch (error) {
      console.error('Erro ao buscar informações da blockchain:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }
}

export const polkadotPlugin = new PolkadotPlugin({
  rpcUrl: process.env.POLKADOT_RPC_URL || 'ws://localhost:9944',
  network: (process.env.POLKADOT_NETWORK as any) || 'local',
  accountSeed: process.env.POLKADOT_ACCOUNT_SEED
});
