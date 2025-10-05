# 📚 CredChain - Technical Documentation

## 🌍 Languages / Idiomas / Idiomas

- [🇧🇷 Português](#-português)
- [🇺🇸 English](#-english)
- [🇪🇸 Español](#-español)

---

## 🇧🇷 Português

### 📚 CredChain - Documentação Técnica

## 🏗️ Arquitetura do Sistema

### Visão Geral

O CredChain é um sistema descentralizado de credit scoring que combina **ElizaOS** (agentes de IA especializados) com **Polkadot/Substrate** (blockchain) para criar uma plataforma transparente, justa e verificável de avaliação de crédito.

### Componentes Principais

#### 1. **Camada de IA - ElizaOS**
- **Orchestrator Agent**: Coordena todos os sub-agentes
- **Credit Analyzer**: Calcula scores baseado em múltiplos fatores
- **Compliance Guardian**: Garante conformidade com LGPD/GDPR
- **Fraud Detector**: Detecta padrões suspeitos em tempo real
- **User Assistant**: Suporte e educação financeira
- **Financial Advisor**: Recomendações personalizadas

#### 2. **Camada Blockchain - Polkadot/Substrate**
- **Custom Pallets**: 
  - `pallet-credit-score`: Registro e cálculo de scores
  - `pallet-payment-registry`: Histórico de pagamentos
  - `pallet-identity-verification`: Verificação de identidade
  - `pallet-oracle-integration`: Integração com oráculos externos
- **Smart Contracts**: Lógica de negócio imutável
- **XCM**: Comunicação cross-chain
- **Off-chain Workers**: Processamento assíncrono

#### 3. **Camada de APIs**
- **REST API**: Operações CRUD básicas
- **GraphQL**: Consultas complexas e flexíveis
- **WebSocket**: Atualizações em tempo real
- **gRPC**: Comunicação entre microserviços

#### 4. **Camada de Dados**
- **PostgreSQL**: Dados transacionais e relacionais
- **MongoDB**: Logs de IA e analytics
- **Redis**: Cache e filas
- **IPFS/Arweave**: Armazenamento descentralizado

## 🔧 Configuração do Ambiente

### Pré-requisitos

```bash
# Docker e Docker Compose
docker --version
docker-compose --version

# Node.js 18+
node --version

# Rust (para desenvolvimento blockchain)
rustc --version
```

### Setup Automático

```bash
# Clone o repositório
git clone <repository-url>
cd "CredChain Descentralizado"

# Execute o script de setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Setup Manual

```bash
# 1. Configure variáveis de ambiente
cp env.example .env
# Edite .env com suas chaves de API

# 2. Inicie os serviços
docker-compose up -d

# 3. Verifique status
docker-compose ps
```

## 🚀 Desenvolvimento

### Estrutura do Projeto

```
credchain/
├── packages/
│   ├── eliza-runtime/          # ElizaOS Agents
│   │   ├── src/
│   │   │   ├── agents/         # Agentes especializados
│   │   │   ├── adapters/       # Adaptadores de dados
│   │   │   ├── utils/          # Utilitários
│   │   │   └── index.ts        # Ponto de entrada
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-gateway/            # API Backend
│   │   ├── src/
│   │   │   ├── routes/         # Rotas da API
│   │   │   ├── middleware/     # Middleware
│   │   │   ├── services/       # Serviços de negócio
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web-frontend/           # Next.js Dashboard
│   │   ├── src/
│   │   │   ├── components/      # Componentes React
│   │   │   ├── pages/          # Páginas
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── utils/          # Utilitários
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── mobile-backend/         # React Native
│   │   ├── src/
│   │   │   ├── screens/        # Telas
│   │   │   ├── components/     # Componentes
│   │   │   ├── navigation/     # Navegação
│   │   │   └── services/        # Serviços
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── substrate-node/         # Blockchain Node
│   │   ├── pallets/            # Pallets customizados
│   │   │   ├── pallet-credit-score/
│   │   │   ├── pallet-payment-registry/
│   │   │   ├── pallet-identity-verification/
│   │   │   └── pallet-oracle-integration/
│   │   ├── runtime/            # Runtime do Substrate
│   │   ├── node/               # Node binary
│   │   └── Cargo.toml
│   │
│   └── database/               # Database Scripts
│       ├── init/               # Scripts de inicialização
│       ├── migrations/         # Migrações
│       └── seeds/               # Dados iniciais
│
├── docker-compose.yml          # Ambiente completo
├── env.example                 # Variáveis de ambiente
├── README.md                   # Documentação principal
└── TECHNICAL_DOCS.md          # Esta documentação
```

### Comandos de Desenvolvimento

```bash
# Desenvolvimento geral
docker-compose up -d                    # Inicia todos os serviços
docker-compose logs -f [service]      # Logs de um serviço específico
docker-compose restart [service]      # Reinicia um serviço
docker-compose down                    # Para todos os serviços

# Desenvolvimento blockchain
cd packages/substrate-node
cargo build                           # Compila o node
cargo test                           # Executa testes
cargo run -- --dev                   # Executa em modo desenvolvimento

# Desenvolvimento ElizaOS
cd packages/eliza-runtime
npm run dev                          # Modo desenvolvimento
npm run build                        # Build para produção
npm test                            # Executa testes

# Desenvolvimento API
cd packages/api-gateway
npm run dev                          # Modo desenvolvimento
npm run build                        # Build para produção
npm test                            # Executa testes

# Desenvolvimento Frontend
cd packages/web-frontend
npm run dev                          # Modo desenvolvimento
npm run build                        # Build para produção
npm test                            # Executa testes
```

## 🔒 Segurança e Compliance

### LGPD (Lei Geral de Proteção de Dados)

```typescript
// Exemplo de implementação LGPD
interface LGPDCompliance {
  // Art. 7º - Base legal para tratamento
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  
  // Art. 9º - Consentimento
  consent: {
    explicit: boolean;
    specific: boolean;
    informed: boolean;
    free: boolean;
    timestamp: Date;
  };
  
  // Art. 18º - Direitos do titular
  dataSubjectRights: {
    access: boolean;      // Acesso aos dados
    rectification: boolean; // Correção
    erasure: boolean;     // Exclusão (direito ao esquecimento)
    portability: boolean;  // Portabilidade
    restriction: boolean; // Limitação do tratamento
    objection: boolean;   // Oposição
  };
  
  // Art. 46 - Segurança
  security: {
    encryption: boolean;
    accessControl: boolean;
    auditLog: boolean;
    dataMinimization: boolean;
  };
}
```

### GDPR (General Data Protection Regulation)

```typescript
// Exemplo de implementação GDPR
interface GDPRCompliance {
  // Art. 17 - Right to be forgotten
  rightToBeForgotten: {
    enabled: boolean;
    retentionPeriod: number; // em dias
    automaticDeletion: boolean;
  };
  
  // Art. 20 - Data portability
  dataPortability: {
    enabled: boolean;
    formats: string[]; // ['json', 'csv', 'xml']
    apiAccess: boolean;
  };
  
  // Art. 25 - Privacy by design
  privacyByDesign: {
    dataMinimization: boolean;
    purposeLimitation: boolean;
    storageLimitation: boolean;
    accuracy: boolean;
  };
}
```

### Basel III Compliance

```typescript
// Exemplo de implementação Basel III
interface BaselIIICompliance {
  // Capital Requirements
  capitalRequirements: {
    tier1Capital: number;
    tier2Capital: number;
    riskWeightedAssets: number;
    capitalAdequacyRatio: number; // Mínimo 8%
  };
  
  // Risk Management
  riskManagement: {
    creditRisk: {
      probabilityOfDefault: number;
      lossGivenDefault: number;
      exposureAtDefault: number;
    };
    operationalRisk: {
      internalLossData: boolean;
      externalLossData: boolean;
      scenarioAnalysis: boolean;
    };
  };
  
  // Liquidity Requirements
  liquidity: {
    liquidityCoverageRatio: number; // Mínimo 100%
    netStableFundingRatio: number;  // Mínimo 100%
  };
}
```

## 📊 Monitoramento e Observabilidade

### Métricas Principais

```typescript
interface SystemMetrics {
  // Performance
  performance: {
    responseTime: number;        // ms
    throughput: number;         // requests/second
    errorRate: number;          // percentage
    availability: number;       // percentage
  };
  
  // Business
  business: {
    totalUsers: number;
    activeUsers: number;
    scoresCalculated: number;
    fraudDetected: number;
    complianceViolations: number;
  };
  
  // Technical
  technical: {
    databaseConnections: number;
    redisMemoryUsage: number;
    blockchainSyncStatus: string;
    aiModelAccuracy: number;
  };
}
```

### Logs Estruturados

```typescript
interface StructuredLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata: Record<string, any>;
  message: string;
}
```

## 🧪 Testes

### Estratégia de Testes

```bash
# Testes Unitários
npm run test:unit

# Testes de Integração
npm run test:integration

# Testes End-to-End
npm run test:e2e

# Testes de Performance
npm run test:performance

# Testes de Segurança
npm run test:security
```

### Cobertura de Testes

```typescript
// Exemplo de teste unitário
describe('Credit Score Calculation', () => {
  it('should calculate score correctly', async () => {
    const factors = [
      { type: 'payment_history', value: 95, weight: 35 },
      { type: 'credit_utilization', value: 80, weight: 30 },
      { type: 'credit_age', value: 70, weight: 15 },
      { type: 'credit_mix', value: 85, weight: 10 },
      { type: 'new_credit', value: 90, weight: 10 }
    ];
    
    const score = await calculateCreditScore(factors);
    expect(score).toBe(85); // Score esperado
  });
});
```

## 🚀 Deploy e Produção

### Ambientes

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  substrate-node:
    image: credchain/substrate-node:latest
    environment:
      - NODE_ENV=production
      - CHAIN=polkadot
      - PARACHAIN_ID=2000
    
  eliza-runtime:
    image: credchain/eliza-runtime:latest
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    
  api-gateway:
    image: credchain/api-gateway:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run security scan
        run: npm audit
```

## 📈 Performance e Escalabilidade

### Otimizações Implementadas

1. **Cache Redis**: Scores calculados são cacheados por 1 hora
2. **Connection Pooling**: Pool de conexões para PostgreSQL
3. **Indexação**: Índices otimizados para consultas frequentes
4. **CDN**: Assets estáticos servidos via CDN
5. **Load Balancing**: Distribuição de carga entre instâncias

### Métricas de Performance

```typescript
interface PerformanceTargets {
  // Latência
  latency: {
    apiResponse: 200;      // ms
    scoreCalculation: 500; // ms
    blockchainTx: 2000;    // ms
  };
  
  // Throughput
  throughput: {
    apiRequests: 1000;     // requests/second
    scoreCalculations: 100; // calculations/second
    blockchainTxs: 50;      // transactions/second
  };
  
  // Disponibilidade
  availability: {
    target: 99.9;          // percentage
    downtime: 8.76;        // hours/year
  };
}
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Docker não inicia**
   ```bash
   # Verifica se Docker está rodando
   docker ps
   
   # Reinicia Docker
   sudo systemctl restart docker
   ```

2. **Banco de dados não conecta**
   ```bash
   # Verifica logs do PostgreSQL
   docker-compose logs postgres
   
   # Testa conexão
   docker-compose exec postgres psql -U credchain -d credchain
   ```

3. **Blockchain não sincroniza**
   ```bash
   # Verifica logs do Substrate
   docker-compose logs substrate-node
   
   # Reinicia node
   docker-compose restart substrate-node
   ```

4. **ElizaOS não responde**
   ```bash
   # Verifica logs do ElizaOS
   docker-compose logs eliza-runtime
   
   # Testa health check
   curl http://localhost:3000/health
   ```

### Logs Úteis

```bash
# Logs gerais
docker-compose logs -f

# Logs específicos
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f substrate-node
docker-compose logs -f eliza-runtime
docker-compose logs -f api-gateway
```

## 📚 Recursos Adicionais

### Documentação Externa

- [ElizaOS Documentation](https://elizaos.ai/)
- [Polkadot Documentation](https://polkadot.network/docs/)
- [Substrate Documentation](https://substrate.dev/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

### Comunidade

- [CredChain Discord](https://discord.gg/credchain)
- [GitHub Issues](https://github.com/credchain/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/credchain)

### Suporte

- **Email**: support@credchain.io
- **Documentação**: docs.credchain.io
- **Status Page**: status.credchain.io

---

## 🇺🇸 English

### 📚 CredChain - Technical Documentation

## 🏗️ System Architecture

### Overview

CredChain is a decentralized credit scoring system that combines **ElizaOS** (specialized AI agents) with **Polkadot/Substrate** (blockchain) to create a transparent, fair, and verifiable credit evaluation platform.

### Main Components

#### 1. **AI Layer - ElizaOS**
- **Orchestrator Agent**: Coordinates all sub-agents
- **Credit Analyzer**: Calculates scores based on multiple factors
- **Compliance Guardian**: Ensures LGPD/GDPR compliance
- **Fraud Detector**: Detects suspicious patterns in real-time
- **User Assistant**: Support and financial education
- **Financial Advisor**: Personalized recommendations

#### 2. **Blockchain Layer - Polkadot/Substrate**
- **Custom Pallets**: 
  - `pallet-credit-score`: Score registration and calculation
  - `pallet-payment-registry`: Payment history
  - `pallet-identity-verification`: Identity verification
  - `pallet-oracle-integration`: External oracle integration
- **Smart Contracts**: Immutable business logic
- **XCM**: Cross-chain communication
- **Off-chain Workers**: Asynchronous processing

#### 3. **API Layer**
- **REST API**: Basic CRUD operations
- **GraphQL**: Complex and flexible queries
- **WebSocket**: Real-time updates
- **gRPC**: Inter-microservice communication

#### 4. **Data Layer**
- **PostgreSQL**: Transactional and relational data
- **MongoDB**: AI logs and analytics
- **Redis**: Cache and queues
- **IPFS/Arweave**: Decentralized storage

## 🔧 Environment Configuration

### Prerequisites

```bash
# Docker and Docker Compose
docker --version
docker-compose --version

# Node.js 18+
node --version

# Rust (for blockchain development)
rustc --version
```

### Automatic Setup

```bash
# Clone the repository
git clone <repository-url>
cd "CredChain Descentralizado"

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

```bash
# 1. Configure environment variables
cp env.example .env
# Edit .env with your API keys

# 2. Start services
docker-compose up -d

# 3. Check status
docker-compose ps
```

## 🚀 Development

### Project Structure

```
credchain/
├── packages/
│   ├── eliza-runtime/          # ElizaOS Agents
│   │   ├── src/
│   │   │   ├── agents/         # Specialized agents
│   │   │   ├── adapters/       # Data adapters
│   │   │   ├── utils/          # Utilities
│   │   │   └── index.ts        # Entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-gateway/            # API Backend
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Middleware
│   │   │   ├── services/       # Business services
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web-frontend/           # Next.js Dashboard
│   │   ├── src/
│   │   │   ├── components/      # React components
│   │   │   ├── pages/          # Pages
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── utils/          # Utilities
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── mobile-backend/         # React Native
│   │   ├── src/
│   │   │   ├── screens/        # Screens
│   │   │   ├── components/     # Components
│   │   │   ├── navigation/     # Navigation
│   │   │   └── services/        # Services
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── substrate-node/         # Blockchain Node
│   │   ├── pallets/            # Custom pallets
│   │   │   ├── pallet-credit-score/
│   │   │   ├── pallet-payment-registry/
│   │   │   ├── pallet-identity-verification/
│   │   │   └── pallet-oracle-integration/
│   │   ├── runtime/            # Substrate runtime
│   │   ├── node/               # Node binary
│   │   └── Cargo.toml
│   │
│   └── database/               # Database Scripts
│       ├── init/               # Initialization scripts
│       ├── migrations/         # Migrations
│       └── seeds/               # Initial data
│
├── docker-compose.yml          # Complete environment
├── env.example                 # Environment variables
├── README.md                   # Main documentation
└── TECHNICAL_DOCS.md          # This documentation
```

### Development Commands

```bash
# General development
docker-compose up -d                    # Start all services
docker-compose logs -f [service]      # Logs from specific service
docker-compose restart [service]      # Restart a service
docker-compose down                    # Stop all services

# Blockchain development
cd packages/substrate-node
cargo build                           # Compile the node
cargo test                           # Run tests
cargo run -- --dev                   # Run in development mode

# ElizaOS development
cd packages/eliza-runtime
npm run dev                          # Development mode
npm run build                        # Production build
npm test                            # Run tests

# API development
cd packages/api-gateway
npm run dev                          # Development mode
npm run build                        # Production build
npm test                            # Run tests

# Frontend development
cd packages/web-frontend
npm run dev                          # Development mode
npm run build                        # Production build
npm test                            # Run tests
```

## 🔒 Security and Compliance

### LGPD (Lei Geral de Proteção de Dados)

```typescript
// LGPD implementation example
interface LGPDCompliance {
  // Art. 7º - Legal basis for processing
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  
  // Art. 9º - Consent
  consent: {
    explicit: boolean;
    specific: boolean;
    informed: boolean;
    free: boolean;
    timestamp: Date;
  };
  
  // Art. 18º - Data subject rights
  dataSubjectRights: {
    access: boolean;      // Data access
    rectification: boolean; // Correction
    erasure: boolean;     // Deletion (right to be forgotten)
    portability: boolean;  // Portability
    restriction: boolean; // Processing limitation
    objection: boolean;   // Objection
  };
  
  // Art. 46 - Security
  security: {
    encryption: boolean;
    accessControl: boolean;
    auditLog: boolean;
    dataMinimization: boolean;
  };
}
```

### GDPR (General Data Protection Regulation)

```typescript
// GDPR implementation example
interface GDPRCompliance {
  // Art. 17 - Right to be forgotten
  rightToBeForgotten: {
    enabled: boolean;
    retentionPeriod: number; // in days
    automaticDeletion: boolean;
  };
  
  // Art. 20 - Data portability
  dataPortability: {
    enabled: boolean;
    formats: string[]; // ['json', 'csv', 'xml']
    apiAccess: boolean;
  };
  
  // Art. 25 - Privacy by design
  privacyByDesign: {
    dataMinimization: boolean;
    purposeLimitation: boolean;
    storageLimitation: boolean;
    accuracy: boolean;
  };
}
```

### Basel III Compliance

```typescript
// Basel III implementation example
interface BaselIIICompliance {
  // Capital Requirements
  capitalRequirements: {
    tier1Capital: number;
    tier2Capital: number;
    riskWeightedAssets: number;
    capitalAdequacyRatio: number; // Minimum 8%
  };
  
  // Risk Management
  riskManagement: {
    creditRisk: {
      probabilityOfDefault: number;
      lossGivenDefault: number;
      exposureAtDefault: number;
    };
    operationalRisk: {
      internalLossData: boolean;
      externalLossData: boolean;
      scenarioAnalysis: boolean;
    };
  };
  
  // Liquidity Requirements
  liquidity: {
    liquidityCoverageRatio: number; // Minimum 100%
    netStableFundingRatio: number;  // Minimum 100%
  };
}
```

## 📊 Monitoring and Observability

### Key Metrics

```typescript
interface SystemMetrics {
  // Performance
  performance: {
    responseTime: number;        // ms
    throughput: number;         // requests/second
    errorRate: number;          // percentage
    availability: number;       // percentage
  };
  
  // Business
  business: {
    totalUsers: number;
    activeUsers: number;
    scoresCalculated: number;
    fraudDetected: number;
    complianceViolations: number;
  };
  
  // Technical
  technical: {
    databaseConnections: number;
    redisMemoryUsage: number;
    blockchainSyncStatus: string;
    aiModelAccuracy: number;
  };
}
```

### Structured Logs

```typescript
interface StructuredLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata: Record<string, any>;
  message: string;
}
```

## 🧪 Testing

### Testing Strategy

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# End-to-End Tests
npm run test:e2e

# Performance Tests
npm run test:performance

# Security Tests
npm run test:security
```

### Test Coverage

```typescript
// Unit test example
describe('Credit Score Calculation', () => {
  it('should calculate score correctly', async () => {
    const factors = [
      { type: 'payment_history', value: 95, weight: 35 },
      { type: 'credit_utilization', value: 80, weight: 30 },
      { type: 'credit_age', value: 70, weight: 15 },
      { type: 'credit_mix', value: 85, weight: 10 },
      { type: 'new_credit', value: 90, weight: 10 }
    ];
    
    const score = await calculateCreditScore(factors);
    expect(score).toBe(85); // Expected score
  });
});
```

## 🚀 Deploy and Production

### Environments

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  substrate-node:
    image: credchain/substrate-node:latest
    environment:
      - NODE_ENV=production
      - CHAIN=polkadot
      - PARACHAIN_ID=2000
    
  eliza-runtime:
    image: credchain/eliza-runtime:latest
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    
  api-gateway:
    image: credchain/api-gateway:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run security scan
        run: npm audit
```

## 📈 Performance and Scalability

### Implemented Optimizations

1. **Redis Cache**: Calculated scores cached for 1 hour
2. **Connection Pooling**: Connection pool for PostgreSQL
3. **Indexing**: Optimized indexes for frequent queries
4. **CDN**: Static assets served via CDN
5. **Load Balancing**: Load distribution between instances

### Performance Metrics

```typescript
interface PerformanceTargets {
  // Latency
  latency: {
    apiResponse: 200;      // ms
    scoreCalculation: 500; // ms
    blockchainTx: 2000;    // ms
  };
  
  // Throughput
  throughput: {
    apiRequests: 1000;     // requests/second
    scoreCalculations: 100; // calculations/second
    blockchainTxs: 50;      // transactions/second
  };
  
  // Availability
  availability: {
    target: 99.9;          // percentage
    downtime: 8.76;        // hours/year
  };
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Docker won't start**
   ```bash
   # Check if Docker is running
   docker ps
   
   # Restart Docker
   sudo systemctl restart docker
   ```

2. **Database won't connect**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U credchain -d credchain
   ```

3. **Blockchain won't sync**
   ```bash
   # Check Substrate logs
   docker-compose logs substrate-node
   
   # Restart node
   docker-compose restart substrate-node
   ```

4. **ElizaOS not responding**
   ```bash
   # Check ElizaOS logs
   docker-compose logs eliza-runtime
   
   # Test health check
   curl http://localhost:3000/health
   ```

### Useful Logs

```bash
# General logs
docker-compose logs -f

# Specific logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f substrate-node
docker-compose logs -f eliza-runtime
docker-compose logs -f api-gateway
```

## 📚 Additional Resources

### External Documentation

- [ElizaOS Documentation](https://elizaos.ai/)
- [Polkadot Documentation](https://polkadot.network/docs/)
- [Substrate Documentation](https://substrate.dev/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

### Community

- [CredChain Discord](https://discord.gg/credchain)
- [GitHub Issues](https://github.com/credchain/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/credchain)

### Support

- **Email**: support@credchain.io
- **Documentation**: docs.credchain.io
- **Status Page**: status.credchain.io

---

## 🇪🇸 Español

### 📚 CredChain - Documentación Técnica

## 🏗️ Arquitectura del Sistema

### Visión General

CredChain es un sistema descentralizado de credit scoring que combina **ElizaOS** (agentes de IA especializados) con **Polkadot/Substrate** (blockchain) para crear una plataforma transparente, justa y verificable de evaluación crediticia.

### Componentes Principales

#### 1. **Capa de IA - ElizaOS**
- **Orchestrator Agent**: Coordina todos los sub-agentes
- **Credit Analyzer**: Calcula scores basado en múltiples factores
- **Compliance Guardian**: Garantiza cumplimiento con LGPD/GDPR
- **Fraud Detector**: Detecta patrones sospechosos en tiempo real
- **User Assistant**: Soporte y educación financiera
- **Financial Advisor**: Recomendaciones personalizadas

#### 2. **Capa Blockchain - Polkadot/Substrate**
- **Custom Pallets**: 
  - `pallet-credit-score`: Registro y cálculo de scores
  - `pallet-payment-registry`: Historial de pagos
  - `pallet-identity-verification`: Verificación de identidad
  - `pallet-oracle-integration`: Integración con oráculos externos
- **Smart Contracts**: Lógica de negocio inmutable
- **XCM**: Comunicación cross-chain
- **Off-chain Workers**: Procesamiento asíncrono

#### 3. **Capa de APIs**
- **REST API**: Operaciones CRUD básicas
- **GraphQL**: Consultas complejas y flexibles
- **WebSocket**: Actualizaciones en tiempo real
- **gRPC**: Comunicación entre microservicios

#### 4. **Capa de Datos**
- **PostgreSQL**: Datos transaccionales y relacionales
- **MongoDB**: Logs de IA y analytics
- **Redis**: Cache y colas
- **IPFS/Arweave**: Almacenamiento descentralizado

## 🔧 Configuración del Entorno

### Prerrequisitos

```bash
# Docker y Docker Compose
docker --version
docker-compose --version

# Node.js 18+
node --version

# Rust (para desarrollo blockchain)
rustc --version
```

### Configuración Automática

```bash
# Clonar el repositorio
git clone <repository-url>
cd "CredChain Descentralizado"

# Ejecutar script de configuración
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Configuración Manual

```bash
# 1. Configurar variables de entorno
cp env.example .env
# Editar .env con tus claves de API

# 2. Iniciar servicios
docker-compose up -d

# 3. Verificar estado
docker-compose ps
```

## 🚀 Desarrollo

### Estructura del Proyecto

```
credchain/
├── packages/
│   ├── eliza-runtime/          # Agentes ElizaOS
│   │   ├── src/
│   │   │   ├── agents/         # Agentes especializados
│   │   │   ├── adapters/       # Adaptadores de datos
│   │   │   ├── utils/          # Utilidades
│   │   │   └── index.ts        # Punto de entrada
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api-gateway/            # Backend API
│   │   ├── src/
│   │   │   ├── routes/         # Rutas de API
│   │   │   ├── middleware/     # Middleware
│   │   │   ├── services/       # Servicios de negocio
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web-frontend/           # Dashboard Next.js
│   │   ├── src/
│   │   │   ├── components/      # Componentes React
│   │   │   ├── pages/          # Páginas
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── utils/          # Utilidades
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── mobile-backend/         # React Native
│   │   ├── src/
│   │   │   ├── screens/        # Pantallas
│   │   │   ├── components/     # Componentes
│   │   │   ├── navigation/     # Navegación
│   │   │   └── services/        # Servicios
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── substrate-node/         # Nodo Blockchain
│   │   ├── pallets/            # Pallets personalizados
│   │   │   ├── pallet-credit-score/
│   │   │   ├── pallet-payment-registry/
│   │   │   ├── pallet-identity-verification/
│   │   │   └── pallet-oracle-integration/
│   │   ├── runtime/            # Runtime de Substrate
│   │   ├── node/               # Binario del nodo
│   │   └── Cargo.toml
│   │
│   └── database/               # Scripts de Base de Datos
│       ├── init/               # Scripts de inicialización
│       ├── migrations/         # Migraciones
│       └── seeds/               # Datos iniciales
│
├── docker-compose.yml          # Entorno completo
├── env.example                 # Variables de entorno
├── README.md                   # Documentación principal
└── TECHNICAL_DOCS.md          # Esta documentación
```

### Comandos de Desarrollo

```bash
# Desarrollo general
docker-compose up -d                    # Iniciar todos los servicios
docker-compose logs -f [service]      # Logs de un servicio específico
docker-compose restart [service]      # Reiniciar un servicio
docker-compose down                    # Parar todos los servicios

# Desarrollo blockchain
cd packages/substrate-node
cargo build                           # Compilar el nodo
cargo test                           # Ejecutar pruebas
cargo run -- --dev                   # Ejecutar en modo desarrollo

# Desarrollo ElizaOS
cd packages/eliza-runtime
npm run dev                          # Modo desarrollo
npm run build                        # Build para producción
npm test                            # Ejecutar pruebas

# Desarrollo API
cd packages/api-gateway
npm run dev                          # Modo desarrollo
npm run build                        # Build para producción
npm test                            # Ejecutar pruebas

# Desarrollo Frontend
cd packages/web-frontend
npm run dev                          # Modo desarrollo
npm run build                        # Build para producción
npm test                            # Ejecutar pruebas
```

## 🔒 Seguridad y Cumplimiento

### LGPD (Lei Geral de Proteção de Dados)

```typescript
// Ejemplo de implementación LGPD
interface LGPDCompliance {
  // Art. 7º - Base legal para tratamiento
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  
  // Art. 9º - Consentimiento
  consent: {
    explicit: boolean;
    specific: boolean;
    informed: boolean;
    free: boolean;
    timestamp: Date;
  };
  
  // Art. 18º - Derechos del titular
  dataSubjectRights: {
    access: boolean;      // Acceso a los datos
    rectification: boolean; // Corrección
    erasure: boolean;     // Eliminación (derecho al olvido)
    portability: boolean;  // Portabilidad
    restriction: boolean; // Limitación del tratamiento
    objection: boolean;   // Oposición
  };
  
  // Art. 46 - Seguridad
  security: {
    encryption: boolean;
    accessControl: boolean;
    auditLog: boolean;
    dataMinimization: boolean;
  };
}
```

### GDPR (General Data Protection Regulation)

```typescript
// Ejemplo de implementación GDPR
interface GDPRCompliance {
  // Art. 17 - Derecho al olvido
  rightToBeForgotten: {
    enabled: boolean;
    retentionPeriod: number; // en días
    automaticDeletion: boolean;
  };
  
  // Art. 20 - Portabilidad de datos
  dataPortability: {
    enabled: boolean;
    formats: string[]; // ['json', 'csv', 'xml']
    apiAccess: boolean;
  };
  
  // Art. 25 - Privacidad por diseño
  privacyByDesign: {
    dataMinimization: boolean;
    purposeLimitation: boolean;
    storageLimitation: boolean;
    accuracy: boolean;
  };
}
```

### Cumplimiento Basel III

```typescript
// Ejemplo de implementación Basel III
interface BaselIIICompliance {
  // Requisitos de Capital
  capitalRequirements: {
    tier1Capital: number;
    tier2Capital: number;
    riskWeightedAssets: number;
    capitalAdequacyRatio: number; // Mínimo 8%
  };
  
  // Gestión de Riesgos
  riskManagement: {
    creditRisk: {
      probabilityOfDefault: number;
      lossGivenDefault: number;
      exposureAtDefault: number;
    };
    operationalRisk: {
      internalLossData: boolean;
      externalLossData: boolean;
      scenarioAnalysis: boolean;
    };
  };
  
  // Requisitos de Liquidez
  liquidity: {
    liquidityCoverageRatio: number; // Mínimo 100%
    netStableFundingRatio: number;  // Mínimo 100%
  };
}
```

## 📊 Monitoreo y Observabilidad

### Métricas Principales

```typescript
interface SystemMetrics {
  // Rendimiento
  performance: {
    responseTime: number;        // ms
    throughput: number;         // requests/second
    errorRate: number;          // percentage
    availability: number;       // percentage
  };
  
  // Negocio
  business: {
    totalUsers: number;
    activeUsers: number;
    scoresCalculated: number;
    fraudDetected: number;
    complianceViolations: number;
  };
  
  // Técnico
  technical: {
    databaseConnections: number;
    redisMemoryUsage: number;
    blockchainSyncStatus: string;
    aiModelAccuracy: number;
  };
}
```

### Logs Estructurados

```typescript
interface StructuredLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata: Record<string, any>;
  message: string;
}
```

## 🧪 Pruebas

### Estrategia de Pruebas

```bash
# Pruebas Unitarias
npm run test:unit

# Pruebas de Integración
npm run test:integration

# Pruebas End-to-End
npm run test:e2e

# Pruebas de Rendimiento
npm run test:performance

# Pruebas de Seguridad
npm run test:security
```

### Cobertura de Pruebas

```typescript
// Ejemplo de prueba unitaria
describe('Credit Score Calculation', () => {
  it('should calculate score correctly', async () => {
    const factors = [
      { type: 'payment_history', value: 95, weight: 35 },
      { type: 'credit_utilization', value: 80, weight: 30 },
      { type: 'credit_age', value: 70, weight: 15 },
      { type: 'credit_mix', value: 85, weight: 10 },
      { type: 'new_credit', value: 90, weight: 10 }
    ];
    
    const score = await calculateCreditScore(factors);
    expect(score).toBe(85); // Score esperado
  });
});
```

## 🚀 Despliegue y Producción

### Ambientes

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  substrate-node:
    image: credchain/substrate-node:latest
    environment:
      - NODE_ENV=production
      - CHAIN=polkadot
      - PARACHAIN_ID=2000
    
  eliza-runtime:
    image: credchain/eliza-runtime:latest
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    
  api-gateway:
    image: credchain/api-gateway:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
```

### Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run security scan
        run: npm audit
```

## 📈 Rendimiento y Escalabilidad

### Optimizaciones Implementadas

1. **Cache Redis**: Scores calculados cacheados por 1 hora
2. **Connection Pooling**: Pool de conexiones para PostgreSQL
3. **Indexación**: Índices optimizados para consultas frecuentes
4. **CDN**: Assets estáticos servidos via CDN
5. **Load Balancing**: Distribución de carga entre instancias

### Métricas de Rendimiento

```typescript
interface PerformanceTargets {
  // Latencia
  latency: {
    apiResponse: 200;      // ms
    scoreCalculation: 500; // ms
    blockchainTx: 2000;    // ms
  };
  
  // Throughput
  throughput: {
    apiRequests: 1000;     // requests/second
    scoreCalculations: 100; // calculations/second
    blockchainTxs: 50;      // transactions/second
  };
  
  // Disponibilidad
  availability: {
    target: 99.9;          // percentage
    downtime: 8.76;        // hours/year
  };
}
```

## 🔧 Solución de Problemas

### Problemas Comunes

1. **Docker no inicia**
   ```bash
   # Verificar si Docker está ejecutándose
   docker ps
   
   # Reiniciar Docker
   sudo systemctl restart docker
   ```

2. **Base de datos no conecta**
   ```bash
   # Verificar logs de PostgreSQL
   docker-compose logs postgres
   
   # Probar conexión
   docker-compose exec postgres psql -U credchain -d credchain
   ```

3. **Blockchain no sincroniza**
   ```bash
   # Verificar logs de Substrate
   docker-compose logs substrate-node
   
   # Reiniciar nodo
   docker-compose restart substrate-node
   ```

4. **ElizaOS no responde**
   ```bash
   # Verificar logs de ElizaOS
   docker-compose logs eliza-runtime
   
   # Probar health check
   curl http://localhost:3000/health
   ```

### Logs Útiles

```bash
# Logs generales
docker-compose logs -f

# Logs específicos
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f substrate-node
docker-compose logs -f eliza-runtime
docker-compose logs -f api-gateway
```

## 📚 Recursos Adicionales

### Documentación Externa

- [ElizaOS Documentation](https://elizaos.ai/)
- [Polkadot Documentation](https://polkadot.network/docs/)
- [Substrate Documentation](https://substrate.dev/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

### Comunidad

- [CredChain Discord](https://discord.gg/credchain)
- [GitHub Issues](https://github.com/credchain/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/credchain)

### Soporte

- **Email**: support@credchain.io
- **Documentación**: docs.credchain.io
- **Status Page**: status.credchain.io

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Autor**: CredChain Team
