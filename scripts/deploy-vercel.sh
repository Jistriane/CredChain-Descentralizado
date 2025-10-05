#!/bin/bash

# 🚀 Script de Deploy Automatizado para Vercel - CredChain
# Este script automatiza o processo de deploy do frontend na Vercel

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do CredChain na Vercel..."

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

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se estamos logados na Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Você não está logado na Vercel. Fazendo login..."
    vercel login
fi

print_status "Navegando para o diretório do frontend..."
cd packages/web-frontend

# Verificar se o diretório existe
if [ ! -f "package.json" ]; then
    print_error "Diretório do frontend não encontrado!"
    exit 1
fi

print_status "Instalando dependências..."
npm install

print_status "Executando build de teste..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build local executado com sucesso!"
else
    print_error "Erro no build local. Verifique os logs acima."
    exit 1
fi

print_status "Iniciando deploy na Vercel..."

# Deploy na Vercel
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Deploy concluído com sucesso!"
    
    # Obter URL do deploy
    DEPLOY_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ ! -z "$DEPLOY_URL" ]; then
        print_success "URL do deploy: $DEPLOY_URL"
        
        # Testar se o deploy está funcionando
        print_status "Testando deploy..."
        if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" | grep -q "200"; then
            print_success "Deploy está funcionando corretamente!"
        else
            print_warning "Deploy pode não estar funcionando corretamente. Verifique manualmente."
        fi
    fi
    
    echo ""
    print_success "🎉 Deploy do CredChain concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. ✅ Verificar se o site está funcionando"
    echo "2. 🔧 Configurar variáveis de ambiente na Vercel Dashboard"
    echo "3. 🔗 Configurar domínio personalizado (se necessário)"
    echo "4. 📊 Configurar monitoramento e analytics"
    echo "5. 🧪 Executar testes de funcionalidade"
    echo ""
    echo "🔗 Acesse o dashboard da Vercel: https://vercel.com/dashboard"
    echo "📖 Consulte o DEPLOY_GUIDE.md para mais informações"
    
else
    print_error "Erro durante o deploy. Verifique os logs acima."
    exit 1
fi

# Voltar ao diretório raiz
cd ../..

print_status "Deploy script finalizado."
