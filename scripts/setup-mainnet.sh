#!/bin/bash

# 🔗 Script de Configuração da Mainnet - CredChain
# Este script configura os contratos na rede Ethereum mainnet

set -e  # Parar em caso de erro

echo "🔗 Configurando CredChain na Mainnet Ethereum..."

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

print_warning "⚠️  ATENÇÃO: Este script fará deploy na ETHEREUM MAINNET!"
print_warning "⚠️  Certifique-se de ter ETH suficiente para gas fees!"
print_warning "⚠️  Certifique-se de ter as chaves privadas configuradas!"

read -p "Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deploy cancelado pelo usuário."
    exit 0
fi

print_status "Navegando para o diretório dos contratos..."
cd packages/contracts

# Verificar se o diretório existe
if [ ! -f "package.json" ]; then
    print_error "Diretório dos contratos não encontrado!"
    exit 1
fi

print_status "Instalando dependências..."
npm install

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado. Copiando do exemplo..."
    cp .env.example .env
    print_warning "⚠️  IMPORTANTE: Configure suas chaves privadas no arquivo .env antes de continuar!"
    print_warning "⚠️  Edite o arquivo .env e configure:"
    print_warning "   - PRIVATE_KEY=your_private_key_here"
    print_warning "   - ETHERSCAN_API_KEY=your_etherscan_api_key"
    print_warning "   - ALCHEMY_API_KEY=your_alchemy_api_key"
    
    read -p "Pressione Enter após configurar o arquivo .env..."
fi

print_status "Verificando configuração da rede..."
npx hardhat console --network mainnet --eval "console.log('Rede:', hre.network.name, 'Chain ID:', hre.network.config.chainId)"

print_status "Executando deploy dos contratos..."
npx hardhat run scripts/deploy-ethereum.js --network mainnet

if [ $? -eq 0 ]; then
    print_success "Deploy dos contratos concluído!"
else
    print_error "Erro durante o deploy dos contratos!"
    exit 1
fi

print_status "Configurando contratos para produção..."
npx hardhat run scripts/setup-mainnet.js --network mainnet

if [ $? -eq 0 ]; then
    print_success "Configuração dos contratos concluída!"
else
    print_warning "Erro durante a configuração. Verifique os logs."
fi

print_status "Verificando contratos no Etherscan..."

# Ler endereços dos contratos
if [ -f "deployments/ethereum-mainnet-deployment.json" ]; then
    print_status "Endereços dos contratos deployados:"
    cat deployments/ethereum-mainnet-deployment.json | jq '.'
    
    print_status "Para verificar os contratos no Etherscan, execute:"
    echo "npx hardhat verify --network mainnet <CONTRACT_ADDRESS>"
else
    print_warning "Arquivo de deployment não encontrado."
fi

print_success "🎉 Configuração da Mainnet concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. ✅ Verificar contratos no Etherscan"
echo "2. 🔧 Configurar oráculos e verificadores"
echo "3. 🧪 Testar todas as funcionalidades"
echo "4. 📊 Configurar monitoramento"
echo "5. 🚀 Deploy do frontend na Vercel"
echo ""
echo "📖 Consulte o DEPLOY_GUIDE.md para mais informações"

# Voltar ao diretório raiz
cd ../..

print_status "Script de configuração da mainnet finalizado."
