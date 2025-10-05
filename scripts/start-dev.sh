#!/bin/bash

# CredChain Development Start Script
# Inicia todos os serviços de desenvolvimento

set -e

echo "🚀 Iniciando CredChain Development Environment..."
echo "=============================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto CredChain"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    log "Instalando dependências..."
    npm install
fi

# Verificar se os packages têm dependências instaladas
for package in api-gateway eliza-runtime web-frontend mobile-app contracts; do
    if [ -d "packages/$package" ]; then
        if [ ! -d "packages/$package/node_modules" ]; then
            log "Instalando dependências para $package..."
            cd "packages/$package"
            npm install
            cd ../..
        fi
    fi
done

# Iniciar serviços de banco de dados
log "Iniciando serviços de banco de dados..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres mongodb redis
    log "✅ Serviços de banco de dados iniciados"
else
    warn "Docker Compose não disponível. Inicie os bancos manualmente."
fi

# Aguardar um pouco para os serviços iniciarem
sleep 3

# Verificar se os serviços estão rodando
log "Verificando status dos serviços..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
fi

# Iniciar todos os serviços em paralelo
log "Iniciando todos os serviços CredChain..."
echo ""
echo "🌐 Serviços que serão iniciados:"
echo "   - API Gateway (http://localhost:3001)"
echo "   - Eliza Runtime (http://localhost:3002)"
echo "   - Web Frontend (http://localhost:3000)"
echo "   - Mobile App (Expo Dev Server)"
echo "   - Database Services (PostgreSQL, MongoDB, Redis)"
echo ""

# Usar npm run dev para iniciar todos os serviços
npm run dev
