import { Redis } from 'redis';
import { Config } from '../config';
import { Logger } from '../utils/logger';
import axios from 'axios';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  properties: Record<string, any>;
  metadata?: {
    source: string;
    version: string;
    environment: string;
  };
}

export interface UserBehavior {
  userId: string;
  patterns: {
    loginFrequency: number;
    transactionPatterns: any[];
    riskScore: number;
    preferences: Record<string, any>;
  };
  lastUpdated: number;
}

export interface AnalyticsQuery {
  eventName?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AnalyticsAdapter {
  private config: Config;
  private logger: Logger;
  private redis: Redis | null = null;
  private eventBuffer: AnalyticsEvent[] = [];
  private bufferSize: number = 100;
  private flushInterval: number = 30000; // 30 segundos
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Config) {
    this.config = config;
    this.logger = new Logger('AnalyticsAdapter');
  }

  /**
   * Conecta ao serviço de analytics
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando ao serviço de analytics...');

      // Conecta ao Redis para cache e filas
      this.redis = new Redis({
        url: this.config.get('REDIS_URL'),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });

      // Inicia processamento de eventos em lote
      this.startEventProcessing();

      this.logger.info('✅ Serviço de analytics conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao serviço de analytics:', error);
      throw error;
    }
  }

  /**
   * Inicia processamento de eventos em lote
   */
  private startEventProcessing(): void {
    this.flushTimer = setInterval(async () => {
      await this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Registra evento de analytics
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        timestamp: Date.now(),
        metadata: {
          source: 'eliza-runtime',
          version: this.config.get('VERSION', '1.0.0'),
          environment: this.config.get('NODE_ENV', 'development'),
        },
      };

      // Adiciona ao buffer
      this.eventBuffer.push(fullEvent);

      // Se buffer estiver cheio, processa imediatamente
      if (this.eventBuffer.length >= this.bufferSize) {
        await this.flushEvents();
      }

      this.logger.debug(`Evento ${event.eventName} adicionado ao buffer`);
    } catch (error) {
      this.logger.error('❌ Erro ao registrar evento:', error);
    }
  }

  /**
   * Processa eventos em lote
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    try {
      const events = [...this.eventBuffer];
      this.eventBuffer = [];

      // Envia para serviço de analytics
      await this.sendEventsToService(events);

      // Armazena no Redis para cache
      if (this.redis) {
        for (const event of events) {
          await this.redis.lpush('analytics:events', JSON.stringify(event));
        }
      }

      this.logger.info(`✅ ${events.length} eventos processados`);
    } catch (error) {
      this.logger.error('❌ Erro ao processar eventos:', error);
      // Recoloca eventos no buffer em caso de erro
      this.eventBuffer.unshift(...this.eventBuffer);
    }
  }

  /**
   * Envia eventos para serviço de analytics
   */
  private async sendEventsToService(events: AnalyticsEvent[]): Promise<void> {
    try {
      const analyticsService = this.config.get('ANALYTICS_SERVICE_URL');
      if (!analyticsService) {
        this.logger.warn('ANALYTICS_SERVICE_URL não configurado, armazenando apenas no Redis');
        return;
      }

      await axios.post(`${analyticsService}/events/batch`, {
        events,
        timestamp: Date.now(),
      });

      this.logger.info(`✅ ${events.length} eventos enviados para serviço de analytics`);
    } catch (error) {
      this.logger.error('❌ Erro ao enviar eventos para serviço de analytics:', error);
      throw error;
    }
  }

  /**
   * Obtém eventos de analytics
   */
  async getEvents(query: AnalyticsQuery = {}): Promise<AnalyticsEvent[]> {
    try {
      const analyticsService = this.config.get('ANALYTICS_SERVICE_URL');
      if (!analyticsService) {
        // Fallback para Redis
        return await this.getEventsFromRedis(query);
      }

      const response = await axios.get(`${analyticsService}/events`, {
        params: {
          eventName: query.eventName,
          userId: query.userId,
          startDate: query.startDate?.toISOString(),
          endDate: query.endDate?.toISOString(),
          limit: query.limit || 100,
          offset: query.offset || 0,
        },
      });

      return response.data.events || [];
    } catch (error) {
      this.logger.error('❌ Erro ao obter eventos:', error);
      return await this.getEventsFromRedis(query);
    }
  }

  /**
   * Obtém eventos do Redis (fallback)
   */
  private async getEventsFromRedis(query: AnalyticsQuery): Promise<AnalyticsEvent[]> {
    if (!this.redis) {
      return [];
    }

    try {
      const events = await this.redis.lrange('analytics:events', 0, -1);
      let filteredEvents = events.map(event => JSON.parse(event));

      // Aplica filtros
      if (query.eventName) {
        filteredEvents = filteredEvents.filter(event => event.eventName === query.eventName);
      }
      if (query.userId) {
        filteredEvents = filteredEvents.filter(event => event.userId === query.userId);
      }
      if (query.startDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp >= query.startDate.getTime());
      }
      if (query.endDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp <= query.endDate.getTime());
      }

      // Aplica paginação
      const offset = query.offset || 0;
      const limit = query.limit || 100;
      return filteredEvents.slice(offset, offset + limit);
    } catch (error) {
      this.logger.error('❌ Erro ao obter eventos do Redis:', error);
      return [];
    }
  }

  /**
   * Obtém padrões de comportamento do usuário
   */
  async getUserBehavior(userId: string): Promise<UserBehavior | null> {
    try {
      const analyticsService = this.config.get('ANALYTICS_SERVICE_URL');
      if (!analyticsService) {
        return await this.getUserBehaviorFromRedis(userId);
      }

      const response = await axios.get(`${analyticsService}/users/${userId}/behavior`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Erro ao obter comportamento do usuário ${userId}:`, error);
      return await this.getUserBehaviorFromRedis(userId);
    }
  }

  /**
   * Obtém comportamento do usuário do Redis (fallback)
   */
  private async getUserBehaviorFromRedis(userId: string): Promise<UserBehavior | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const behaviorData = await this.redis.get(`analytics:behavior:${userId}`);
      if (behaviorData) {
        return JSON.parse(behaviorData);
      }
      return null;
    } catch (error) {
      this.logger.error('❌ Erro ao obter comportamento do usuário do Redis:', error);
      return null;
    }
  }

  /**
   * Atualiza padrões de comportamento do usuário
   */
  async updateUserBehavior(userId: string, behavior: UserBehavior): Promise<void> {
    try {
      const analyticsService = this.config.get('ANALYTICS_SERVICE_URL');
      if (!analyticsService) {
        // Fallback para Redis
        if (this.redis) {
          await this.redis.setex(`analytics:behavior:${userId}`, 86400, JSON.stringify(behavior)); // 24 horas
        }
        return;
      }

      await axios.put(`${analyticsService}/users/${userId}/behavior`, behavior);
      this.logger.info(`✅ Comportamento do usuário ${userId} atualizado`);
    } catch (error) {
      this.logger.error(`❌ Erro ao atualizar comportamento do usuário ${userId}:`, error);
    }
  }

  /**
   * Obtém métricas de analytics
   */
  async getMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      const analyticsService = this.config.get('ANALYTICS_SERVICE_URL');
      if (!analyticsService) {
        return await this.getMetricsFromRedis(timeRange);
      }

      const response = await axios.get(`${analyticsService}/metrics`, {
        params: { timeRange },
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Erro ao obter métricas:', error);
      return await this.getMetricsFromRedis(timeRange);
    }
  }

  /**
   * Obtém métricas do Redis (fallback)
   */
  private async getMetricsFromRedis(timeRange: string): Promise<any> {
    if (!this.redis) {
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        topEvents: [],
      };
    }

    try {
      const events = await this.redis.lrange('analytics:events', 0, -1);
      const parsedEvents = events.map(event => JSON.parse(event));

      // Calcula métricas básicas
      const totalEvents = parsedEvents.length;
      const uniqueUsers = new Set(parsedEvents.map(event => event.userId)).size;
      const eventCounts = parsedEvents.reduce((acc, event) => {
        acc[event.eventName] = (acc[event.eventName] || 0) + 1;
        return acc;
      }, {});

      const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([eventName, count]) => ({ eventName, count }));

      return {
        totalEvents,
        uniqueUsers,
        topEvents,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter métricas do Redis:', error);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        topEvents: [],
      };
    }
  }

  /**
   * Obtém estatísticas de eventos
   */
  async getEventStats(): Promise<any> {
    try {
      if (!this.redis) {
        return {
          bufferSize: this.eventBuffer.length,
          totalProcessed: 0,
        };
      }

      const bufferSize = this.eventBuffer.length;
      const totalProcessed = await this.redis.get('analytics:total_processed') || '0';

      return {
        bufferSize,
        totalProcessed: parseInt(totalProcessed),
        flushInterval: this.flushInterval,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter estatísticas de eventos:', error);
      return {
        bufferSize: this.eventBuffer.length,
        totalProcessed: 0,
      };
    }
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<any> {
    if (!this.redis) {
      return {
        connected: false,
        error: 'Redis não conectado',
      };
    }

    try {
      await this.redis.ping();
      return {
        connected: true,
        stats: await this.getEventStats(),
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Desconecta do serviço de analytics
   */
  async disconnect(): Promise<void> {
    try {
      // Processa eventos restantes
      await this.flushEvents();

      // Para timer de processamento
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }

      // Desconecta do Redis
      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
      }

      this.logger.info('✅ Desconectado do serviço de analytics');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar do serviço de analytics:', error);
      throw error;
    }
  }
}
