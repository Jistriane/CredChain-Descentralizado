#!/bin/bash

# CredChain Services Check Script
# Verifica o status de todos os serviços

set -e

echo "🔍 Verificando status dos serviços CredChain..."
echo "============================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto CredChain"
    exit 1
fi

echo ""
info "📊 Status dos Serviços CredChain"
echo "================================"

# Verificar Docker e Docker Compose
if command -v docker &> /dev/null; then
    log "Docker: ✅ Instalado"
    if command -v docker-compose &> /dev/null; then
        log "Docker Compose: ✅ Instalado"
        
        # Verificar status dos containers
        echo ""
        info "🐳 Status dos Containers Docker:"
        docker-compose ps
        
        # Verificar se os serviços estão rodando
        echo ""
        info "🔍 Verificando serviços de banco de dados..."
        
        # PostgreSQL
        if docker-compose ps postgres | grep -q "Up"; then
            log "PostgreSQL: ✅ Rodando"
        else
            warn "PostgreSQL: ❌ Não está rodando"
        fi
        
        # MongoDB
        if docker-compose ps mongodb | grep -q "Up"; then
            log "MongoDB: ✅ Rodando"
        else
            warn "MongoDB: ❌ Não está rodando"
        fi
        
        # Redis
        if docker-compose ps redis | grep -q "Up"; then
            log "Redis: ✅ Rodando"
        else
            warn "Redis: ❌ Não está rodando"
        fi
    else
        warn "Docker Compose: ❌ Não instalado"
    fi
else
    warn "Docker: ❌ Não instalado"
fi

echo ""
info "🌐 Verificando portas dos serviços..."

# Função para verificar porta
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log "Porta $1: ✅ Em uso"
        return 0
    else
        warn "Porta $1: ❌ Livre"
        return 1
    fi
}

# Verificar portas principais
check_port 3000  # Web Frontend
check_port 3001  # API Gateway
check_port 3002  # Eliza Runtime
check_port 5432  # PostgreSQL
check_port 27017 # MongoDB
check_port 6379  # Redis

echo ""
info "📦 Verificando packages..."

# Verificar se os packages existem e têm node_modules
for package in api-gateway eliza-runtime web-frontend mobile-app contracts; do
    if [ -d "packages/$package" ]; then
        if [ -d "packages/$package/node_modules" ]; then
            log "Package $package: ✅ Configurado"
        else
            warn "Package $package: ⚠️  Dependências não instaladas"
        fi
    else
        error "Package $package: ❌ Não encontrado"
    fi
done

echo ""
info "🔧 Verificando arquivos de configuração..."

# Verificar arquivos de configuração importantes
config_files=(
    "package.json"
    "docker-compose.yml"
    "packages/api-gateway/package.json"
    "packages/eliza-runtime/package.json"
    "packages/web-frontend/package.json"
    "packages/mobile-app/package.json"
    "packages/contracts/package.json"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        log "Config $file: ✅ Encontrado"
    else
        error "Config $file: ❌ Não encontrado"
    fi
done

echo ""
info "📋 Resumo do Status:"
echo "==================="

# Contar serviços rodando
services_running=0
total_services=6

if check_port 3000; then ((services_running++)); fi
if check_port 3001; then ((services_running++)); fi
if check_port 3002; then ((services_running++)); fi
if check_port 5432; then ((services_running++)); fi
if check_port 27017; then ((services_running++)); fi
if check_port 6379; then ((services_running++)); fi

echo "Serviços rodando: $services_running/$total_services"

if [ $services_running -eq $total_services ]; then
    log "🎉 Todos os serviços estão rodando!"
elif [ $services_running -gt 0 ]; then
    warn "⚠️  Alguns serviços estão rodando ($services_running/$total_services)"
else
    error "❌ Nenhum serviço está rodando"
fi

echo ""
info "🚀 Comandos úteis:"
echo "   - npm run dev          # Iniciar todos os serviços"
echo "   - npm run dev:api      # Apenas API Gateway"
echo "   - npm run dev:web      # Apenas Web Frontend"
echo "   - npm run dev:mobile   # Apenas Mobile App"
echo "   - npm run dev:database # Apenas bancos de dados"
echo "   - npm run status       # Verificar status (este comando)"
echo "   - docker-compose logs  # Ver logs dos containers"
echo ""
