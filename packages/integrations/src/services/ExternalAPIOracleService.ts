import axios from 'axios';

export interface ExternalAPIConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
}

export interface ExternalAPIData {
  source: string;
  data: any;
  timestamp: number;
  confidence: number;
  metadata: any;
}

export interface APISource {
  name: string;
  url: string;
  headers: Record<string, string>;
  parser: (response: any) => any;
  weight: number;
}

export class ExternalAPIOracleService {
  private config: ExternalAPIConfig;
  private sources: APISource[];
  private axiosInstance: axios.AxiosInstance;

  constructor(config: ExternalAPIConfig) {
    this.config = config;
    this.sources = [];
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Adiciona uma fonte de dados
   */
  addSource(source: APISource): void {
    this.sources.push(source);
  }

  /**
   * Obtém dados de uma fonte específica
   */
  async getDataFromSource(sourceName: string): Promise<ExternalAPIData | null> {
    try {
      const source = this.sources.find(s => s.name === sourceName);
      if (!source) {
        throw new Error(`Fonte não encontrada: ${sourceName}`);
      }

      const response = await this.axiosInstance.get(source.url, {
        headers: source.headers
      });

      const parsedData = source.parser(response.data);
      
      return {
        source: sourceName,
        data: parsedData,
        timestamp: Date.now(),
        confidence: this.calculateConfidence(source, response),
        metadata: {
          status: response.status,
          headers: response.headers,
          source: source
        }
      };
    } catch (error) {
      console.error(`Erro ao obter dados da fonte ${sourceName}:`, error);
      return null;
    }
  }

  /**
   * Obtém dados de múltiplas fontes
   */
  async getDataFromMultipleSources(sourceNames: string[]): Promise<ExternalAPIData[]> {
    try {
      const promises = sourceNames.map(name => this.getDataFromSource(name));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<ExternalAPIData>).value);
    } catch (error) {
      console.error('Erro ao obter dados de múltiplas fontes:', error);
      return [];
    }
  }

  /**
   * Obtém dados agregados de todas as fontes
   */
  async getAggregatedData(): Promise<ExternalAPIData[]> {
    try {
      const sourceNames = this.sources.map(s => s.name);
      return await this.getDataFromMultipleSources(sourceNames);
    } catch (error) {
      console.error('Erro ao obter dados agregados:', error);
      return [];
    }
  }

  /**
   * Obtém dados com fallback
   */
  async getDataWithFallback(primarySource: string, fallbackSources: string[]): Promise<ExternalAPIData | null> {
    try {
      // Tentar fonte primária
      const primaryData = await this.getDataFromSource(primarySource);
      if (primaryData) {
        return primaryData;
      }

      // Tentar fontes de fallback
      for (const fallbackSource of fallbackSources) {
        const fallbackData = await this.getDataFromSource(fallbackSource);
        if (fallbackData) {
          return fallbackData;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter dados com fallback:', error);
      return null;
    }
  }

  /**
   * Obtém dados de preços de câmbio
   */
  async getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExternalAPIData[]> {
    try {
      const exchangeRates: ExternalAPIData[] = [];
      
      for (const currency of targetCurrencies) {
        const rate = await this.getExchangeRate(baseCurrency, currency);
        if (rate) {
          exchangeRates.push(rate);
        }
      }
      
      return exchangeRates;
    } catch (error) {
      console.error('Erro ao obter taxas de câmbio:', error);
      return [];
    }
  }

  /**
   * Obtém taxa de câmbio específica
   */
  async getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<ExternalAPIData | null> {
    try {
      // Tentar múltiplas fontes
      const sources = [
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
        `https://api.fixer.io/latest?access_key=${process.env.FIXER_API_KEY}&base=${baseCurrency}&symbols=${targetCurrency}`,
        `https://api.currencylayer.com/live?access_key=${process.env.CURRENCYLAYER_API_KEY}&currencies=${targetCurrency}&source=${baseCurrency}`
      ];

      for (const sourceUrl of sources) {
        try {
          const response = await this.axiosInstance.get(sourceUrl);
          const rate = this.parseExchangeRate(response.data, targetCurrency);
          
          if (rate) {
            return {
              source: 'external_api',
              data: {
                base: baseCurrency,
                target: targetCurrency,
                rate: rate,
                timestamp: Date.now()
              },
              timestamp: Date.now(),
              confidence: 0.9,
              metadata: {
                url: sourceUrl,
                status: response.status
              }
            };
          }
        } catch (error) {
          console.error(`Erro ao obter taxa de câmbio de ${sourceUrl}:`, error);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter taxa de câmbio:', error);
      return null;
    }
  }

  /**
   * Obtém dados de preços de commodities
   */
  async getCommodityPrices(commodities: string[]): Promise<ExternalAPIData[]> {
    try {
      const prices: ExternalAPIData[] = [];
      
      for (const commodity of commodities) {
        const price = await this.getCommodityPrice(commodity);
        if (price) {
          prices.push(price);
        }
      }
      
      return prices;
    } catch (error) {
      console.error('Erro ao obter preços de commodities:', error);
      return [];
    }
  }

  /**
   * Obtém preço de commodity específica
   */
  async getCommodityPrice(commodity: string): Promise<ExternalAPIData | null> {
    try {
      // Simular obtenção de preço de commodity
      const mockPrice = Math.random() * 1000 + 100;
      
      return {
        source: 'external_api',
        data: {
          commodity: commodity,
          price: mockPrice,
          currency: 'USD',
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        confidence: 0.85,
        metadata: {
          source: 'mock_api',
          type: 'commodity'
        }
      };
    } catch (error) {
      console.error('Erro ao obter preço de commodity:', error);
      return null;
    }
  }

  /**
   * Obtém dados de preços de criptomoedas
   */
  async getCryptoPrices(cryptos: string[]): Promise<ExternalAPIData[]> {
    try {
      const prices: ExternalAPIData[] = [];
      
      for (const crypto of cryptos) {
        const price = await this.getCryptoPrice(crypto);
        if (price) {
          prices.push(price);
        }
      }
      
      return prices;
    } catch (error) {
      console.error('Erro ao obter preços de criptomoedas:', error);
      return [];
    }
  }

  /**
   * Obtém preço de criptomoeda específica
   */
  async getCryptoPrice(crypto: string): Promise<ExternalAPIData | null> {
    try {
      // Simular obtenção de preço de criptomoeda
      const mockPrice = Math.random() * 50000 + 1000;
      
      return {
        source: 'external_api',
        data: {
          crypto: crypto,
          price: mockPrice,
          currency: 'USD',
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        confidence: 0.9,
        metadata: {
          source: 'mock_api',
          type: 'crypto'
        }
      };
    } catch (error) {
      console.error('Erro ao obter preço de criptomoeda:', error);
      return null;
    }
  }

  /**
   * Obtém dados de preços de ações
   */
  async getStockPrices(stocks: string[]): Promise<ExternalAPIData[]> {
    try {
      const prices: ExternalAPIData[] = [];
      
      for (const stock of stocks) {
        const price = await this.getStockPrice(stock);
        if (price) {
          prices.push(price);
        }
      }
      
      return prices;
    } catch (error) {
      console.error('Erro ao obter preços de ações:', error);
      return [];
    }
  }

  /**
   * Obtém preço de ação específica
   */
  async getStockPrice(stock: string): Promise<ExternalAPIData | null> {
    try {
      // Simular obtenção de preço de ação
      const mockPrice = Math.random() * 200 + 10;
      
      return {
        source: 'external_api',
        data: {
          stock: stock,
          price: mockPrice,
          currency: 'USD',
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        confidence: 0.88,
        metadata: {
          source: 'mock_api',
          type: 'stock'
        }
      };
    } catch (error) {
      console.error('Erro ao obter preço de ação:', error);
      return null;
    }
  }

  /**
   * Calcula confiança baseada na fonte e resposta
   */
  private calculateConfidence(source: APISource, response: any): number {
    try {
      let confidence = 0.5; // Base
      
      // Peso da fonte
      confidence += source.weight * 0.3;
      
      // Status da resposta
      if (response.status === 200) {
        confidence += 0.2;
      }
      
      // Tempo de resposta
      const responseTime = response.headers['x-response-time'];
      if (responseTime && parseInt(responseTime) < 1000) {
        confidence += 0.1;
      }
      
      return Math.min(confidence, 1.0);
    } catch (error) {
      console.error('Erro ao calcular confiança:', error);
      return 0.5;
    }
  }

  /**
   * Analisa taxa de câmbio da resposta
   */
  private parseExchangeRate(data: any, targetCurrency: string): number | null {
    try {
      // Tentar diferentes formatos de resposta
      if (data.rates && data.rates[targetCurrency]) {
        return data.rates[targetCurrency];
      }
      
      if (data.quotes && data.quotes[`USD${targetCurrency}`]) {
        return data.quotes[`USD${targetCurrency}`];
      }
      
      if (data[targetCurrency]) {
        return data[targetCurrency];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao analisar taxa de câmbio:', error);
      return null;
    }
  }

  /**
   * Monitora mudanças de dados
   */
  async monitorDataChanges(
    sourceName: string,
    interval: number,
    callback: (data: ExternalAPIData) => void
  ): Promise<void> {
    try {
      const monitor = async () => {
        const data = await this.getDataFromSource(sourceName);
        if (data) {
          callback(data);
        }
      };
      
      // Executar imediatamente
      await monitor();
      
      // Configurar intervalo
      setInterval(monitor, interval);
    } catch (error) {
      console.error('Erro ao monitorar mudanças de dados:', error);
    }
  }

  /**
   * Obtém status das fontes
   */
  async getSourcesStatus(): Promise<any[]> {
    try {
      const statuses = [];
      
      for (const source of this.sources) {
        try {
          const startTime = Date.now();
          const response = await this.axiosInstance.get(source.url, {
            headers: source.headers,
            timeout: 5000
          });
          const responseTime = Date.now() - startTime;
          
          statuses.push({
            name: source.name,
            status: 'active',
            responseTime: responseTime,
            lastCheck: Date.now()
          });
        } catch (error) {
          statuses.push({
            name: source.name,
            status: 'inactive',
            error: error.message,
            lastCheck: Date.now()
          });
        }
      }
      
      return statuses;
    } catch (error) {
      console.error('Erro ao obter status das fontes:', error);
      return [];
    }
  }
}

export const externalAPIOracleService = new ExternalAPIOracleService({
  baseUrl: process.env.EXTERNAL_API_BASE_URL || 'https://api.example.com',
  apiKey: process.env.EXTERNAL_API_KEY || '',
  timeout: 30000,
  retries: 3
});
