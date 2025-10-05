/**
 * Database Adapter
 * 
 * Gerencia conexões com PostgreSQL e MongoDB
 */

import { Pool, PoolClient } from "pg";
import mongoose, { Connection } from "mongoose";
import { Config } from "../config";
import { Logger } from "../utils/logger";

export class DatabaseAdapter {
    private config: Config;
    private logger: Logger;
    private postgresPool: Pool | null = null;
    private mongoConnection: Connection | null = null;

    constructor(config: Config) {
        this.config = config;
        this.logger = new Logger("DatabaseAdapter");
    }

    /**
     * Conecta ao PostgreSQL
     */
    async connectPostgreSQL(): Promise<void> {
        try {
            const dbConfig = this.config.getDatabaseConfig();
            
            this.postgresPool = new Pool({
                connectionString: dbConfig.postgres.url,
                host: dbConfig.postgres.host,
                port: dbConfig.postgres.port,
                database: dbConfig.postgres.database,
                user: dbConfig.postgres.username,
                password: dbConfig.postgres.password,
                max: 20, // máximo 20 conexões
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Testa conexão
            const client = await this.postgresPool.connect();
            await client.query("SELECT 1");
            client.release();

            this.logger.info("✅ PostgreSQL conectado");
        } catch (error) {
            this.logger.error("❌ Erro ao conectar PostgreSQL:", error);
            throw error;
        }
    }

    /**
     * Conecta ao MongoDB
     */
    async connectMongoDB(): Promise<void> {
        try {
            const dbConfig = this.config.getDatabaseConfig();
            
            await mongoose.connect(dbConfig.mongodb.url, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.mongoConnection = mongoose.connection;

            this.logger.info("✅ MongoDB conectado");
        } catch (error) {
            this.logger.error("❌ Erro ao conectar MongoDB:", error);
            throw error;
        }
    }

    /**
     * Conecta a todos os bancos
     */
    async connect(): Promise<void> {
        await Promise.all([
            this.connectPostgreSQL(),
            this.connectMongoDB()
        ]);
    }

    /**
     * Desconecta de todos os bancos
     */
    async disconnect(): Promise<void> {
        try {
            if (this.postgresPool) {
                await this.postgresPool.end();
                this.logger.info("✅ PostgreSQL desconectado");
            }

            if (this.mongoConnection) {
                await mongoose.disconnect();
                this.logger.info("✅ MongoDB desconectado");
            }
        } catch (error) {
            this.logger.error("❌ Erro ao desconectar bancos:", error);
        }
    }

    /**
     * Obtém cliente PostgreSQL
     */
    async getPostgresClient(): Promise<PoolClient> {
        if (!this.postgresPool) {
            throw new Error("PostgreSQL não conectado");
        }
        return await this.postgresPool.connect();
    }

    /**
     * Executa query PostgreSQL
     */
    async queryPostgres(text: string, params?: any[]): Promise<any> {
        const client = await this.getPostgresClient();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    /**
     * Obtém conexão MongoDB
     */
    getMongoConnection(): Connection {
        if (!this.mongoConnection) {
            throw new Error("MongoDB não conectado");
        }
        return this.mongoConnection;
    }

    /**
     * Executa transação PostgreSQL
     */
    async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.getPostgresClient();
        try {
            await client.query("BEGIN");
            const result = await callback(client);
            await client.query("COMMIT");
            return result;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Health check dos bancos
     */
    async healthCheck(): Promise<{ postgres: boolean; mongodb: boolean }> {
        const health = { postgres: false, mongodb: false };

        try {
            // Testa PostgreSQL
            await this.queryPostgres("SELECT 1");
            health.postgres = true;
        } catch (error) {
            this.logger.error("PostgreSQL health check falhou:", error);
        }

        try {
            // Testa MongoDB
            if (this.mongoConnection) {
                await this.mongoConnection.db.admin().ping();
                health.mongodb = true;
            }
        } catch (error) {
            this.logger.error("MongoDB health check falhou:", error);
        }

        return health;
    }
}
