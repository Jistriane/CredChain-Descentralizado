#!/bin/bash

# CredChain Development Setup Script
# Configuração automática do ambiente de desenvolvimento

set -e

echo "🚀 Configurando ambiente de desenvolvimento CredChain..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versão 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

log "Node.js versão: $(node -v)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não está instalado."
    exit 1
fi

log "npm versão: $(npm -v)"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    warn "Docker não está instalado. Alguns serviços podem não funcionar."
else
    log "Docker versão: $(docker --version)"
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    warn "Docker Compose não está instalado. Alguns serviços podem não funcionar."
else
    log "Docker Compose versão: $(docker-compose --version)"
fi

# Instalar dependências do projeto principal
log "Instalando dependências do projeto principal..."
npm install

# Instalar dependências dos packages
log "Instalando dependências dos packages..."

# API Gateway
log "Configurando API Gateway..."
cd packages/api-gateway
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Eliza Runtime
log "Configurando Eliza Runtime..."
cd packages/eliza-runtime
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Web Frontend
log "Configurando Web Frontend..."
cd packages/web-frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Mobile App
log "Configurando Mobile App..."
cd packages/mobile-app
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Contratos
log "Configurando Contratos..."
cd packages/contracts
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ../..

# Verificar se Rust está instalado para Substrate
if command -v cargo &> /dev/null; then
    log "Rust versão: $(cargo --version)"
    log "Configurando Substrate Node..."
    cd packages/substrate-node
    if [ ! -f "Cargo.toml" ]; then
        warn "Cargo.toml não encontrado. Substrate node pode não estar configurado."
    else
        log "Substrate node configurado."
    fi
    cd ../..
else
    warn "Rust não está instalado. Substrate node não será configurado."
    warn "Para instalar Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
fi

# Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."

# Copiar arquivos de exemplo de variáveis de ambiente
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        log "Arquivo .env criado a partir do exemplo."
    else
        warn "Arquivo env.example não encontrado."
    fi
fi

# Configurar variáveis de ambiente para cada package
for package in api-gateway eliza-runtime web-frontend mobile-app contracts; do
    if [ -f "packages/$package/env.example" ]; then
        if [ ! -f "packages/$package/.env" ]; then
            cp "packages/$package/env.example" "packages/$package/.env"
            log "Arquivo .env criado para $package"
        fi
    fi
done

# Iniciar serviços de banco de dados
log "Iniciando serviços de banco de dados..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres mongodb redis
    log "Serviços de banco de dados iniciados."
else
    warn "Docker Compose não disponível. Inicie os bancos de dados manualmente."
fi

# Verificar se as portas estão disponíveis
log "Verificando portas disponíveis..."

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        warn "Porta $1 está em uso. Verifique se outro serviço está rodando."
        return 1
    else
        log "Porta $1 está disponível."
        return 0
    fi
}

# Verificar portas principais
check_port 3000  # Web Frontend
check_port 3001  # API Gateway
check_port 3002  # Eliza Runtime
check_port 5432  # PostgreSQL
check_port 27017 # MongoDB
check_port 6379  # Redis

# Criar diretórios necessários
log "Criando diretórios necessários..."
mkdir -p logs
mkdir -p data
mkdir -p temp

# Configurar permissões
chmod +x scripts/*.sh 2>/dev/null || true

# Verificar se o sistema está pronto
log "Verificando se o sistema está pronto..."

# Verificar se todos os packages têm node_modules
for package in api-gateway eliza-runtime web-frontend mobile-app contracts; do
    if [ -d "packages/$package" ]; then
        if [ ! -d "packages/$package/node_modules" ]; then
            warn "node_modules não encontrado para $package"
        else
            log "✅ $package configurado"
        fi
    fi
done

echo ""
echo "🎉 Configuração do ambiente de desenvolvimento concluída!"
echo "=================================================="
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente nos arquivos .env"
echo "2. Execute 'npm run dev' para iniciar todos os serviços"
echo "3. Acesse:"
echo "   - Web Dashboard: http://localhost:3000"
echo "   - API Gateway: http://localhost:3001"
echo "   - Eliza Runtime: http://localhost:3002"
echo "   - Mobile App: Execute 'npm run dev:mobile'"
echo ""
echo "🔧 Comandos úteis:"
echo "   - npm run dev          # Iniciar todos os serviços"
echo "   - npm run dev:api      # Apenas API Gateway"
echo "   - npm run dev:web      # Apenas Web Frontend"
echo "   - npm run dev:mobile   # Apenas Mobile App"
echo "   - npm run dev:database  # Apenas bancos de dados"
echo "   - npm run status       # Verificar status dos serviços"
echo ""
echo "📚 Documentação: README.md"
echo "🐛 Problemas: Verifique os logs em ./logs/"
echo ""
