# 🚀 Guia Completo de Deploy - CredChain

Este guia fornece instruções passo a passo para fazer o deploy do frontend na Vercel e configurar a rede mainnet.

## 📋 Pré-requisitos

### 1. Contas e Serviços Necessários
- [ ] Conta na [Vercel](https://vercel.com)
- [ ] Conta na [GitHub](https://github.com)
- [ ] Carteira Ethereum com ETH para gas fees
- [ ] Acesso ao repositório do projeto

### 2. Ferramentas Necessárias
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] Vercel CLI (`npm i -g vercel`)
- [ ] Hardhat configurado

## 🔧 Configuração Inicial

### 1. Preparar o Repositório

```bash
# Navegar para o diretório do projeto
cd "/home/jistriane/Area de Trabalho/CredChain Descentralizado"

# Verificar se está tudo commitado
git status

# Fazer commit das alterações se necessário
git add .
git commit -m "feat: configuração para deploy na Vercel"
git push origin main
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` no diretório `packages/web-frontend/`:

```bash
# Aplicação
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://credchain.vercel.app

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

## 🌐 Deploy na Vercel

### Método 1: Via Dashboard da Vercel (Recomendado)

1. **Acesse a Vercel Dashboard**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub

2. **Importar Projeto**
   - Clique em "New Project"
   - Selecione o repositório "CredChain Descentralizado"
   - Configure o projeto:
     - **Framework Preset**: Next.js
     - **Root Directory**: `packages/web-frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Configurar Variáveis de Ambiente**
   - Vá para Settings > Environment Variables
   - Adicione todas as variáveis do arquivo `.env.local`
   - Marque para "Production", "Preview" e "Development"

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o processo de build
   - Anote a URL gerada (ex: `https://credchain.vercel.app`)

### Método 2: Via CLI da Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Navegar para o diretório do frontend
cd packages/web-frontend

# Fazer login na Vercel
vercel login

# Deploy
vercel

# Seguir as instruções:
# - Link to existing project? N
# - Project name: credchain
# - Directory: packages/web-frontend
# - Override settings? N
```

## 🔗 Configuração da Rede Mainnet

### 1. Deploy dos Contratos

```bash
# Navegar para o diretório dos contratos
cd packages/contracts

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Deploy na mainnet
npx hardhat run scripts/deploy-ethereum.js --network mainnet
```

### 2. Configurar Contratos

```bash
# Configurar contratos para produção
npx hardhat run scripts/setup-mainnet.js --network mainnet
```

### 3. Verificar Contratos

```bash
# Verificar todos os contratos no Etherscan
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

## 🔧 Configurações Pós-Deploy

### 1. Configurar Domínio Personalizado (Opcional)

1. **Na Vercel Dashboard:**
   - Vá para Settings > Domains
   - Adicione seu domínio personalizado
   - Configure DNS conforme instruções

### 2. Configurar Monitoramento

1. **Google Analytics:**
   - Adicione o ID do GA nas variáveis de ambiente
   - Configure eventos personalizados

2. **Mixpanel:**
   - Adicione o token do Mixpanel
   - Configure eventos de tracking

### 3. Configurar SSL e Segurança

A Vercel já fornece SSL automático, mas você pode configurar:

- **Headers de Segurança**: Já configurados no `vercel.json`
- **CORS**: Configurado para APIs
- **Rate Limiting**: Implementar se necessário

## 🧪 Testes Pós-Deploy

### 1. Testes de Funcionalidade

```bash
# Testar build local
cd packages/web-frontend
npm run build
npm run start

# Testar em produção
curl https://credchain.vercel.app/api/health
```

### 2. Testes de Blockchain

```bash
# Testar conexão com Polkadot
# Verificar se a carteira conecta
# Testar transações de teste
```

### 3. Testes de Performance

- [ ] Lighthouse Score > 90
- [ ] Tempo de carregamento < 3s
- [ ] Mobile responsiveness
- [ ] SEO otimizado

## 📊 Monitoramento e Manutenção

### 1. Configurar Alertas

- **Vercel Analytics**: Ativar no dashboard
- **Uptime Monitoring**: Configurar alertas
- **Error Tracking**: Implementar Sentry ou similar

### 2. Backup e Versionamento

```bash
# Backup dos contratos
cp packages/contracts/deployments/ethereum-mainnet-deployment.json backup/

# Versionamento
git tag v1.0.0
git push origin v1.0.0
```

### 3. Atualizações

```bash
# Atualizar frontend
git pull origin main
# Deploy automático via Vercel

# Atualizar contratos (cuidado!)
# Fazer upgrade dos contratos se necessário
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Build Falha**
   ```bash
   # Verificar logs
   vercel logs
   
   # Verificar dependências
   npm install
   ```

2. **Variáveis de Ambiente**
   - Verificar se todas estão configuradas
   - Verificar se começam com `NEXT_PUBLIC_`

3. **Conexão Blockchain**
   - Verificar RPC URLs
   - Verificar configurações de rede

4. **API Errors**
   - Verificar endpoints
   - Verificar CORS
   - Verificar autenticação

### Logs e Debugging

```bash
# Logs da Vercel
vercel logs

# Logs locais
npm run dev

# Verificar contratos
npx hardhat console --network mainnet
```

## 📞 Suporte

- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Documentação Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Documentação Hardhat**: [hardhat.org/docs](https://hardhat.org/docs)

## ✅ Checklist Final

- [ ] Frontend deployado na Vercel
- [ ] Contratos deployados na mainnet
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio personalizado (se aplicável)
- [ ] SSL funcionando
- [ ] Monitoramento ativo
- [ ] Testes passando
- [ ] Documentação atualizada

---

**🎉 Parabéns! Seu sistema CredChain está agora em produção!**

Para dúvidas ou problemas, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.
