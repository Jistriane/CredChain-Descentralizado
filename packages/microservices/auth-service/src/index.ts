#!/usr/bin/env node

/**
 * CredChain Auth Service
 * 
 * Microserviço de autenticação e autorização
 * Gerencia login, registro, JWT, 2FA, OAuth, RBAC
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createClient } from "redis";
import ConnectRedis from "connect-redis";

// Importações internas
import { Config } from "./config";
import { Logger } from "./utils/logger";
import { DatabaseAdapter } from "./adapters/database";
import { RedisAdapter } from "./adapters/redis";
import { EmailAdapter } from "./adapters/email";

// Middleware
import { authMiddleware } from "./middleware/auth";
import { validationMiddleware } from "./middleware/validation";
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./middleware/requestLogger";
import { rateLimitMiddleware } from "./middleware/rateLimit";

// Rotas
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { roleRoutes } from "./routes/roles";
import { sessionRoutes } from "./routes/sessions";
import { twoFactorRoutes } from "./routes/twoFactor";
import { oauthRoutes } from "./routes/oauth";
import { healthRoutes } from "./routes/health";

// Passport strategies
import { setupPassport } from "./config/passport";

// Configuração
const config = new Config();
const logger = new Logger("CredChain-Auth-Service");

/**
 * Inicializa todos os adapters
 */
async function initializeAdapters() {
    logger.info("Inicializando adapters...");

    try {
        // Database Adapter
        const databaseAdapter = new DatabaseAdapter(config);
        await databaseAdapter.connect();
        logger.info("✅ Database adapter conectado");

        // Redis Adapter
        const redisAdapter = new RedisAdapter(config);
        await redisAdapter.connect();
        logger.info("✅ Redis adapter conectado");

        // Email Adapter
        const emailAdapter = new EmailAdapter(config);
        await emailAdapter.connect();
        logger.info("✅ Email adapter conectado");

        return {
            database: databaseAdapter,
            redis: redisAdapter,
            email: emailAdapter
        };

    } catch (error) {
        logger.error("❌ Erro ao inicializar adapters:", error);
        throw error;
    }
}

/**
 * Configura middleware do Express
 */
function setupMiddleware(app: express.Application, redisClient: any) {
    // Segurança
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));

    // CORS
    app.use(cors({
        origin: config.get("CORS_ORIGIN", "http://localhost:3001"),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    }));

    // Compressão
    app.use(compression());

    // Logging
    app.use(morgan("combined", {
        stream: {
            write: (message: string) => logger.info(message.trim())
        }
    }));

    // Rate limiting global
    const globalRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 1000, // máximo 1000 requests por IP
        message: {
            error: "Too Many Requests",
            message: "Rate limit exceeded. Please try again later."
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(globalRateLimit);

    // Rate limiting para autenticação
    const authRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 5, // máximo 5 tentativas de login por IP
        message: {
            error: "Too Many Login Attempts",
            message: "Too many login attempts. Please try again later."
        },
        skipSuccessfulRequests: true
    });

    // Parser
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use(cookieParser());

    // Session
    const RedisStore = ConnectRedis(session);
    app.use(session({
        store: new RedisStore({ client: redisClient }),
        secret: config.get("SESSION_SECRET", "credchain-session-secret"),
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: config.get("NODE_ENV") === "production",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        }
    }));

    // Request logging
    app.use(requestLogger);

    return { globalRateLimit, authRateLimit };
}

/**
 * Configura rotas da API
 */
function setupRoutes(app: express.Application, adapters: any, authRateLimit: any) {
    // Health check (sem rate limiting)
    app.use("/health", healthRoutes);

    // Rotas de autenticação (com rate limiting)
    app.use("/auth", authRateLimit, authRoutes);
    app.use("/auth/2fa", authRateLimit, twoFactorRoutes);
    app.use("/auth/oauth", oauthRoutes);

    // Rotas protegidas
    app.use("/users", authMiddleware, userRoutes);
    app.use("/roles", authMiddleware, roleRoutes);
    app.use("/sessions", authMiddleware, sessionRoutes);

    // Middleware de validação
    app.use(validationMiddleware);

    // Error handler
    app.use(errorHandler);
}

/**
 * Configura Passport
 */
function setupPassportAuth(app: express.Application) {
    setupPassport(app);
    logger.info("✅ Passport configurado");
}

/**
 * Função principal
 */
async function main() {
    try {
        logger.info("🚀 Iniciando CredChain Auth Service...");

        // Valida configurações
        const validation = config.validate();
        if (!validation.valid) {
            logger.error("❌ Configurações inválidas:", validation.errors);
            process.exit(1);
        }

        // Inicializa adapters
        const adapters = await initializeAdapters();

        // Configura Express
        const app = express();

        // Middleware
        const { authRateLimit } = setupMiddleware(app, adapters.redis.getClient());

        // Passport
        setupPassportAuth(app);

        // Rotas
        setupRoutes(app, adapters, authRateLimit);

        // Inicia servidor
        const port = config.get("PORT", "3001");
        app.listen(port, () => {
            logger.info(`✅ Auth Service rodando na porta ${port}`);
            logger.info(`📊 Health check: http://localhost:${port}/health`);
            logger.info(`🔐 Auth endpoints: http://localhost:${port}/auth`);
            logger.info(`👥 User management: http://localhost:${port}/users`);
            logger.info(`🔑 Role management: http://localhost:${port}/roles`);
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            logger.info("🛑 Recebido SIGINT, encerrando graciosamente...");
            await Promise.all([
                adapters.database?.disconnect(),
                adapters.redis?.disconnect(),
                adapters.email?.disconnect()
            ]);
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            logger.info("🛑 Recebido SIGTERM, encerrando graciosamente...");
            await Promise.all([
                adapters.database?.disconnect(),
                adapters.redis?.disconnect(),
                adapters.email?.disconnect()
            ]);
            process.exit(0);
        });

    } catch (error) {
        logger.error("❌ Erro fatal ao inicializar Auth Service:", error);
        process.exit(1);
    }
}

// Inicia aplicação
if (require.main === module) {
    main().catch((error) => {
        console.error("❌ Erro fatal:", error);
        process.exit(1);
    });
}

export { main, initializeAdapters, setupMiddleware, setupRoutes, setupPassportAuth };
