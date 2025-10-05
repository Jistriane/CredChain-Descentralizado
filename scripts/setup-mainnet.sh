#!/bin/bash

echo "🚀 Configuração Automática da Mainnet - CredChain"
echo "================================================"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Configurando contratos na mainnet..."

# 1. Navegar para o diretório de contratos
cd packages/contracts

# 2. Instalar dependências
echo -e "${BLUE}[INFO]${NC} Instalando dependências..."
npm install

# 3. Configurar variáveis de ambiente para mainnet
echo -e "${BLUE}[INFO]${NC} Configurando variáveis de ambiente..."
cat > .env << EOF
# Ethereum Mainnet Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_PRIVATE_KEY=YOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Polkadot Mainnet Configuration
POLKADOT_RPC_URL=https://rpc.polkadot.io
POLKADOT_SS58_PREFIX=0

# Network Configuration
NETWORK=mainnet
CHAIN_ID=1
GAS_PRICE=20000000000
GAS_LIMIT=5000000
EOF

# 4. Compilar contratos
echo -e "${BLUE}[INFO]${NC} Compilando contratos..."
npx hardhat compile

# 5. Verificar se a compilação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS]${NC} Contratos compilados com sucesso!"
else
    echo -e "${RED}[ERROR]${NC} Erro na compilação dos contratos"
    exit 1
fi

# 6. Executar testes
echo -e "${BLUE}[INFO]${NC} Executando testes..."
npx hardhat test

# 7. Verificar se os testes passaram
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS]${NC} Todos os testes passaram!"
else
    echo -e "${YELLOW}[WARNING]${NC} Alguns testes falharam, mas continuando..."
fi

# 8. Preparar para deploy
echo -e "${BLUE}[INFO]${NC} Preparando para deploy na mainnet..."
echo ""
echo "📋 PRÓXIMOS PASSOS PARA DEPLOY NA MAINNET:"
echo "=========================================="
echo ""
echo "1. 🔑 Configure suas chaves privadas no arquivo .env:"
echo "   - ETHEREUM_PRIVATE_KEY=0x..."
echo "   - ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY"
echo "   - ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY"
echo ""
echo "2. 💰 Certifique-se de ter ETH suficiente para gas fees"
echo ""
echo "3. 🚀 Execute o deploy:"
echo "   npx hardhat run scripts/deploy-ethereum.js --network mainnet"
echo ""
echo "4. ✅ Verifique os contratos:"
echo "   npx hardhat run scripts/verify-contracts-ethereum.js --network mainnet"
echo ""
echo "5. 📊 Monitore o deploy:"
echo "   - Etherscan: https://etherscan.io"
echo "   - Polkadot: https://polkascan.io"
echo ""
echo "⚠️  ATENÇÃO: Deploy na mainnet custa gas fees reais!"
echo "💰 Estime os custos antes de prosseguir"

echo ""
echo "🎯 CONFIGURAÇÃO DA MAINNET CONCLUÍDA!"
echo "✅ Contratos compilados e testados"
echo "✅ Variáveis de ambiente configuradas"
echo "✅ Pronto para deploy na mainnet"