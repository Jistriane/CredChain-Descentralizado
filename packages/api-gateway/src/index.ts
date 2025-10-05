#!/usr/bin/env node

/**
 * CredChain API Gateway
 * 
 * Gateway principal que integra REST, GraphQL, WebSocket e gRPC
 * Coordena todos os microserviços e ElizaOS agents
 */

import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "graphql";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import prometheus from "express-prometheus-middleware";

// Importações internas
import { Config } from "./config";
import { Logger } from "./utils/logger";
import { DatabaseAdapter } from "./adapters/database";
import { RedisAdapter } from "./adapters/redis";
import { BlockchainAdapter } from "./adapters/blockchain";
import { ElizaOSAdapter } from "./adapters/elizaos";

// Middleware
import { authMiddleware } from "./middleware/auth";
import { validationMiddleware } from "./middleware/validation";
import { errorHandler } from "./middleware/error";
import { requestLogger } from "./middleware/requestLogger";

// Rotas
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { scoreRoutes } from "./routes/scores";
import { paymentRoutes } from "./routes/payments";
import { analyticsRoutes } from "./routes/analytics";
import { complianceRoutes } from "./routes/compliance";
import { healthRoutes } from "./routes/health";

// GraphQL
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schema";

// WebSocket
import { setupWebSocket } from "./websocket/websocket";
import { setupSocketIO } from "./websocket/socketio";

// gRPC
import { setupGRPC } from "./grpc/server";

// Configuração
const config = new Config();
const logger = new Logger("CredChain-API-Gateway");

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

        return {
            database: databaseAdapter,
            redis: redisAdapter,
            blockchain: blockchainAdapter,
            elizaos: elizaOSAdapter
        };

    } catch (error) {
        logger.error("❌ Erro ao inicializar adapters:", error);
        throw error;
    }
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

    // Rate limiting por endpoint
    const endpointRateLimit = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: 100, // máximo 100 requests por IP
        message: {
            error: "Too Many Requests",
            message: "Rate limit exceeded for this endpoint."
        }
    });

    // Parser JSON
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    app.use(requestLogger);

    // Prometheus metrics
    app.use(prometheus({
        metricsPath: "/metrics",
        collectDefaultMetrics: true,
        requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 3, 5, 10],
        requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    }));

    return { globalRateLimit, endpointRateLimit };
}

/**
 * Configura rotas da API
 */
function setupRoutes(app: express.Application, adapters: any) {
    // Health check (sem rate limiting)
    app.use("/health", healthRoutes);

    // Rotas com autenticação
    app.use("/api/auth", authRoutes);
    app.use("/api/users", authMiddleware, userRoutes);
    app.use("/api/scores", authMiddleware, scoreRoutes);
    app.use("/api/payments", authMiddleware, paymentRoutes);
    app.use("/api/analytics", authMiddleware, analyticsRoutes);
    app.use("/api/compliance", authMiddleware, complianceRoutes);

    // Middleware de validação
    app.use(validationMiddleware);

    // Error handler
    app.use(errorHandler);
}

/**
 * Configura GraphQL
 */
async function setupGraphQL(app: express.Application, adapters: any) {
    const schema = buildSchema(typeDefs);
    
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({
            user: req.user,
            adapters,
            logger
        }),
        introspection: config.get("NODE_ENV") === "development",
        playground: config.get("NODE_ENV") === "development"
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: "/graphql" });

    logger.info("✅ GraphQL configurado em /graphql");
}

/**
 * Configura Swagger/OpenAPI
 */
function setupSwagger(app: express.Application) {
    const swaggerOptions = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "CredChain API",
                version: "1.0.0",
                description: "API Gateway para sistema de credit scoring descentralizado",
                contact: {
                    name: "CredChain Team",
                    email: "dev@credchain.io",
                    url: "https://credchain.io"
                },
                license: {
                    name: "MIT",
                    url: "https://opensource.org/licenses/MIT"
                }
            },
            servers: [
                {
                    url: "http://localhost:4000",
                    description: "Development server"
                },
                {
                    url: "https://api.credchain.io",
                    description: "Production server"
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            }
        },
        apis: ["./src/routes/*.ts", "./src/graphql/*.ts"]
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "CredChain API Documentation"
    }));

    logger.info("✅ Swagger configurado em /api-docs");
}

/**
 * Configura WebSocket
 */
function setupWebSockets(server: any, adapters: any) {
    // WebSocket nativo
    const wss = new WebSocketServer({ 
        server,
        path: "/ws"
    });
    setupWebSocket(wss, adapters, logger);

    // Socket.IO
    const io = new SocketIOServer(server, {
        cors: {
            origin: config.get("CORS_ORIGIN", "http://localhost:3001"),
            methods: ["GET", "POST"]
        },
        path: "/socket.io"
    });
    setupSocketIO(io, adapters, logger);

    logger.info("✅ WebSocket configurado em /ws e /socket.io");
}

/**
 * Configura gRPC
 */
async function setupGRPCServer(adapters: any) {
    const grpcPort = config.get("GRPC_PORT", "50051");
    await setupGRPC(grpcPort, adapters, logger);
    logger.info(`✅ gRPC configurado na porta ${grpcPort}`);
}

/**
 * Função principal
 */
async function main() {
    try {
        logger.info("🚀 Iniciando CredChain API Gateway...");

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
        const server = createServer(app);

        // Middleware
        setupMiddleware(app);

        // Rotas
        setupRoutes(app, adapters);

        // GraphQL
        await setupGraphQL(app, adapters);

        // Swagger
        setupSwagger(app);

        // WebSocket
        setupWebSockets(server, adapters);

        // gRPC
        await setupGRPCServer(adapters);

        // Inicia servidor
        const port = config.get("PORT", "4000");
        server.listen(port, () => {
            logger.info(`✅ API Gateway rodando na porta ${port}`);
            logger.info(`📊 Health check: http://localhost:${port}/health`);
            logger.info(`🔌 REST API: http://localhost:${port}/api`);
            logger.info(`📈 GraphQL: http://localhost:${port}/graphql`);
            logger.info(`📚 Swagger: http://localhost:${port}/api-docs`);
            logger.info(`📊 Metrics: http://localhost:${port}/metrics`);
            logger.info(`🔌 WebSocket: ws://localhost:${port}/ws`);
            logger.info(`🔌 Socket.IO: ws://localhost:${port}/socket.io`);
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            logger.info("🛑 Recebido SIGINT, encerrando graciosamente...");
            await Promise.all([
                adapters.database?.disconnect(),
                adapters.redis?.disconnect(),
                adapters.blockchain?.disconnect(),
                adapters.elizaos?.disconnect()
            ]);
            server.close(() => {
                logger.info("✅ Servidor encerrado");
                process.exit(0);
            });
        });

        process.on("SIGTERM", async () => {
            logger.info("🛑 Recebido SIGTERM, encerrando graciosamente...");
            await Promise.all([
                adapters.database?.disconnect(),
                adapters.redis?.disconnect(),
                adapters.blockchain?.disconnect(),
                adapters.elizaos?.disconnect()
            ]);
            server.close(() => {
                logger.info("✅ Servidor encerrado");
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error("❌ Erro fatal ao inicializar API Gateway:", error);
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

export { main, initializeAdapters, setupMiddleware, setupRoutes, setupGraphQL, setupSwagger, setupWebSockets };
