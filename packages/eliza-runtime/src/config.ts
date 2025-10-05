/**
 * Configuração do CredChain ElizaOS Runtime
 * 
 * Gerencia todas as configurações do sistema de forma centralizada
 */

import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

export class Config {
    private static instance: Config;
    private config: Map<string, string> = new Map();

    private constructor() {
        this.loadEnvironmentVariables();
    }

    /**
     * Singleton pattern para garantir uma única instância
     */
    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    /**
     * Carrega variáveis de ambiente
     */
    private loadEnvironmentVariables(): void {
        const envVars = [
            // Ambiente
            "NODE_ENV",
            "PORT",
            
            // Banco de dados
            "DATABASE_URL",
            "MONGODB_URL",
            "REDIS_URL",
            
            // Blockchain
            "SUBSTRATE_WS",
            "POLKADOT_RPC_URL",
            "BLOCKCHAIN_NETWORK",
            
            // ElizaOS & IA
            "ANTHROPIC_API_KEY",
            "OPENAI_API_KEY",
            "ELIZA_RUNTIME_URL",
            
            // APIs
            "API_GATEWAY_URL",
            "NEXT_PUBLIC_API_URL",
            "NEXT_PUBLIC_ELIZA_URL",
            
            // Segurança
            "JWT_SECRET",
            "ENCRYPTION_KEY",
            "CORS_ORIGIN",
            
            // Compliance
            "LGPD_ENABLED",
            "GDPR_ENABLED",
            "DATA_RETENTION_DAYS",
            "AUDIT_LOG_ENABLED",
            
            // Monitoramento
            "LOG_LEVEL",
            "SENTRY_DSN",
            "PROMETHEUS_ENABLED"
        ];

        envVars.forEach(envVar => {
            const value = process.env[envVar];
            if (value) {
                this.config.set(envVar, value);
            }
        });
    }

    /**
     * Obtém uma configuração
     */
    public get(key: string, defaultValue?: string): string {
        return this.config.get(key) || defaultValue || "";
    }

    /**
     * Define uma configuração
     */
    public set(key: string, value: string): void {
        this.config.set(key, value);
    }

    /**
     * Verifica se uma configuração existe
     */
    public has(key: string): boolean {
        return this.config.has(key);
    }

    /**
     * Obtém configurações de banco de dados
     */
    public getDatabaseConfig() {
        return {
            postgres: {
                url: this.get("DATABASE_URL", "postgresql://credchain:dev_password@localhost:5432/credchain"),
                host: this.extractHostFromUrl(this.get("DATABASE_URL")),
                port: this.extractPortFromUrl(this.get("DATABASE_URL"), 5432),
                database: this.extractDatabaseFromUrl(this.get("DATABASE_URL")),
                username: this.extractUsernameFromUrl(this.get("DATABASE_URL")),
                password: this.extractPasswordFromUrl(this.get("DATABASE_URL"))
            },
            mongodb: {
                url: this.get("MONGODB_URL", "mongodb://credchain:dev_password@localhost:27017/credchain"),
                host: this.extractHostFromUrl(this.get("MONGODB_URL")),
                port: this.extractPortFromUrl(this.get("MONGODB_URL"), 27017),
                database: this.extractDatabaseFromUrl(this.get("MONGODB_URL")),
                username: this.extractUsernameFromUrl(this.get("MONGODB_URL")),
                password: this.extractPasswordFromUrl(this.get("MONGODB_URL"))
            },
            redis: {
                url: this.get("REDIS_URL", "redis://localhost:6379"),
                host: this.extractHostFromUrl(this.get("REDIS_URL")),
                port: this.extractPortFromUrl(this.get("REDIS_URL"), 6379),
                password: this.extractPasswordFromUrl(this.get("REDIS_URL"))
            }
        };
    }

    /**
     * Obtém configurações de blockchain
     */
    public getBlockchainConfig() {
        return {
            substrate: {
                ws: this.get("SUBSTRATE_WS", "ws://localhost:9944"),
                rpc: this.get("POLKADOT_RPC_URL", "ws://localhost:9944"),
                network: this.get("BLOCKCHAIN_NETWORK", "substrate-local")
            },
            parachain: {
                id: this.get("PARACHAIN_ID", "2000"),
                slot: this.get("PARACHAIN_SLOT", "0")
            }
        };
    }

    /**
     * Obtém configurações de IA
     */
    public getAIConfig() {
        return {
            anthropic: {
                apiKey: this.get("ANTHROPIC_API_KEY"),
                model: this.get("ANTHROPIC_MODEL", "claude-3-sonnet-20240229"),
                maxTokens: parseInt(this.get("ANTHROPIC_MAX_TOKENS", "4096")),
                temperature: parseFloat(this.get("ANTHROPIC_TEMPERATURE", "0.7"))
            },
            openai: {
                apiKey: this.get("OPENAI_API_KEY"),
                model: this.get("OPENAI_MODEL", "gpt-4"),
                maxTokens: parseInt(this.get("OPENAI_MAX_TOKENS", "4096")),
                temperature: parseFloat(this.get("OPENAI_TEMPERATURE", "0.7"))
            }
        };
    }

    /**
     * Obtém configurações de segurança
     */
    public getSecurityConfig() {
        return {
            jwt: {
                secret: this.get("JWT_SECRET"),
                expiresIn: this.get("JWT_EXPIRES_IN", "24h"),
                algorithm: this.get("JWT_ALGORITHM", "HS256")
            },
            encryption: {
                key: this.get("ENCRYPTION_KEY"),
                algorithm: this.get("ENCRYPTION_ALGORITHM", "aes-256-gcm")
            },
            cors: {
                origin: this.get("CORS_ORIGIN", "http://localhost:3001"),
                credentials: this.get("CORS_CREDENTIALS", "true") === "true"
            }
        };
    }

    /**
     * Obtém configurações de compliance
     */
    public getComplianceConfig() {
        return {
            lgpd: {
                enabled: this.get("LGPD_ENABLED", "true") === "true",
                dataRetentionDays: parseInt(this.get("DATA_RETENTION_DAYS", "2555")), // 7 anos
                consentRequired: this.get("LGPD_CONSENT_REQUIRED", "true") === "true"
            },
            gdpr: {
                enabled: this.get("GDPR_ENABLED", "true") === "true",
                dataPortability: this.get("GDPR_DATA_PORTABILITY", "true") === "true",
                rightToBeForgotten: this.get("GDPR_RIGHT_TO_BE_FORGOTTEN", "true") === "true"
            },
            audit: {
                enabled: this.get("AUDIT_LOG_ENABLED", "true") === "true",
                logLevel: this.get("AUDIT_LOG_LEVEL", "info"),
                retentionDays: parseInt(this.get("AUDIT_LOG_RETENTION_DAYS", "365"))
            }
        };
    }

    /**
     * Obtém configurações de monitoramento
     */
    public getMonitoringConfig() {
        return {
            logging: {
                level: this.get("LOG_LEVEL", "info"),
                format: this.get("LOG_FORMAT", "json"),
                output: this.get("LOG_OUTPUT", "console")
            },
            sentry: {
                dsn: this.get("SENTRY_DSN"),
                environment: this.get("NODE_ENV", "development"),
                release: this.get("SENTRY_RELEASE", "1.0.0")
            },
            prometheus: {
                enabled: this.get("PROMETHEUS_ENABLED", "true") === "true",
                port: parseInt(this.get("PROMETHEUS_PORT", "9090")),
                path: this.get("PROMETHEUS_PATH", "/metrics")
            }
        };
    }

    /**
     * Valida configurações obrigatórias
     */
    public validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const required = [
            "ANTHROPIC_API_KEY",
            "DATABASE_URL",
            "REDIS_URL"
        ];

        required.forEach(key => {
            if (!this.has(key) || this.get(key).trim() === "") {
                errors.push(`Configuração obrigatória não encontrada: ${key}`);
            }
        });

        // Valida formato das URLs
        if (this.has("DATABASE_URL") && !this.isValidUrl(this.get("DATABASE_URL"))) {
            errors.push("DATABASE_URL deve ser uma URL válida");
        }

        if (this.has("REDIS_URL") && !this.isValidUrl(this.get("REDIS_URL"))) {
            errors.push("REDIS_URL deve ser uma URL válida");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Utilitários para extrair informações de URLs
     */
    private extractHostFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return "localhost";
        }
    }

    private extractPortFromUrl(url: string, defaultPort: number): number {
        try {
            const urlObj = new URL(url);
            return parseInt(urlObj.port) || defaultPort;
        } catch {
            return defaultPort;
        }
    }

    private extractDatabaseFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1);
        } catch {
            return "credchain";
        }
    }

    private extractUsernameFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.username;
        } catch {
            return "credchain";
        }
    }

    private extractPasswordFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.password;
        } catch {
            return "dev_password";
        }
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Exporta instância singleton
export const config = Config.getInstance();
