import axios from 'axios';
import { ethers } from 'ethers';

export interface ChainlinkConfig {
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  gasLimit: number;
  gasPrice: number;
}

export interface OracleData {
  price: number;
  timestamp: number;
  source: string;
  confidence: number;
}

export interface PriceFeed {
  pair: string;
  price: number;
  timestamp: number;
  decimals: number;
}

export class ChainlinkOracleService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private config: ChainlinkConfig;

  constructor(config: ChainlinkConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    // ABI do contrato Chainlink
    const abi = [
      "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      "function decimals() external view returns (uint8)",
      "function description() external view returns (string)",
      "function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
    ];
    
    this.contract = new ethers.Contract(config.contractAddress, abi, this.wallet);
  }

  /**
   * Obtém preço atual de um par de moedas
   */
  async getCurrentPrice(pair: string): Promise<OracleData | null> {
    try {
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await this.contract.latestRoundData();
      const decimals = await this.contract.decimals();
      
      const price = parseFloat(ethers.utils.formatUnits(answer, decimals));
      const timestamp = parseInt(updatedAt.toString()) * 1000;
      
      return {
        price,
        timestamp,
        source: 'chainlink',
        confidence: 0.95
      };
    } catch (error) {
      console.error('Erro ao obter preço do Chainlink:', error);
      return null;
    }
  }

  /**
   * Obtém dados históricos de preços
   */
  async getHistoricalPrices(pair: string, fromTimestamp: number, toTimestamp: number): Promise<OracleData[]> {
    try {
      const prices: OracleData[] = [];
      let roundId = 1;
      
      while (true) {
        try {
          const [id, answer, startedAt, updatedAt, answeredInRound] = await this.contract.getRoundData(roundId);
          const decimals = await this.contract.decimals();
          
          const price = parseFloat(ethers.utils.formatUnits(answer, decimals));
          const timestamp = parseInt(updatedAt.toString()) * 1000;
          
          if (timestamp >= fromTimestamp && timestamp <= toTimestamp) {
            prices.push({
              price,
              timestamp,
              source: 'chainlink',
              confidence: 0.95
            });
          }
          
          if (timestamp > toTimestamp) break;
          
          roundId++;
        } catch (error) {
          break;
        }
      }
      
      return prices.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Erro ao obter preços históricos:', error);
      return [];
    }
  }

  /**
   * Obtém descrição do feed de preços
   */
  async getPriceFeedDescription(): Promise<string> {
    try {
      return await this.contract.description();
    } catch (error) {
      console.error('Erro ao obter descrição do feed:', error);
      return '';
    }
  }

  /**
   * Verifica se o feed está ativo
   */
  async isPriceFeedActive(): Promise<boolean> {
    try {
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await this.contract.latestRoundData();
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = currentTime - parseInt(updatedAt.toString());
      
      // Considera ativo se foi atualizado nos últimos 24 horas
      return timeDiff < 86400;
    } catch (error) {
      console.error('Erro ao verificar status do feed:', error);
      return false;
    }
  }

  /**
   * Obtém informações do round atual
   */
  async getCurrentRoundInfo(): Promise<any> {
    try {
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await this.contract.latestRoundData();
      const decimals = await this.contract.decimals();
      
      return {
        roundId: roundId.toString(),
        answer: answer.toString(),
        startedAt: parseInt(startedAt.toString()),
        updatedAt: parseInt(updatedAt.toString()),
        answeredInRound: answeredInRound.toString(),
        decimals: decimals,
        isActive: await this.isPriceFeedActive()
      };
    } catch (error) {
      console.error('Erro ao obter informações do round:', error);
      return null;
    }
  }
}

export const chainlinkOracleService = new ChainlinkOracleService({
  rpcUrl: process.env.CHAINLINK_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  contractAddress: process.env.CHAINLINK_CONTRACT_ADDRESS || '',
  privateKey: process.env.CHAINLINK_PRIVATE_KEY || '',
  gasLimit: 100000,
  gasPrice: 20000000000 // 20 gwei
});
