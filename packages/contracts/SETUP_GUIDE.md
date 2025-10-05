# 🚀 Guia de Configuração para Deploy na Ethereum Mainnet

## ❌ Problema Atual
O deploy falhou com erro: `Must be authenticated!`

## 🔧 Solução: Configurar .env Corretamente

### 1. **Editar o arquivo .env**
```bash
nano .env
```

### 2. **Substituir as variáveis de exemplo:**

#### **PRIVATE_KEY** (OBRIGATÓRIO)
```bash
# ❌ ATUAL (exemplo):
PRIVATE_KEY=your_private_key_here

# ✅ CORRETO (sua chave real):
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

#### **ETHEREUM_RPC_URL** (OBRIGATÓRIO)
```bash
# ❌ ATUAL (exemplo):
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# ✅ CORRETO (sua URL real):
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/SEU_API_KEY_REAL
```

#### **ETHERSCAN_API_KEY** (OBRIGATÓRIO)
```bash
# ❌ ATUAL (exemplo):
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# ✅ CORRETO (sua chave real):
ETHERSCAN_API_KEY=SEU_ETHERSCAN_API_KEY_REAL
```

## 🔑 Como Obter as Chaves Necessárias

### **1. Chave Privada (PRIVATE_KEY)**
- Abra sua carteira (MetaMask, etc.)
- Acesse "Detalhes da conta"
- Exportar chave privada
- **⚠️ NUNCA compartilhe esta chave!**

### **2. Alchemy API (ETHEREUM_RPC_URL)**
1. Acesse: https://www.alchemy.com/
2. Crie conta gratuita
3. Crie novo app para "Ethereum Mainnet"
4. Copie a URL da API

### **3. Etherscan API (ETHERSCAN_API_KEY)**
1. Acesse: https://etherscan.io/apis
2. Crie conta gratuita
3. Gere API key
4. Copie a chave

## 🧪 Teste em Testnet Primeiro (RECOMENDADO)

### **Deploy em Sepolia Testnet:**
```bash
# 1. Configurar para testnet
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/SEU_INFURA_KEY

# 2. Deploy em testnet
npm run deploy:ethereum:sepolia

# 3. Verificar contratos
npm run verify:ethereum:sepolia
```

## 🚀 Deploy na Mainnet

### **Após configurar o .env:**
```bash
# 1. Verificar prontidão
npm run check:ethereum:mainnet

# 2. Deploy na mainnet
npm run deploy:ethereum:mainnet

# 3. Verificar contratos
npm run verify:ethereum:mainnet
```

## ⚠️ Avisos Importantes

1. **NUNCA** commite o arquivo .env com chaves reais
2. **SEMPRE** teste em testnet primeiro
3. **VERIFIQUE** se tem saldo suficiente de ETH
4. **CONFIRME** que as chaves estão corretas
5. **MONITORE** o deploy em tempo real

## 💰 Custos Estimados

- **Deploy dos 4 contratos**: ~0.05-0.1 ETH
- **Verificação no Etherscan**: ~0.01 ETH
- **Total**: 0.1-0.2 ETH

## 🔍 Verificação de Configuração

```bash
# Verificar se as variáveis estão configuradas
npm run check:ethereum:mainnet
```

Se aparecer "✅ PASS" em todas as verificações, você está pronto para o deploy!
