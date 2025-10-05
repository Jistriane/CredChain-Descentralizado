#!/bin/bash

echo "🚀 Iniciando build do CredChain no Render..."

# Navegar para o diretório correto
cd packages/web-frontend

echo "📁 Diretório atual: $(pwd)"
echo "📦 Instalando dependências..."

# Instalar dependências
npm install

echo "🔨 Executando build..."

# Fazer build
npm run build

echo "✅ Build concluído com sucesso!"
