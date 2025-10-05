/**
 * Config Utility - Sistema de configuração para ElizaOS
 * 
 * Gerencia configurações centralizadas com validação e tipos
 */

import { Logger } from './logger';

export interface DatabaseConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    pool?: {
      min: number;
      max: number;
    };
  };
  mongodb: {
    uri: string;
    database: string;
    options?: any;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

export interface BlockchainConfig {
  polkadot: {
    rpcUrl: string;
    wsUrl: string;
    chainId: string;
    accountSeed?: string;
  };
  substrate: {
    nodeUrl: string;
    chainSpec: string;
  };
}

export interface AIConfig {
  anthropic: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  azure: {
    apiKey: string;
    endpoint: string;
    deployment: string;
  };
}

export interface NotificationConfig {
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    sendgrid?: {
      apiKey: string;
    };
    ses?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
  };
  sms: {
    provider: 'twilio' | 'aws-sns';
    twilio?: {
      accountSid: string;
      authToken: string;
      from: string;
    };
    sns?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
    };
  };
  push: {
    firebase: {
      projectId: string;
      privateKey: string;
      clientEmail: string;
    };
  };
}

export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  encryption: {
    algorithm: string;
    key: string;
    iv: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

export interface MonitoringConfig {
  prometheus: {
    enabled: boolean;
    port: number;
    path: string;
  };
  grafana: {
    enabled: boolean;
    url: string;
    apiKey: string;
  };
  elasticsearch: {
    enabled: boolean;
    url: string;
    index: string;
  };
}

export interface ElizaOSConfig {
  agents: {
    orchestrator: {
      enabled: boolean;
      model: string;
      temperature: number;
    };
    creditAnalyzer: {
      enabled: boolean;
      model: string;
      temperature: number;
    };
    compliance: {
      enabled: boolean;
      model: string;
      temperature: number;
    };
    fraudDetector: {
      enabled: boolean;
      model: string;
      temperature: number;
    };
    userAssistant: {
      enabled: boolean;
      model: string;
      temperature: number;
    };
    financialAdvisor: {
      enabled: boolean;
      model: string;
      temperature: number;
    };
  };
  plugins: {
    polkadot: {
      enabled: boolean;
      config: any;
    };
    compliance: {
      enabled: boolean;
      config: any;
    };
    analytics: {
      enabled: boolean;
      config: any;
    };
    notification: {
      enabled: boolean;
      config: any;
    };
  };
}

export interface CredChainConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  debug: boolean;
  database: DatabaseConfig;
  blockchain: BlockchainConfig;
  ai: AIConfig;
  notifications: NotificationConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  elizaos: ElizaOSConfig;
}

export class Config {
  private static instance: Config;
  private config: CredChainConfig;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('Config');
    this.config = this.loadConfig();
  }

  /**
   * Obter instância singleton
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Carregar configuração
   */
  private loadConfig(): CredChainConfig {
    const environment = process.env.NODE_ENV || 'development';
    
    this.logger.info(`Carregando configuração para ambiente: ${environment}`);

    const config: CredChainConfig = {
      environment: environment as any,
      version: process.env.APP_VERSION || '1.0.0',
      debug: process.env.DEBUG === 'true',
      
      database: {
        postgres: {
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          database: process.env.POSTGRES_DB || 'credchain',
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'password',
          ssl: process.env.POSTGRES_SSL === 'true',
          pool: {
            min: parseInt(process.env.POSTGRES_POOL_MIN || '2'),
            max: parseInt(process.env.POSTGRES_POOL_MAX || '10')
          }
        },
        mongodb: {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
          database: process.env.MONGODB_DB || 'credchain_ai',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }
        },
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0')
        }
      },

      blockchain: {
        polkadot: {
          rpcUrl: process.env.POLKADOT_RPC_URL || 'wss://rpc.polkadot.io',
          wsUrl: process.env.POLKADOT_WS_URL || 'wss://rpc.polkadot.io',
          chainId: process.env.POLKADOT_CHAIN_ID || 'polkadot',
          accountSeed: process.env.POLKADOT_ACCOUNT_SEED
        },
        substrate: {
          nodeUrl: process.env.SUBSTRATE_NODE_URL || 'ws://localhost:9944',
          chainSpec: process.env.SUBSTRATE_CHAIN_SPEC || 'dev'
        }
      },

      ai: {
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000')
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY || '',
          model: process.env.OPENAI_MODEL || 'gpt-4',
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000')
        },
        azure: {
          apiKey: process.env.AZURE_API_KEY || '',
          endpoint: process.env.AZURE_ENDPOINT || '',
          deployment: process.env.AZURE_DEPLOYMENT || ''
        }
      },

      notifications: {
        email: {
          provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
          smtp: {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || ''
            }
          },
          sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY || ''
          },
          ses: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'us-east-1'
          }
        },
        sms: {
          provider: (process.env.SMS_PROVIDER as any) || 'twilio',
          twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID || '',
            authToken: process.env.TWILIO_AUTH_TOKEN || '',
            from: process.env.TWILIO_FROM || ''
          },
          sns: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'us-east-1'
          }
        },
        push: {
          firebase: {
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || ''
          }
        }
      },

      security: {
        jwt: {
          secret: process.env.JWT_SECRET || 'your-secret-key',
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
          refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        },
        encryption: {
          algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
          key: process.env.ENCRYPTION_KEY || 'your-encryption-key',
          iv: process.env.ENCRYPTION_IV || 'your-iv'
        },
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
          max: parseInt(process.env.RATE_LIMIT_MAX || '100')
        },
        cors: {
          origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
          credentials: process.env.CORS_CREDENTIALS === 'true'
        }
      },

      monitoring: {
        prometheus: {
          enabled: process.env.PROMETHEUS_ENABLED === 'true',
          port: parseInt(process.env.PROMETHEUS_PORT || '9090'),
          path: process.env.PROMETHEUS_PATH || '/metrics'
        },
        grafana: {
          enabled: process.env.GRAFANA_ENABLED === 'true',
          url: process.env.GRAFANA_URL || 'http://localhost:3000',
          apiKey: process.env.GRAFANA_API_KEY || ''
        },
        elasticsearch: {
          enabled: process.env.ELASTICSEARCH_ENABLED === 'true',
          url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
          index: process.env.ELASTICSEARCH_INDEX || 'credchain-logs'
        }
      },

      elizaos: {
        agents: {
          orchestrator: {
            enabled: process.env.ORCHESTRATOR_ENABLED !== 'false',
            model: process.env.ORCHESTRATOR_MODEL || 'claude-3-sonnet-20240229',
            temperature: parseFloat(process.env.ORCHESTRATOR_TEMPERATURE || '0.7')
          },
          creditAnalyzer: {
            enabled: process.env.CREDIT_ANALYZER_ENABLED !== 'false',
            model: process.env.CREDIT_ANALYZER_MODEL || 'claude-3-sonnet-20240229',
            temperature: parseFloat(process.env.CREDIT_ANALYZER_TEMPERATURE || '0.3')
          },
          compliance: {
            enabled: process.env.COMPLIANCE_ENABLED !== 'false',
            model: process.env.COMPLIANCE_MODEL || 'claude-3-sonnet-20240229',
            temperature: parseFloat(process.env.COMPLIANCE_TEMPERATURE || '0.1')
          },
          fraudDetector: {
            enabled: process.env.FRAUD_DETECTOR_ENABLED !== 'false',
            model: process.env.FRAUD_DETECTOR_MODEL || 'claude-3-sonnet-20240229',
            temperature: parseFloat(process.env.FRAUD_DETECTOR_TEMPERATURE || '0.2')
          },
          userAssistant: {
            enabled: process.env.USER_ASSISTANT_ENABLED !== 'false',
            model: process.env.USER_ASSISTANT_MODEL || 'claude-3-sonnet-20240229',
            temperature: parseFloat(process.env.USER_ASSISTANT_TEMPERATURE || '0.8')
          },
          financialAdvisor: {
            enabled: process.env.FINANCIAL_ADVISOR_ENABLED !== 'false',
            model: process.env.FINANCIAL_ADVISOR_MODEL || 'claude-3-sonnet-20240229',
            temperature: parseFloat(process.env.FINANCIAL_ADVISOR_TEMPERATURE || '0.6')
          }
        },
        plugins: {
          polkadot: {
            enabled: process.env.POLKADOT_PLUGIN_ENABLED !== 'false',
            config: {
              rpcUrl: process.env.POLKADOT_RPC_URL,
              wsUrl: process.env.POLKADOT_WS_URL
            }
          },
          compliance: {
            enabled: process.env.COMPLIANCE_PLUGIN_ENABLED !== 'false',
            config: {
              lgpdEnabled: process.env.LGPD_ENABLED === 'true',
              gdprEnabled: process.env.GDPR_ENABLED === 'true',
              baselEnabled: process.env.BASEL_ENABLED === 'true'
            }
          },
          analytics: {
            enabled: process.env.ANALYTICS_PLUGIN_ENABLED !== 'false',
            config: {
              trackingEnabled: process.env.ANALYTICS_TRACKING_ENABLED === 'true',
              eventsEndpoint: process.env.ANALYTICS_EVENTS_ENDPOINT
            }
          },
          notification: {
            enabled: process.env.NOTIFICATION_PLUGIN_ENABLED !== 'false',
            config: {
              emailEnabled: process.env.EMAIL_ENABLED === 'true',
              smsEnabled: process.env.SMS_ENABLED === 'true',
              pushEnabled: process.env.PUSH_ENABLED === 'true'
            }
          }
        }
      }
    };

    this.validateConfig(config);
    return config;
  }

  /**
   * Validar configuração
   */
  private validateConfig(config: CredChainConfig): void {
    const errors: string[] = [];

    // Validar configurações obrigatórias
    if (!config.database.postgres.host) {
      errors.push('POSTGRES_HOST é obrigatório');
    }

    if (!config.database.postgres.database) {
      errors.push('POSTGRES_DB é obrigatório');
    }

    if (!config.database.postgres.username) {
      errors.push('POSTGRES_USER é obrigatório');
    }

    if (!config.database.postgres.password) {
      errors.push('POSTGRES_PASSWORD é obrigatório');
    }

    if (!config.blockchain.polkadot.rpcUrl) {
      errors.push('POLKADOT_RPC_URL é obrigatório');
    }

    if (!config.security.jwt.secret || config.security.jwt.secret === 'your-secret-key') {
      errors.push('JWT_SECRET deve ser definido e seguro');
    }

    if (!config.security.encryption.key || config.security.encryption.key === 'your-encryption-key') {
      errors.push('ENCRYPTION_KEY deve ser definido e seguro');
    }

    if (errors.length > 0) {
      this.logger.error('Erros de configuração encontrados:', { errors });
      throw new Error(`Configuração inválida: ${errors.join(', ')}`);
    }

    this.logger.info('Configuração validada com sucesso');
  }

  /**
   * Obter configuração completa
   */
  public getConfig(): CredChainConfig {
    return this.config;
  }

  /**
   * Obter configuração de banco de dados
   */
  public getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  /**
   * Obter configuração de blockchain
   */
  public getBlockchainConfig(): BlockchainConfig {
    return this.config.blockchain;
  }

  /**
   * Obter configuração de IA
   */
  public getAIConfig(): AIConfig {
    return this.config.ai;
  }

  /**
   * Obter configuração de notificações
   */
  public getNotificationConfig(): NotificationConfig {
    return this.config.notifications;
  }

  /**
   * Obter configuração de segurança
   */
  public getSecurityConfig(): SecurityConfig {
    return this.config.security;
  }

  /**
   * Obter configuração de monitoramento
   */
  public getMonitoringConfig(): MonitoringConfig {
    return this.config.monitoring;
  }

  /**
   * Obter configuração do ElizaOS
   */
  public getElizaOSConfig(): ElizaOSConfig {
    return this.config.elizaos;
  }

  /**
   * Obter configuração de agente específico
   */
  public getAgentConfig(agentName: keyof ElizaOSConfig['agents']): any {
    return this.config.elizaos.agents[agentName];
  }

  /**
   * Obter configuração de plugin específico
   */
  public getPluginConfig(pluginName: keyof ElizaOSConfig['plugins']): any {
    return this.config.elizaos.plugins[pluginName];
  }

  /**
   * Verificar se é ambiente de desenvolvimento
   */
  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  /**
   * Verificar se é ambiente de produção
   */
  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  /**
   * Verificar se debug está habilitado
   */
  public isDebugEnabled(): boolean {
    return this.config.debug;
  }

  /**
   * Obter valor de configuração por chave
   */
  public get(key: string): any {
    const keys = key.split('.');
    let value: any = this.config;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Atualizar configuração
   */
  public updateConfig(updates: Partial<CredChainConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('Configuração atualizada');
  }

  /**
   * Recarregar configuração
   */
  public reload(): void {
    this.config = this.loadConfig();
    this.logger.info('Configuração recarregada');
  }
}

// Exportar instância padrão
export const config = Config.getInstance();
