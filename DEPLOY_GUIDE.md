# 🚀 Deploy Automático CredChain - Netlify + Mainnet

## ✅ Status do Deploy

- **Frontend**: ✅ Configurado para Netlify
- **Build**: ✅ Funcionando perfeitamente
- **Mainnet**: ✅ Scripts prontos
- **Repositório**: ✅ Atualizado no GitHub

## 🌐 Deploy do Frontend na Netlify

### 1. Acesse a Netlify
```
https://app.netlify.com
```

### 2. Conecte seu Repositório
- Clique em "New site from Git"
- Selecione: `Jistriane/CredChain-Descentralizado`
- Branch: `main`

### 3. Configure o Build
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 4. Variáveis de Ambiente
Configure as seguintes variáveis na Netlify:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://credchain.netlify.app
NEXT_PUBLIC_POLKADOT_RPC_URL=https://rpc.polkadot.io
NEXT_PUBLIC_CHAIN_ID=0x0000000000000000000000000000000000000000000000000000000000000000
NEXT_PUBLIC_NETWORK_NAME=Polkadot
NEXT_PUBLIC_BLOCK_EXPLORER=https://polkascan.io
NEXT_PUBLIC_API_BASE_URL=https://api.credchain.io
NEXT_PUBLIC_WS_URL=wss://api.credchain.io
NEXT_PUBLIC_KYC_ENABLED=true
NEXT_PUBLIC_ML_ENABLED=true
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=polkadot
```

### 5. Deploy
- Clique em "Deploy site"
- Aguarde 2-5 minutos
- Acesse: `https://credchain.netlify.app`

## ⛓️ Configuração da Mainnet

### 1. Execute o Script
```bash
./scripts/setup-mainnet.sh
```

### 2. Configure as Chaves
Edite o arquivo `packages/contracts/.env`:

```env
# Ethereum Mainnet
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_PRIVATE_KEY=YOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Polkadot Mainnet
POLKADOT_RPC_URL=https://rpc.polkadot.io
POLKADOT_SS58_PREFIX=0
```

### 3. Deploy dos Contratos
```bash
cd packages/contracts
npx hardhat run scripts/deploy-ethereum.js --network mainnet
```

### 4. Verificação
```bash
npx hardhat run scripts/verify-contracts-ethereum.js --network mainnet
```

## 🎯 Vantagens da Netlify

- ✅ **Deploy mais rápido** (2-5 minutos)
- ✅ **CDN global automático**
- ✅ **SSL automático**
- ✅ **Formulários serverless**
- ✅ **Preview de branches**
- ✅ **Rollback fácil**
- ✅ **Build otimizado**

## 📊 Monitoramento

### Frontend
- **URL**: `https://credchain.netlify.app`
- **Dashboard**: Netlify Dashboard
- **Logs**: Build logs automáticos

### Blockchain
- **Ethereum**: Etherscan.io
- **Polkadot**: Polkascan.io
- **Contratos**: Verificados automaticamente

## 🔧 Troubleshooting

### Build Errors
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Deploy Errors
- Verifique as variáveis de ambiente
- Confirme que o Node.js é versão 18
- Verifique os logs na Netlify

### Mainnet Errors
- Verifique as chaves privadas
- Confirme que tem ETH suficiente
- Verifique a conexão RPC

## 🎉 Deploy Automático Concluído!

Seu CredChain está pronto para produção:

1. **Frontend**: Netlify (automático)
2. **Mainnet**: Scripts prontos
3. **Monitoramento**: Configurado
4. **SSL**: Automático
5. **CDN**: Global

**🚀 Acesse: https://credchain.netlify.app**