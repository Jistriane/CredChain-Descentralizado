import { Pool, PoolClient } from 'pg';
import { MongoClient, Db } from 'mongodb';
import { Redis } from 'redis';
import { Config } from '../config';
import { Logger } from '../utils/logger';

export interface DatabaseConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  mongodb: {
    url: string;
    database: string;
  };
  redis: {
    url: string;
  };
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  fields: any[];
}

export class DatabaseAdapter {
  private config: Config;
  private logger: Logger;
  private postgres: Pool | null = null;
  private mongodb: MongoClient | null = null;
  private mongodbDb: Db | null = null;
  private redis: Redis | null = null;
  private databaseConfig: DatabaseConfig;

  constructor(config: Config) {
    this.config = config;
    this.logger = new Logger('DatabaseAdapter');
    this.databaseConfig = {
      postgres: {
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: parseInt(config.get('POSTGRES_PORT', '5432')),
        database: config.get('POSTGRES_DB', 'credchain'),
        username: config.get('POSTGRES_USER', 'credchain'),
        password: config.get('POSTGRES_PASSWORD', 'credchain'),
        ssl: config.get('POSTGRES_SSL', 'false') === 'true',
      },
      mongodb: {
        url: config.get('MONGODB_URL', 'mongodb://localhost:27017'),
        database: config.get('MONGODB_DB', 'credchain'),
      },
      redis: {
        url: config.get('REDIS_URL', 'redis://localhost:6379'),
      },
    };
  }

  /**
   * Conecta aos bancos de dados
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando aos bancos de dados...');

      // Conecta ao PostgreSQL
      await this.connectPostgreSQL();

      // Conecta ao MongoDB
      await this.connectMongoDB();

      // Conecta ao Redis
      await this.connectRedis();

      this.logger.info('✅ Todos os bancos de dados conectados com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar aos bancos de dados:', error);
      throw error;
    }
  }

  /**
   * Conecta ao PostgreSQL
   */
  private async connectPostgreSQL(): Promise<void> {
    try {
      this.postgres = new Pool({
        host: this.databaseConfig.postgres.host,
        port: this.databaseConfig.postgres.port,
        database: this.databaseConfig.postgres.database,
        user: this.databaseConfig.postgres.username,
        password: this.databaseConfig.postgres.password,
        ssl: this.databaseConfig.postgres.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Testa a conexão
      const client = await this.postgres.connect();
      await client.query('SELECT 1');
      client.release();

      this.logger.info('✅ PostgreSQL conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Conecta ao MongoDB
   */
  private async connectMongoDB(): Promise<void> {
    try {
      this.mongodb = new MongoClient(this.databaseConfig.mongodb.url);
      await this.mongodb.connect();
      this.mongodbDb = this.mongodb.db(this.databaseConfig.mongodb.database);

      // Testa a conexão
      await this.mongodbDb.admin().ping();

      this.logger.info('✅ MongoDB conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao MongoDB:', error);
      throw error;
    }
  }

  /**
   * Conecta ao Redis
   */
  private async connectRedis(): Promise<void> {
    try {
      this.redis = new Redis({
        url: this.databaseConfig.redis.url,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });

      // Testa a conexão
      await this.redis.ping();

      this.logger.info('✅ Redis conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao Redis:', error);
      throw error;
    }
  }

  /**
   * Executa query no PostgreSQL
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.postgres) {
      throw new Error('PostgreSQL não conectado');
    }

    try {
      const result = await this.postgres.query(sql, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao executar query PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Executa query com transação
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.postgres) {
      throw new Error('PostgreSQL não conectado');
    }

    const client = await this.postgres.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtém coleção do MongoDB
   */
  getMongoCollection<T = any>(name: string) {
    if (!this.mongodbDb) {
      throw new Error('MongoDB não conectado');
    }
    return this.mongodbDb.collection<T>(name);
  }

  /**
   * Obtém cliente Redis
   */
  getRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis não conectado');
    }
    return this.redis;
  }

  /**
   * Obtém cliente PostgreSQL
   */
  getPostgreSQL(): Pool {
    if (!this.postgres) {
      throw new Error('PostgreSQL não conectado');
    }
    return this.postgres;
  }

  /**
   * Obtém banco MongoDB
   */
  getMongoDB(): Db {
    if (!this.mongodbDb) {
      throw new Error('MongoDB não conectado');
    }
    return this.mongodbDb;
  }

  /**
   * Executa migração do banco de dados
   */
  async runMigration(sql: string): Promise<void> {
    try {
      await this.query(sql);
      this.logger.info('✅ Migração executada com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao executar migração:', error);
      throw error;
    }
  }

  /**
   * Executa seed do banco de dados
   */
  async runSeed(sql: string): Promise<void> {
    try {
      await this.query(sql);
      this.logger.info('✅ Seed executado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao executar seed:', error);
      throw error;
    }
  }

  /**
   * Cria índices no MongoDB
   */
  async createMongoIndexes(): Promise<void> {
    if (!this.mongodbDb) {
      throw new Error('MongoDB não conectado');
    }

    try {
      // Índices para conversas de IA
      await this.mongodbDb.collection('ai_conversations').createIndex({ userId: 1 });
      await this.mongodbDb.collection('ai_conversations').createIndex({ agentName: 1 });
      await this.mongodbDb.collection('ai_conversations').createIndex({ startedAt: -1 });

      // Índices para padrões comportamentais
      await this.mongodbDb.collection('behavioral_patterns').createIndex({ userId: 1 });
      await this.mongodbDb.collection('behavioral_patterns').createIndex({ patternType: 1 });
      await this.mongodbDb.collection('behavioral_patterns').createIndex({ timestamp: -1 });

      // Índices para eventos de analytics
      await this.mongodbDb.collection('analytics_events').createIndex({ eventName: 1 });
      await this.mongodbDb.collection('analytics_events').createIndex({ userId: 1 });
      await this.mongodbDb.collection('analytics_events').createIndex({ timestamp: -1 });

      this.logger.info('✅ Índices do MongoDB criados com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao criar índices do MongoDB:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas dos bancos de dados
   */
  async getDatabaseStats(): Promise<any> {
    const stats: any = {};

    try {
      // Estatísticas do PostgreSQL
      if (this.postgres) {
        const pgStats = await this.query(`
          SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes
          FROM pg_stat_user_tables
          ORDER BY n_tup_ins DESC
          LIMIT 10
        `);
        stats.postgres = {
          tables: pgStats.rows,
          totalTables: pgStats.rowCount,
        };
      }

      // Estatísticas do MongoDB
      if (this.mongodbDb) {
        const collections = await this.mongodbDb.listCollections().toArray();
        const mongoStats = await this.mongodbDb.stats();
        stats.mongodb = {
          collections: collections.length,
          totalSize: mongoStats.dataSize,
          indexSize: mongoStats.indexSize,
        };
      }

      // Estatísticas do Redis
      if (this.redis) {
        const redisInfo = await this.redis.info();
        const keyspace = await this.redis.dbsize();
        stats.redis = {
          keyspace,
          info: redisInfo,
        };
      }

      return stats;
    } catch (error) {
      this.logger.error('❌ Erro ao obter estatísticas dos bancos de dados:', error);
      return stats;
    }
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<any> {
    const status: any = {
      postgres: { connected: false },
      mongodb: { connected: false },
      redis: { connected: false },
    };

    try {
      // Status do PostgreSQL
      if (this.postgres) {
        try {
          await this.postgres.query('SELECT 1');
          status.postgres.connected = true;
        } catch (error) {
          status.postgres.error = error.message;
        }
      }

      // Status do MongoDB
      if (this.mongodbDb) {
        try {
          await this.mongodbDb.admin().ping();
          status.mongodb.connected = true;
        } catch (error) {
          status.mongodb.error = error.message;
        }
      }

      // Status do Redis
      if (this.redis) {
        try {
          await this.redis.ping();
          status.redis.connected = true;
        } catch (error) {
          status.redis.error = error.message;
        }
      }

      return status;
    } catch (error) {
      this.logger.error('❌ Erro ao obter status dos bancos de dados:', error);
      return status;
    }
  }

  /**
   * Desconecta dos bancos de dados
   */
  async disconnect(): Promise<void> {
    try {
      // Desconecta do PostgreSQL
      if (this.postgres) {
        await this.postgres.end();
        this.postgres = null;
      }

      // Desconecta do MongoDB
      if (this.mongodb) {
        await this.mongodb.close();
        this.mongodb = null;
        this.mongodbDb = null;
      }

      // Desconecta do Redis
      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
      }

      this.logger.info('✅ Desconectado de todos os bancos de dados');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar dos bancos de dados:', error);
      throw error;
    }
  }
}