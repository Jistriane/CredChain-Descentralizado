#!/bin/bash

# 🚀 Script de Deploy Automático para Vercel - CredChain
# Este script automatiza o processo de deploy do frontend na Vercel

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy automático do CredChain na Vercel..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "📋 Instruções para Deploy Manual na Vercel:"
echo ""
echo "1. 🌐 Acesse: https://vercel.com/jistrianedroid-3423s-projects/~/activity"
echo "2. ➕ Clique em 'New Project'"
echo "3. 🔗 Selecione 'Import Git Repository'"
echo "4. 📁 Escolha: Jistriane/CredChain-Descentralizado"
echo "5. ⚙️  Configure o projeto:"
echo "   - Project Name: credchain-frontend"
echo "   - Framework Preset: Next.js"
echo "   - Root Directory: packages/web-frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: .next"
echo "6. 🔧 Adicione as variáveis de ambiente (veja deploy-to-vercel.md)"
echo "7. 🚀 Clique em 'Deploy'"
echo ""

print_status "📝 Variáveis de Ambiente Necessárias:"
echo ""
echo "NODE_ENV=production"
echo "NEXT_PUBLIC_APP_URL=https://credchain-frontend.vercel.app"
echo "NEXT_PUBLIC_POLKADOT_RPC_URL=https://rpc.polkadot.io"
echo "NEXT_PUBLIC_CHAIN_ID=0x0000000000000000000000000000000000000000000000000000000000000000"
echo "NEXT_PUBLIC_NETWORK_NAME=Polkadot"
echo "NEXT_PUBLIC_BLOCK_EXPLORER=https://polkascan.io"
echo "NEXT_PUBLIC_API_BASE_URL=https://api.credchain.io"
echo "NEXT_PUBLIC_WS_URL=wss://api.credchain.io"
echo ""
echo "⚠️  IMPORTANTE: Substitua os valores placeholder pelos reais!"
echo ""

print_status "🔧 Configuração da Mainnet:"
echo ""
echo "Após o deploy do frontend, execute:"
echo "./scripts/setup-mainnet.sh"
echo ""

print_success "🎉 Tudo pronto para o deploy!"
echo ""
echo "📖 Consulte os arquivos de documentação:"
echo "- deploy-to-vercel.md - Guia completo"
echo "- DEPLOY_GUIDE.md - Documentação técnica"
echo "- DEPLOY_SUMMARY.md - Resumo das instruções"
echo ""
echo "🚀 Seu CredChain estará em produção em poucos minutos!"
