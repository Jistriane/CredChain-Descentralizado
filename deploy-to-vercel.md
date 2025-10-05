# 🚀 Deploy Manual na Vercel

Como você já está logada na Vercel, aqui estão as instruções para fazer o deploy manual:

## 📋 Passos para Deploy

### 1. Acesse a Vercel Dashboard
- Vá para: https://vercel.com/jistrianedroid-3423s-projects/~/activity
- Clique em "New Project"

### 2. Importar o Repositório
- Selecione "Import Git Repository"
- Escolha o repositório: `Jistriane/CredChain-Descentralizado`
- Clique em "Import"

### 3. Configurar o Projeto
- **Project Name**: `credchain-frontend`
- **Framework Preset**: `Next.js`
- **Root Directory**: `packages/web-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Configurar Variáveis de Ambiente
Adicione estas variáveis no painel da Vercel:

```bash
# Aplicação
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://credchain-frontend.vercel.app

# Blockchain - Polkadot Mainnet
NEXT_PUBLIC_POLKADOT_RPC_URL=https://rpc.polkadot.io
NEXT_PUBLIC_CHAIN_ID=0x0000000000000000000000000000000000000000000000000000000000000000
NEXT_PUBLIC_NETWORK_NAME=Polkadot
NEXT_PUBLIC_BLOCK_EXPLORER=https://polkascan.io

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.credchain.io
NEXT_PUBLIC_WS_URL=wss://api.credchain.io

# Security (SUBSTITUA pelos valores reais)
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key_here

# External Services (SUBSTITUA pelos valores reais)
NEXT_PUBLIC_ELIZAOS_API_URL=https://elizaos.credchain.io
NEXT_PUBLIC_ELIZAOS_API_KEY=your_elizaos_api_key_here

# Analytics (SUBSTITUA pelos valores reais)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here

# Features
NEXT_PUBLIC_KYC_ENABLED=true
NEXT_PUBLIC_ML_ENABLED=true
NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=polkadot
```

### 5. Deploy
- Clique em "Deploy"
- Aguarde o processo de build
- Anote a URL gerada

## 🔧 Configurações Adicionais

### Domínio Personalizado (Opcional)
- Vá para Settings > Domains
- Adicione seu domínio personalizado
- Configure DNS conforme instruções

### Monitoramento
- Ative Vercel Analytics
- Configure alertas de uptime
- Configure logs de erro

## ✅ Verificação Pós-Deploy

1. **Teste o Site**
   - Acesse a URL gerada
   - Verifique se todas as páginas carregam
   - Teste a conexão com carteira

2. **Teste Funcionalidades**
   - Login/Registro
   - Conexão com Polkadot
   - Dashboard
   - APIs

3. **Performance**
   - Lighthouse Score
   - Tempo de carregamento
   - Mobile responsiveness

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. **Configure a Mainnet**
   ```bash
   ./scripts/setup-mainnet.sh
   ```

2. **Teste Integração**
   - Teste conexão blockchain
   - Teste APIs
   - Teste funcionalidades

3. **Monitoramento**
   - Configure alertas
   - Configure analytics
   - Configure logs

---

**🎉 Seu CredChain estará em produção na Vercel!**

Para dúvidas, consulte a documentação da Vercel ou entre em contato.
