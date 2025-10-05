import axios from 'axios';

export interface BandConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
}

export interface BandOracleData {
  symbol: string;
  rate: number;
  timestamp: number;
  source: string;
  confidence: number;
}

export interface BandPriceData {
  symbol: string;
  price: number;
  timestamp: number;
  resolveTime: number;
  requestId: string;
}

export class BandOracleService {
  private config: BandConfig;
  private axiosInstance: axios.AxiosInstance;

  constructor(config: BandConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Obtém preços atuais de múltiplos símbolos
   */
  async getCurrentPrices(symbols: string[]): Promise<BandOracleData[]> {
    try {
      const response = await this.axiosInstance.post('/oracle/v1/price', {
        symbols: symbols,
        minCount: 3,
        askCount: 10
      });

      const prices: BandOracleData[] = [];
      
      for (const symbol of symbols) {
        const priceData = response.data.data[symbol];
        if (priceData) {
          prices.push({
            symbol: symbol,
            rate: priceData.rate,
            timestamp: priceData.timestamp,
            source: 'band',
            confidence: this.calculateConfidence(priceData)
          });
        }
      }

      return prices;
    } catch (error) {
      console.error('Erro ao obter preços do Band:', error);
      return [];
    }
  }

  /**
   * Obtém preço de um símbolo específico
   */
  async getPrice(symbol: string): Promise<BandOracleData | null> {
    try {
      const prices = await this.getCurrentPrices([symbol]);
      return prices.length > 0 ? prices[0] : null;
    } catch (error) {
      console.error('Erro ao obter preço do Band:', error);
      return null;
    }
  }

  /**
   * Obtém dados históricos de preços
   */
  async getHistoricalPrices(
    symbol: string, 
    fromTimestamp: number, 
    toTimestamp: number
  ): Promise<BandOracleData[]> {
    try {
      const response = await this.axiosInstance.get('/oracle/v1/price/history', {
        params: {
          symbol: symbol,
          from: fromTimestamp,
          to: toTimestamp,
          interval: '1h'
        }
      });

      const prices: BandOracleData[] = [];
      
      for (const dataPoint of response.data.data) {
        prices.push({
          symbol: symbol,
          rate: dataPoint.rate,
          timestamp: dataPoint.timestamp,
          source: 'band',
          confidence: this.calculateConfidence(dataPoint)
        });
      }

      return prices.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Erro ao obter preços históricos do Band:', error);
      return [];
    }
  }

  /**
   * Obtém informações de um símbolo
   */
  async getSymbolInfo(symbol: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/oracle/v1/symbols/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter informações do símbolo:', error);
      return null;
    }
  }

  /**
   * Lista símbolos disponíveis
   */
  async getAvailableSymbols(): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get('/oracle/v1/symbols');
      return response.data.symbols || [];
    } catch (error) {
      console.error('Erro ao obter símbolos disponíveis:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de um símbolo
   */
  async getSymbolStats(symbol: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/oracle/v1/symbols/${symbol}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas do símbolo:', error);
      return null;
    }
  }

  /**
   * Verifica se um símbolo está ativo
   */
  async isSymbolActive(symbol: string): Promise<boolean> {
    try {
      const price = await this.getPrice(symbol);
      if (!price) return false;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = currentTime - price.timestamp;
      
      // Considera ativo se foi atualizado nos últimos 24 horas
      return timeDiff < 86400;
    } catch (error) {
      console.error('Erro ao verificar status do símbolo:', error);
      return false;
    }
  }

  /**
   * Obtém dados de múltiplas fontes para um símbolo
   */
  async getMultiSourceData(symbol: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/oracle/v1/symbols/${symbol}/sources`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados de múltiplas fontes:', error);
      return null;
    }
  }

  /**
   * Calcula confiança baseada nos dados
   */
  private calculateConfidence(data: any): number {
    try {
      // Fatores que afetam a confiança:
      // 1. Número de fontes
      // 2. Tempo desde a última atualização
      // 3. Consistência entre fontes
      
      let confidence = 0.5; // Base
      
      // Número de fontes
      if (data.sources && data.sources.length > 0) {
        confidence += Math.min(data.sources.length * 0.1, 0.3);
      }
      
      // Tempo desde a última atualização
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDiff = currentTime - data.timestamp;
      if (timeDiff < 3600) { // Menos de 1 hora
        confidence += 0.2;
      } else if (timeDiff < 86400) { // Menos de 24 horas
        confidence += 0.1;
      }
      
      // Consistência entre fontes
      if (data.consistency && data.consistency > 0.9) {
        confidence += 0.2;
      }
      
      return Math.min(confidence, 1.0);
    } catch (error) {
      console.error('Erro ao calcular confiança:', error);
      return 0.5;
    }
  }

  /**
   * Obtém dados de câmbio para moedas
   */
  async getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<BandOracleData[]> {
    try {
      const symbols = targetCurrencies.map(currency => `${baseCurrency}/${currency}`);
      return await this.getCurrentPrices(symbols);
    } catch (error) {
      console.error('Erro ao obter taxas de câmbio:', error);
      return [];
    }
  }

  /**
   * Obtém dados de commodities
   */
  async getCommodityPrices(commodities: string[]): Promise<BandOracleData[]> {
    try {
      return await this.getCurrentPrices(commodities);
    } catch (error) {
      console.error('Erro ao obter preços de commodities:', error);
      return [];
    }
  }

  /**
   * Obtém dados de criptomoedas
   */
  async getCryptoPrices(cryptos: string[]): Promise<BandOracleData[]> {
    try {
      return await this.getCurrentPrices(cryptos);
    } catch (error) {
      console.error('Erro ao obter preços de criptomoedas:', error);
      return [];
    }
  }

  /**
   * Obtém dados de ações
   */
  async getStockPrices(stocks: string[]): Promise<BandOracleData[]> {
    try {
      return await this.getCurrentPrices(stocks);
    } catch (error) {
      console.error('Erro ao obter preços de ações:', error);
      return [];
    }
  }

  /**
   * Monitora mudanças de preço
   */
  async monitorPriceChanges(
    symbol: string, 
    threshold: number, 
    callback: (data: BandOracleData) => void
  ): Promise<void> {
    try {
      let lastPrice = 0;
      
      const checkPrice = async () => {
        const priceData = await this.getPrice(symbol);
        if (priceData && priceData.rate !== lastPrice) {
          const change = Math.abs(priceData.rate - lastPrice) / lastPrice;
          if (change >= threshold) {
            callback(priceData);
          }
          lastPrice = priceData.rate;
        }
      };
      
      // Verificar a cada 5 minutos
      setInterval(checkPrice, 300000);
    } catch (error) {
      console.error('Erro ao monitorar mudanças de preço:', error);
    }
  }
}

export const bandOracleService = new BandOracleService({
  apiUrl: process.env.BAND_API_URL || 'https://api.bandprotocol.com',
  apiKey: process.env.BAND_API_KEY || '',
  timeout: 30000
});
