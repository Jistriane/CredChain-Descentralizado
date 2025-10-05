#!/usr/bin/env node

/**
 * CredChain Score Service
 * 
 * Microserviço de cálculo e gestão de scores de crédito
 * Integra com ElizaOS, blockchain e algoritmos de ML
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Importações internas
import { Config } from "./config";
import { Logger } from "./utils/logger";
import { DatabaseAdapter } from "./adapters/database";
import { RedisAdapter } from "./adapters/redis";
import { BlockchainAdapter } from "./adapters/blockchain";
import { ElizaOSAdapter } from "./adapters/elizaos";
import { MLAdapter } from "./adapters/ml";

// Middleware
import { authMiddleware } from "./middleware/auth";
import { validationMiddleware } from "./middleware/validation";
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./middleware/requestLogger";

// Rotas
import { scoreRoutes } from "./routes/scores";
import { calculationRoutes } from "./routes/calculations";
import { historyRoutes } from "./routes/history";
import { factorsRoutes } from "./routes/factors";
import { analyticsRoutes } from "./routes/analytics";
import { healthRoutes } from "./routes/health";

// Services
import { ScoreCalculationService } from "./services/ScoreCalculationService";
import { MLService } from "./services/MLService";
import { BlockchainService } from "./services/BlockchainService";

// Configuração
const config = new Config();
const logger = new Logger("CredChain-Score-Service");

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

        // Blockchain Adapter
        const blockchainAdapter = new BlockchainAdapter(config);
        await blockchainAdapter.connect();
        logger.info("✅ Blockchain adapter conectado");

        // ElizaOS Adapter
        const elizaOSAdapter = new ElizaOSAdapter(config);
        await elizaOSAdapter.connect();
        logger.info("✅ ElizaOS adapter conectado");

        // ML Adapter
        const mlAdapter = new MLAdapter(config);
        await mlAdapter.connect();
        logger.info("✅ ML adapter conectado");

        return {
            database: databaseAdapter,
            redis: redisAdapter,
            blockchain: blockchainAdapter,
            elizaos: elizaOSAdapter,
            ml: mlAdapter
        };

    } catch (error) {
        logger.error("❌ Erro ao inicializar adapters:", error);
        throw error;
    }
}

/**
 * Inicializa serviços
 */
function initializeServices(adapters: any) {
    logger.info("Inicializando serviços...");

    const scoreCalculationService = new ScoreCalculationService(
        adapters.database,
        adapters.redis,
        adapters.blockchain,
        adapters.elizaos
    );

    const mlService = new MLService(
        adapters.ml,
        adapters.database,
        adapters.redis
    );

    const blockchainService = new BlockchainService(
        adapters.blockchain,
        adapters.database
    );

    return {
        scoreCalculation: scoreCalculationService,
        ml: mlService,
        blockchain: blockchainService
    };
}

/**
 * Configura middleware do Express
 */
function setupMiddleware(app: express.Application) {
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

    // Rate limiting para cálculos
    const calculationRateLimit = rateLimit({
        windowMs: 60 * 1000, // 1 minuto
        max: 10, // máximo 10 cálculos por minuto por usuário
        message: {
            error: "Too Many Calculations",
            message: "Too many score calculations. Please wait before trying again."
        },
        keyGenerator: (req) => {
            return req.user?.id || req.ip;
        }
    });

    // Parser JSON
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    app.use(requestLogger);

    return { globalRateLimit, calculationRateLimit };
}

/**
 * Configura rotas da API
 */
function setupRoutes(app: express.Application, adapters: any, services: any, calculationRateLimit: any) {
    // Health check (sem rate limiting)
    app.use("/health", healthRoutes);

    // Rotas protegidas
    app.use("/scores", authMiddleware, scoreRoutes);
    app.use("/calculations", authMiddleware, calculationRateLimit, calculationRoutes);
    app.use("/history", authMiddleware, historyRoutes);
    app.use("/factors", authMiddleware, factorsRoutes);
    app.use("/analytics", authMiddleware, analyticsRoutes);

    // Middleware de validação
    app.use(validationMiddleware);

    // Error handler
    app.use(errorHandler);
}

/**
 * Configura background jobs
 */
function setupBackgroundJobs(services: any) {
    logger.info("Configurando background jobs...");

    // Job para recalcular scores periodicamente
    setInterval(async () => {
        try {
            await services.scoreCalculation.recalculateStaleScores();
            logger.info("✅ Background job: Scores recalculados");
        } catch (error) {
            logger.error("❌ Erro no background job de scores:", error);
        }
    }, 60 * 60 * 1000); // A cada hora

    // Job para treinar modelos ML
    setInterval(async () => {
        try {
            await services.ml.retrainModels();
            logger.info("✅ Background job: Modelos ML retreinados");
        } catch (error) {
            logger.error("❌ Erro no background job de ML:", error);
        }
    }, 24 * 60 * 60 * 1000); // A cada 24 horas

    // Job para sincronizar com blockchain
    setInterval(async () => {
        try {
            await services.blockchain.syncPendingTransactions();
            logger.info("✅ Background job: Blockchain sincronizado");
        } catch (error) {
            logger.error("❌ Erro no background job de blockchain:", error);
        }
    }, 5 * 60 * 1000); // A cada 5 minutos

    logger.info("✅ Background jobs configurados");
}

/**
 * Função principal
 */
async function main() {
    try {
        logger.info("🚀 Iniciando CredChain Score Service...");

        // Valida configurações
        const validation = config.validate();
        if (!validation.valid) {
            logger.error("❌ Configurações inválidas:", validation.errors);
            process.exit(1);
        }

        // Inicializa adapters
        const adapters = await initializeAdapters();

        // Inicializa serviços
        const services = initializeServices(adapters);

        // Configura Express
        const app = express();

        // Middleware
        const { calculationRateLimit } = setupMiddleware(app);

        // Rotas
        setupRoutes(app, adapters, services, calculationRateLimit);

        // Background jobs
        setupBackgroundJobs(services);

        // Inicia servidor
        const port = config.get("PORT", "3002");
        app.listen(port, () => {
            logger.info(`✅ Score Service rodando na porta ${port}`);
            logger.info(`📊 Health check: http://localhost:${port}/health`);
            logger.info(`📈 Score endpoints: http://localhost:${port}/scores`);
            logger.info(`🧮 Calculation endpoints: http://localhost:${port}/calculations`);
            logger.info(`📚 History endpoints: http://localhost:${port}/history`);
            logger.info(`🔍 Analytics endpoints: http://localhost:${port}/analytics`);
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            logger.info("🛑 Recebido SIGINT, encerrando graciosamente...");
            await Promise.all([
                adapters.database?.disconnect(),
                adapters.redis?.disconnect(),
                adapters.blockchain?.disconnect(),
                adapters.elizaos?.disconnect(),
                adapters.ml?.disconnect()
            ]);
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            logger.info("🛑 Recebido SIGTERM, encerrando graciosamente...");
            await Promise.all([
                adapters.database?.disconnect(),
                adapters.redis?.disconnect(),
                adapters.blockchain?.disconnect(),
                adapters.elizaos?.disconnect(),
                adapters.ml?.disconnect()
            ]);
            process.exit(0);
        });

    } catch (error) {
        logger.error("❌ Erro fatal ao inicializar Score Service:", error);
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

export { main, initializeAdapters, initializeServices, setupMiddleware, setupRoutes, setupBackgroundJobs };
