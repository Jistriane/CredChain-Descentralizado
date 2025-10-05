# 📚 CredChain - Documentação Técnica

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

**Última atualização**: $(date)
**Versão**: 1.0.0
**Autor**: CredChain Team
