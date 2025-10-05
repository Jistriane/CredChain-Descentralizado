#!/bin/bash

echo "🚀 Fazendo push final do CredChain para GitHub..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto CredChain"
    exit 1
fi

echo "📋 INSTRUÇÕES IMPORTANTES:"
echo ""
echo "1. 🌐 Acesse: https://github.com/settings/tokens"
echo "2. 🔑 Clique em 'Generate new token' → 'Generate new token (classic)'"
echo "3. ✅ Selecione os escopos: repo, workflow, write:packages"
echo "4. 📋 COPIE o token gerado"
echo ""
echo "5. 🚀 Execute o comando abaixo:"
echo "   git push -u origin main"
echo ""
echo "6. 📝 Quando solicitado:"
echo "   - Username: Jistriane"
echo "   - Password: [cole o token aqui]"
echo ""
echo "🌐 Após o push, acesse: https://github.com/Jistriane/CredChain-Descentralizado"
echo ""

# Verificar status atual
echo "📊 Status atual do repositório:"
git status --short
echo ""

# Mostrar commits
echo "📝 Últimos commits:"
git log --oneline -3
echo ""

echo "🔧 Configuração atual do remote:"
git remote -v
echo ""

echo "💡 Se o push falhar, tente:"
echo "   git remote set-url origin https://github.com/Jistriane/CredChain-Descentralizado.git"
echo "   git push -u origin main"
echo ""

echo "🎯 Execute agora: git push -u origin main"
