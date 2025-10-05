// Configurações para produção - CredChain
export const productionConfig = {
  // Blockchain
  blockchain: {
    rpcUrl: process.env.POLKADOT_RPC_URL || 'https://rpc.polkadot.io',
    chainId: process.env.CHAIN_ID || '0x0000000000000000000000000000000000000000000000000000000000000000',
    networkName: process.env.NETWORK_NAME || 'Polkadot',
    blockExplorer: process.env.BLOCK_EXPLORER || 'https://polkascan.io',
  },
  
  // API
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.credchain.io',
    timeout: 30000,
    retries: 3,
  },
  
  // Database
  database: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'credchain',
      username: process.env.POSTGRES_USER || 'credchain',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production',
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/credchain',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
    },
  },
  
  // Security
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || '',
      expiresIn: '24h',
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY || '',
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  
  // External Services
  external: {
    elizaos: {
      apiUrl: process.env.ELIZAOS_API_URL || 'https://elizaos.credchain.io',
      apiKey: process.env.ELIZAOS_API_KEY || '',
    },
    analytics: {
      googleAnalytics: process.env.GOOGLE_ANALYTICS_ID || '',
      mixpanel: process.env.MIXPANEL_TOKEN || '',
    },
    notifications: {
      email: {
        provider: process.env.EMAIL_PROVIDER || 'sendgrid',
        apiKey: process.env.EMAIL_API_KEY || '',
        from: process.env.EMAIL_FROM || 'noreply@credchain.io',
      },
      sms: {
        provider: process.env.SMS_PROVIDER || 'twilio',
        apiKey: process.env.SMS_API_KEY || '',
        from: process.env.SMS_FROM || '+1234567890',
      },
    },
  },
  
  // Monitoring
  monitoring: {
    prometheus: {
      enabled: process.env.PROMETHEUS_ENABLED === 'true',
      port: parseInt(process.env.PROMETHEUS_PORT || '9090'),
    },
    grafana: {
      enabled: process.env.GRAFANA_ENABLED === 'true',
      url: process.env.GRAFANA_URL || 'https://grafana.credchain.io',
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
    },
  },
  
  // Features
  features: {
    kyc: {
      enabled: process.env.KYC_ENABLED === 'true',
      provider: process.env.KYC_PROVIDER || 'jumio',
      apiKey: process.env.KYC_API_KEY || '',
    },
    ml: {
      enabled: process.env.ML_ENABLED === 'true',
      modelUrl: process.env.ML_MODEL_URL || 'https://ml.credchain.io',
      apiKey: process.env.ML_API_KEY || '',
    },
    blockchain: {
      enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
      network: process.env.BLOCKCHAIN_NETWORK || 'polkadot',
    },
  },
  
  // Environment
  environment: {
    nodeEnv: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
  },
};
