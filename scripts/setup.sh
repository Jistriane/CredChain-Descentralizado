#!/bin/bash

# CredChain Setup Script
# Configura o ambiente de desenvolvimento completo

set -e

echo "🏗️ CredChain - Setup do Ambiente de Desenvolvimento"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verifica se Docker está instalado
check_docker() {
    log "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Instale Docker primeiro: https://docs.docker.com/get-docker/"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado. Instale Docker Compose primeiro: https://docs.docker.com/compose/install/"
    fi
    
    log "✅ Docker e Docker Compose encontrados"
}

# Verifica se Node.js está instalado
check_node() {
    log "Verificando Node.js..."
    if ! command -v node &> /dev/null; then
        error "Node.js não está instalado. Instale Node.js 18+: https://nodejs.org/"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js versão 18+ é necessária. Versão atual: $(node --version)"
    fi
    
    log "✅ Node.js $(node --version) encontrado"
}

# Verifica se Rust está instalado
check_rust() {
    log "Verificando Rust..."
    if ! command -v rustc &> /dev/null; then
        warn "Rust não está instalado. Instalando Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
    fi
    
    log "✅ Rust $(rustc --version) encontrado"
}

# Cria arquivo .env se não existir
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            log "✅ Arquivo .env criado a partir do env.example"
            warn "⚠️  Edite o arquivo .env com suas chaves de API antes de continuar"
        else
            error "Arquivo env.example não encontrado"
        fi
    else
        log "✅ Arquivo .env já existe"
    fi
}

# Instala dependências dos pacotes
install_dependencies() {
    log "Instalando dependências dos pacotes..."
    
    # ElizaOS Runtime
    if [ -d "packages/eliza-runtime" ]; then
        log "📦 Instalando dependências do ElizaOS Runtime..."
        cd packages/eliza-runtime
        npm install
        cd ../..
    fi
    
    # API Gateway
    if [ -d "packages/api-gateway" ]; then
        log "📦 Instalando dependências do API Gateway..."
        cd packages/api-gateway
        npm install
        cd ../..
    fi
    
    # Web Frontend
    if [ -d "packages/web-frontend" ]; then
        log "📦 Instalando dependências do Web Frontend..."
        cd packages/web-frontend
        npm install
        cd ../..
    fi
    
    # Mobile Backend
    if [ -d "packages/mobile-backend" ]; then
        log "📦 Instalando dependências do Mobile Backend..."
        cd packages/mobile-backend
        npm install
        cd ../..
    fi
    
    log "✅ Dependências instaladas"
}

# Constrói imagens Docker
build_docker_images() {
    log "Construindo imagens Docker..."
    
    # Para o desenvolvimento, vamos usar imagens base e instalar dependências
    log "🐳 Construindo imagens para desenvolvimento..."
    
    # Verifica se docker-compose.yml existe
    if [ ! -f docker-compose.yml ]; then
        error "Arquivo docker-compose.yml não encontrado"
    fi
    
    log "✅ Imagens Docker configuradas"
}

# Inicia serviços
start_services() {
    log "Iniciando serviços..."
    
    # Para o desenvolvimento, vamos usar docker-compose up -d
    log "🚀 Iniciando serviços com Docker Compose..."
    
    # Verifica se .env existe
    if [ ! -f .env ]; then
        error "Arquivo .env não encontrado. Execute setup primeiro"
    fi
    
    # Inicia serviços em background
    docker-compose up -d
    
    log "✅ Serviços iniciados"
    log "📊 Verificando status dos serviços..."
    
    # Aguarda serviços ficarem prontos
    sleep 10
    
    # Verifica status
    docker-compose ps
    
    log "🎉 CredChain está rodando!"
    log ""
    log "📋 Serviços disponíveis:"
    log "  🌐 Web Dashboard: http://localhost:3001"
    log "  🔌 API Gateway: http://localhost:4000"
    log "  🤖 ElizaOS Runtime: http://localhost:3000"
    log "  ⛓️  Substrate Node: ws://localhost:9944"
    log "  🗄️  PostgreSQL: localhost:5432"
    log "  🍃 MongoDB: localhost:27017"
    log "  🔴 Redis: localhost:6379"
    log ""
    log "📚 Comandos úteis:"
    log "  docker-compose logs -f [service]  # Ver logs de um serviço"
    log "  docker-compose restart [service] # Reiniciar um serviço"
    log "  docker-compose down              # Parar todos os serviços"
    log "  docker-compose ps                # Ver status dos serviços"
}

# Função principal
main() {
    log "Iniciando setup do CredChain..."
    
    # Verificações
    check_docker
    check_node
    check_rust
    
    # Setup
    setup_env
    install_dependencies
    build_docker_images
    start_services
    
    log "🎉 Setup concluído com sucesso!"
    log "📖 Consulte o README.md para mais informações"
}

# Executa setup se script for chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
