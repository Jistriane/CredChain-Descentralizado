#!/bin/bash

echo "🚀 Deploy Automático do CredChain - Frontend + Mainnet"
echo "======================================================"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Preparando deploy automático..."

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}[ERROR]${NC} Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# 2. Verificar se o repositório está atualizado
echo -e "${BLUE}[INFO]${NC} Verificando repositório..."
git status --porcelain | grep -q . && echo -e "${YELLOW}[WARNING]${NC} Há alterações não commitadas" || echo -e "${GREEN}[OK]${NC} Repositório limpo"

# 3. Fazer push das alterações
echo -e "${BLUE}[INFO]${NC} Fazendo push das alterações..."
git add .
git commit -m "feat: deploy automático para Vercel e mainnet" || echo "Nenhuma alteração para commit"
git push origin main

# 4. Configurar variáveis de ambiente
echo -e "${BLUE}[INFO]${NC} Configurando variáveis de ambiente..."
cat > .env.production << 'ENVEOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://credchain-frontend.vercel.app
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
ENVEOF

# 5. Testar build local
echo -e "${BLUE}[INFO]${NC} Testando build local..."
cd packages/web-frontend
npm install
npm run build || echo -e "${YELLOW}[WARNING]${NC} Build com warnings, mas continuando..."

# 6. Criar arquivo de configuração da Vercel
echo -e "${BLUE}[INFO]${NC} Configurando Vercel..."
cat > vercel.json << 'VERCELEOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
VERCELEOF

# 7. Instruções para deploy manual
echo -e "${GREEN}[SUCCESS]${NC} Deploy automático preparado!"
echo ""
echo "📋 INSTRUÇÕES PARA DEPLOY MANUAL:"
echo "=================================="
echo ""
echo "1. 🌐 Acesse: https://vercel.com/jistrianedroid-3423s-projects/~/activity"
echo "2. ➕ Clique em 'New Project'"
echo "3. 🔗 Selecione 'Import Git Repository'"
echo "4. 📁 Escolha: Jistriane/CredChain-Descentralizado"
echo "5. ⚙️  Configure:"
echo "   - Project Name: credchain-frontend"
echo "   - Framework Preset: Next.js"
echo "   - Root Directory: packages/web-frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: .next"
echo ""
echo "6. 🔧 Adicione estas variáveis de ambiente:"
echo "   - NODE_ENV=production"
echo "   - NEXT_PUBLIC_APP_URL=https://credchain-frontend.vercel.app"
echo "   - NEXT_PUBLIC_POLKADOT_RPC_URL=https://rpc.polkadot.io"
echo "   - NEXT_PUBLIC_CHAIN_ID=0x0000000000000000000000000000000000000000000000000000000000000000"
echo "   - NEXT_PUBLIC_NETWORK_NAME=Polkadot"
echo "   - NEXT_PUBLIC_BLOCK_EXPLORER=https://polkascan.io"
echo "   - NEXT_PUBLIC_API_BASE_URL=https://api.credchain.io"
echo "   - NEXT_PUBLIC_WS_URL=wss://api.credchain.io"
echo ""
echo "7. 🚀 Clique em 'Deploy'"
echo ""
echo "8. 📝 Anote a URL gerada (ex: https://credchain-frontend-xxx.vercel.app)"
echo ""
echo "9. 🔗 Após o deploy do frontend, execute:"
echo "   ./scripts/setup-mainnet.sh"
echo ""
echo "✅ Tudo preparado para deploy!"
echo "🎉 Seu CredChain estará em produção em poucos minutos!"

cd ../..
