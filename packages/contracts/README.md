# 🏗️ CredChain Smart Contracts

> **Contratos inteligentes para o sistema CredChain de credit scoring descentralizado na rede Polkadot**

## 📋 Visão Geral

Este repositório contém os contratos inteligentes do CredChain, implementados em Solidity e otimizados para deploy na rede mainnet do Polkadot, seguindo as diretrizes do [Polkadot Survival Guide](https://polkadot-survival-guide.w3d.community/pt).

## 🔧 Contratos Implementados

### 1. **CredChainCreditScore.sol**
- **Função**: Gerenciamento de scores de crédito
- **Features**: 
  - Registro e atualização de scores (0-1000)
  - Fatores de cálculo personalizáveis
  - Sistema de versionamento
  - Autorização de calculadores e oráculos

### 2. **CredChainPaymentRegistry.sol**
- **Função**: Registro de pagamentos para credit scoring
- **Features**:
  - Criação e rastreamento de pagamentos
  - Status automático (Pendente, Pago, Atrasado, Inadimplente)
  - Verificação de pagamentos
  - Estatísticas de pagamento

### 3. **CredChainIdentityVerification.sol**
- **Função**: Verificação de identidade (KYC)
- **Features**:
  - Registro de informações pessoais
  - Processo de verificação
  - Controle de acesso
  - Prevenção de duplicação de documentos

### 4. **CredChainOracleIntegration.sol**
- **Função**: Integração com oráculos externos
- **Features**:
  - Atualização de dados em tempo real
  - Controle de expiração
  - Múltiplos oráculos
  - Validação de dados

## 🚀 Quick Start

### **Pré-requisitos**
```bash
# Node.js 18+
node --version

# Hardhat
npm install -g hardhat

# Polkadot tools
npm install -g @parity/hardhat-polkadot
```

### **Instalação**
```bash
# Clone o repositório
git clone <repository-url>
cd packages/contracts

# Instalar dependências
npm install

# Compilar contratos
npm run compile
```

### **Testes**
```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run coverage

# Executar testes com relatório de gas
npm run gas
```

## 🌐 Deploy

### **Configuração de Rede**

#### **Polkadot Mainnet**
```bash
# Configurar variáveis de ambiente
export POLKADOT_RPC_URL="https://rpc.polkadot.io"
export PRIVATE_KEY="your_private_key_here"

# Deploy na mainnet
npm run deploy:polkadot
```

#### **Polkadot Testnet (Paseo)**
```bash
# Configurar variáveis de ambiente
export PASEO_RPC_URL="https://testnet-passet-hub-eth-rpc.polkadot.io"
export PRIVATE_KEY="your_private_key_here"

# Deploy na testnet
npm run deploy:paseo
```

#### **Polkadot Asset Hub**
```bash
# Configurar variáveis de ambiente
export ASSET_HUB_RPC_URL="https://polkadot-asset-hub-rpc.polkadot.io"
export PRIVATE_KEY="your_private_key_here"

# Deploy no Asset Hub
npm run deploy:assetHub
```

### **Verificação de Contratos**
```bash
# Verificar na mainnet
npm run verify:polkadot

# Verificar na testnet
npm run verify:paseo

# Verificar no Asset Hub
npm run verify:assetHub
```

## 📊 Funcionalidades dos Contratos

### **CredChainCreditScore**

#### **Funções Principais:**
- `updateCreditScore()` - Atualiza score de um usuário
- `addScoreFactor()` - Adiciona fator de cálculo
- `calculateScore()` - Calcula score baseado nos fatores
- `getCreditScore()` - Obtém score atual
- `authorizeCalculator()` - Autoriza calculador

#### **Eventos:**
- `ScoreUpdated` - Score atualizado
- `ScoreFactorAdded` - Fator adicionado
- `ScoreCalculated` - Score calculado

### **CredChainPaymentRegistry**

#### **Funções Principais:**
- `createPayment()` - Cria novo pagamento
- `markAsPaid()` - Marca como pago
- `updatePaymentStatus()` - Atualiza status
- `verifyPayment()` - Verifica pagamento
- `getUserPaymentStats()` - Estatísticas do usuário

#### **Status de Pagamento:**
- `Pending` - Pendente
- `Paid` - Pago
- `Late` - Atrasado
- `Defaulted` - Inadimplente
- `Cancelled` - Cancelado

### **CredChainIdentityVerification**

#### **Funções Principais:**
- `registerIdentity()` - Registra identidade
- `requestVerification()` - Solicita verificação
- `completeVerification()` - Completa verificação
- `isIdentityVerified()` - Verifica se está verificado

#### **Status de Verificação:**
- `Pending` - Pendente
- `Approved` - Aprovado
- `Rejected` - Rejeitado
- `UnderReview` - Em análise
- `Expired` - Expirado

### **CredChainOracleIntegration**

#### **Funções Principais:**
- `registerOracle()` - Registra oráculo
- `updateOracleData()` - Atualiza dados
- `getOracleData()` - Obtém dados
- `isDataValid()` - Verifica validade

#### **Controles:**
- Expiração automática (24h)
- Múltiplos oráculos
- Validação de dados

## 🔒 Segurança

### **Modificadores de Acesso:**
- `onlyOwner` - Apenas o dono do contrato
- `onlyAuthorizedCalculator` - Calculadores autorizados
- `onlyAuthorizedOracle` - Oráculos autorizados
- `onlyAuthorizedVerifier` - Verificadores autorizados

### **Validações:**
- Scores entre 0-1000
- Endereços válidos
- Pesos de fatores ≤ 100
- Verificação de expiração

### **Proteções:**
- Reentrancy protection
- Input validation
- Access control
- Data integrity

## 📈 Otimizações

### **Gas Optimization:**
- Uso eficiente de storage
- Packing de structs
- Otimização de loops
- Redução de operações custosas

### **Size Optimization:**
- Contratos < 100KB (limite Polkadot)
- Remoção de código desnecessário
- Uso de libraries
- Compressão de strings

## 🧪 Testes

### **Cobertura de Testes:**
- ✅ Testes unitários
- ✅ Testes de integração
- ✅ Testes de segurança
- ✅ Testes de performance

### **Executar Testes:**
```bash
# Todos os testes
npm test

# Teste específico
npx hardhat test test/CredChainCreditScore.test.js

# Com cobertura
npm run coverage
```

## 📚 Documentação

### **ABI dos Contratos:**
- `artifacts/CredChainCreditScore.sol/CredChainCreditScore.json`
- `artifacts/CredChainPaymentRegistry.sol/CredChainPaymentRegistry.json`
- `artifacts/CredChainIdentityVerification.sol/CredChainIdentityVerification.json`
- `artifacts/CredChainOracleIntegration.sol/CredChainOracleIntegration.json`

### **Endereços de Deploy:**
- **Mainnet**: `deployments/polkadot-deployment.json`
- **Testnet**: `deployments/paseo-deployment.json`
- **Asset Hub**: `deployments/assetHub-deployment.json`

## 🔗 Integração

### **Frontend Integration:**
```javascript
// Exemplo de uso
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  signer
);

// Atualizar score
await contract.updateCreditScore(
  userAddress,
  score,
  metadata
);
```

### **Backend Integration:**
```javascript
// Exemplo de uso
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  provider
);

// Obter score
const score = await contract.getCreditScore(userAddress);
```

## 🚀 Deploy em Produção

### **Checklist de Deploy:**
- [ ] Contratos compilados sem erros
- [ ] Testes passando (100% cobertura)
- [ ] Gas optimization aplicada
- [ ] Size < 100KB
- [ ] Variáveis de ambiente configuradas
- [ ] Chaves privadas seguras
- [ ] Verificação de contratos
- [ ] Monitoramento configurado

### **Comandos de Deploy:**
```bash
# 1. Compilar
npm run compile

# 2. Testar
npm test

# 3. Deploy
npm run deploy:polkadot

# 4. Verificar
npm run verify:polkadot
```

## 📞 Suporte

### **Recursos:**
- [Polkadot Survival Guide](https://polkadot-survival-guide.w3d.community/pt)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)

### **Contato:**
- **Email**: dev@credchain.io
- **Discord**: [CredChain Community](https://discord.gg/credchain)
- **GitHub**: [Issues](https://github.com/credchain/contracts/issues)

---

## 🎉 **CredChain Smart Contracts - Prontos para Mainnet!**

**Contratos otimizados e testados para deploy na rede Polkadot mainnet, seguindo todas as diretrizes de segurança e otimização!** 🚀⛓️
