/**
 * Rate Limiter - Sistema de limitação de taxa
 * 
 * Implementa rate limiting para proteger APIs contra abuso
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { Logger } from '../utils/logger';

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  max: number; // Máximo de requisições por janela
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response, options: RateLimitConfig) => void;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export class RateLimiter {
  private redis: Redis;
  private logger: Logger;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig, redisClient: Redis) {
    this.config = config;
    this.redis = redisClient;
    this.logger = new Logger('RateLimiter');
  }

  /**
   * Middleware de rate limiting
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Verificar se deve pular
        if (this.config.skip && this.config.skip(req)) {
          return next();
        }

        // Gerar chave única
        const key = this.getKey(req);
        
        // Verificar limite
        const rateLimitInfo = await this.checkRateLimit(key);
        
        // Adicionar headers
        this.setHeaders(res, rateLimitInfo);
        
        // Verificar se excedeu o limite
        if (rateLimitInfo.current > rateLimitInfo.limit) {
          // Log do limite excedido
          this.logger.warn(`Rate limit exceeded for key: ${key}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
          });

          // Callback personalizado
          if (this.config.onLimitReached) {
            this.config.onLimitReached(req, res, this.config);
          }

          return res.status(429).json({
            error: 'Too Many Requests',
            message: this.config.message,
            retryAfter: rateLimitInfo.retryAfter,
          });
        }

        // Incrementar contador
        await this.incrementCounter(key);
        
        next();
      } catch (error) {
        this.logger.error('Erro no rate limiter:', error);
        // Em caso de erro, permitir a requisição
        next();
      }
    };
  }

  /**
   * Gerar chave única para rate limiting
   */
  private getKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Chave padrão baseada em IP
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `rate_limit:${ip}`;
  }

  /**
   * Verificar limite de taxa
   */
  private async checkRateLimit(key: string): Promise<RateLimitInfo> {
    const window = Math.floor(Date.now() / this.config.windowMs);
    const redisKey = `${key}:${window}`;
    
    // Obter contador atual
    const current = await this.redis.get(redisKey);
    const count = current ? parseInt(current) : 0;
    
    // Calcular tempo de reset
    const resetTime = new Date((window + 1) * this.config.windowMs);
    const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    
    return {
      limit: this.config.max,
      current: count,
      remaining: Math.max(0, this.config.max - count),
      resetTime,
      retryAfter: count >= this.config.max ? retryAfter : undefined,
    };
  }

  /**
   * Incrementar contador
   */
  private async incrementCounter(key: string): Promise<void> {
    const window = Math.floor(Date.now() / this.config.windowMs);
    const redisKey = `${key}:${window}`;
    
    // Incrementar contador
    await this.redis.incr(redisKey);
    
    // Definir expiração
    await this.redis.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
  }

  /**
   * Definir headers de rate limiting
   */
  private setHeaders(res: Response, rateLimitInfo: RateLimitInfo): void {
    if (this.config.standardHeaders) {
      res.set({
        'RateLimit-Limit': rateLimitInfo.limit.toString(),
        'RateLimit-Remaining': rateLimitInfo.remaining.toString(),
        'RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime.getTime() / 1000).toString(),
      });
    }

    if (this.config.legacyHeaders) {
      res.set({
        'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
        'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime.getTime() / 1000).toString(),
      });
    }

    if (rateLimitInfo.retryAfter) {
      res.set('Retry-After', rateLimitInfo.retryAfter.toString());
    }
  }

  /**
   * Obter informações de rate limiting
   */
  async getRateLimitInfo(key: string): Promise<RateLimitInfo> {
    return this.checkRateLimit(key);
  }

  /**
   * Resetar contador para uma chave
   */
  async resetRateLimit(key: string): Promise<void> {
    const window = Math.floor(Date.now() / this.config.windowMs);
    const redisKey = `${key}:${window}`;
    
    await this.redis.del(redisKey);
  }

  /**
   * Verificar se uma chave está bloqueada
   */
  async isBlocked(key: string): Promise<boolean> {
    const rateLimitInfo = await this.checkRateLimit(key);
    return rateLimitInfo.current > rateLimitInfo.limit;
  }
}

/**
 * Rate limiter para autenticação
 */
export class AuthRateLimiter extends RateLimiter {
  constructor(redisClient: Redis) {
    super({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5, // 5 tentativas por 15 minutos
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      standardHeaders: true,
      legacyHeaders: true,
      keyGenerator: (req) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `auth_rate_limit:${ip}`;
      },
      onLimitReached: (req, res, options) => {
        // Log de tentativa de brute force
        console.warn(`Brute force attempt detected from IP: ${req.ip}`);
      },
    }, redisClient);
  }
}

/**
 * Rate limiter para API geral
 */
export class APIRateLimiter extends RateLimiter {
  constructor(redisClient: Redis) {
    super({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // 100 requisições por 15 minutos
      message: 'Muitas requisições. Tente novamente em 15 minutos.',
      standardHeaders: true,
      legacyHeaders: true,
      keyGenerator: (req) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `api_rate_limit:${ip}`;
      },
    }, redisClient);
  }
}

/**
 * Rate limiter para uploads
 */
export class UploadRateLimiter extends RateLimiter {
  constructor(redisClient: Redis) {
    super({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 10, // 10 uploads por hora
      message: 'Limite de uploads excedido. Tente novamente em 1 hora.',
      standardHeaders: true,
      legacyHeaders: true,
      keyGenerator: (req) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return `upload_rate_limit:${ip}`;
      },
    }, redisClient);
  }
}

/**
 * Rate limiter para chat/ElizaOS
 */
export class ChatRateLimiter extends RateLimiter {
  constructor(redisClient: Redis) {
    super({
      windowMs: 60 * 1000, // 1 minuto
      max: 20, // 20 mensagens por minuto
      message: 'Muitas mensagens. Aguarde um momento antes de enviar outra.',
      standardHeaders: true,
      legacyHeaders: true,
      keyGenerator: (req) => {
        const userId = req.user?.id || 'anonymous';
        return `chat_rate_limit:${userId}`;
      },
    }, redisClient);
  }
}

/**
 * Rate limiter para transações
 */
export class TransactionRateLimiter extends RateLimiter {
  constructor(redisClient: Redis) {
    super({
      windowMs: 5 * 60 * 1000, // 5 minutos
      max: 5, // 5 transações por 5 minutos
      message: 'Muitas transações. Aguarde 5 minutos antes de fazer outra.',
      standardHeaders: true,
      legacyHeaders: true,
      keyGenerator: (req) => {
        const userId = req.user?.id || 'anonymous';
        return `transaction_rate_limit:${userId}`;
      },
    }, redisClient);
  }
}

/**
 * Factory para criar rate limiters
 */
export class RateLimiterFactory {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  /**
   * Criar rate limiter para autenticação
   */
  createAuthRateLimiter(): AuthRateLimiter {
    return new AuthRateLimiter(this.redis);
  }

  /**
   * Criar rate limiter para API
   */
  createAPIRateLimiter(): APIRateLimiter {
    return new APIRateLimiter(this.redis);
  }

  /**
   * Criar rate limiter para uploads
   */
  createUploadRateLimiter(): UploadRateLimiter {
    return new UploadRateLimiter(this.redis);
  }

  /**
   * Criar rate limiter para chat
   */
  createChatRateLimiter(): ChatRateLimiter {
    return new ChatRateLimiter(this.redis);
  }

  /**
   * Criar rate limiter para transações
   */
  createTransactionRateLimiter(): TransactionRateLimiter {
    return new TransactionRateLimiter(this.redis);
  }

  /**
   * Criar rate limiter customizado
   */
  createCustomRateLimiter(config: RateLimitConfig): RateLimiter {
    return new RateLimiter(config, this.redis);
  }
}
