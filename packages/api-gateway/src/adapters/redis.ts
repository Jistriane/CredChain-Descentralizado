/**
 * Redis Adapter
 * 
 * Gerencia conexão e operações com Redis
 */

import { createClient, RedisClientType } from "redis";
import { Config } from "../config";
import { Logger } from "../utils/logger";

export class RedisAdapter {
    private config: Config;
    private logger: Logger;
    private client: RedisClientType | null = null;

    constructor(config: Config) {
        this.config = config;
        this.logger = new Logger("RedisAdapter");
    }

    /**
     * Conecta ao Redis
     */
    async connect(): Promise<void> {
        try {
            const redisConfig = this.config.getDatabaseConfig().redis;
            
            this.client = createClient({
                url: redisConfig.url,
                socket: {
                    connectTimeout: 5000,
                    lazyConnect: true
                }
            });

            this.client.on("error", (error) => {
                this.logger.error("Redis error:", error);
            });

            this.client.on("connect", () => {
                this.logger.info("✅ Redis conectado");
            });

            this.client.on("ready", () => {
                this.logger.info("✅ Redis pronto");
            });

            this.client.on("end", () => {
                this.logger.info("Redis desconectado");
            });

            await this.client.connect();
        } catch (error) {
            this.logger.error("❌ Erro ao conectar Redis:", error);
            throw error;
        }
    }

    /**
     * Desconecta do Redis
     */
    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.logger.info("✅ Redis desconectado");
        }
    }

    /**
     * Obtém cliente Redis
     */
    getClient(): RedisClientType {
        if (!this.client) {
            throw new Error("Redis não conectado");
        }
        return this.client;
    }

    /**
     * Cache de scores
     */
    async cacheScore(userId: string, score: any, ttl: number = 3600): Promise<void> {
        const key = `score:${userId}`;
        await this.client?.setEx(key, ttl, JSON.stringify(score));
    }

    async getCachedScore(userId: string): Promise<any | null> {
        const key = `score:${userId}`;
        const cached = await this.client?.get(key);
        return cached ? JSON.parse(cached) : null;
    }

    async invalidateScore(userId: string): Promise<void> {
        const key = `score:${userId}`;
        await this.client?.del(key);
    }

    /**
     * Sessões de usuário
     */
    async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
        const key = `session:${sessionId}`;
        await this.client?.setEx(key, ttl, JSON.stringify(sessionData));
    }

    async getSession(sessionId: string): Promise<any | null> {
        const key = `session:${sessionId}`;
        const session = await this.client?.get(key);
        return session ? JSON.parse(session) : null;
    }

    async deleteSession(sessionId: string): Promise<void> {
        const key = `session:${sessionId}`;
        await this.client?.del(key);
    }

    /**
     * Rate limiting
     */
    async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        const current = await this.client?.incr(key);
        if (current === 1) {
            await this.client?.expire(key, window);
        }

        const ttl = await this.client?.ttl(key);
        const remaining = Math.max(0, limit - (current || 0));
        const resetTime = Date.now() + ((ttl || 0) * 1000);

        return {
            allowed: (current || 0) <= limit,
            remaining,
            resetTime
        };
    }

    /**
     * Filas de jobs
     */
    async enqueueJob(queueName: string, job: any): Promise<void> {
        await this.client?.lPush(`queue:${queueName}`, JSON.stringify(job));
    }

    async dequeueJob(queueName: string): Promise<any | null> {
        const job = await this.client?.rPop(`queue:${queueName}`);
        return job ? JSON.parse(job) : null;
    }

    async getQueueLength(queueName: string): Promise<number> {
        return await this.client?.lLen(`queue:${queueName}`) || 0;
    }

    /**
     * Pub/Sub
     */
    async publish(channel: string, message: any): Promise<void> {
        await this.client?.publish(channel, JSON.stringify(message));
    }

    async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
        await this.client?.subscribe(channel, (message) => {
            callback(JSON.parse(message));
        });
    }

    /**
     * Notificações
     */
    async addNotification(userId: string, notification: any): Promise<void> {
        const key = `notifications:${userId}`;
        await this.client?.lPush(key, JSON.stringify(notification));
        await this.client?.lTrim(key, 0, 99); // Mantém apenas 100 notificações
    }

    async getNotifications(userId: string, limit: number = 10): Promise<any[]> {
        const key = `notifications:${userId}`;
        const notifications = await this.client?.lRange(key, 0, limit - 1);
        return notifications?.map(n => JSON.parse(n)) || [];
    }

    async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
        const key = `notifications:${userId}`;
        const notifications = await this.client?.lRange(key, 0, -1);
        
        if (notifications) {
            const updated = notifications.map(n => {
                const notif = JSON.parse(n);
                if (notif.id === notificationId) {
                    notif.read = true;
                }
                return JSON.stringify(notif);
            });
            
            await this.client?.del(key);
            if (updated.length > 0) {
                await this.client?.lPush(key, ...updated);
            }
        }
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.client?.ping();
            return true;
        } catch (error) {
            this.logger.error("Redis health check falhou:", error);
            return false;
        }
    }
}
