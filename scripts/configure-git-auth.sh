#!/bin/bash

echo "🔐 Configurando autenticação Git para GitHub..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto CredChain"
    exit 1
fi

echo "📋 Para fazer o push do CredChain para GitHub, você precisa:"
echo ""
echo "1. 🌐 Acesse: https://github.com/settings/tokens"
echo "2. 🔑 Clique em 'Generate new token' → 'Generate new token (classic)'"
echo "3. ✅ Selecione os escopos: repo, workflow, write:packages"
echo "4. 📋 Copie o token gerado"
echo ""
echo "5. 🔧 Configure o Git com suas credenciais:"
echo "   git config --global user.name 'Jistriane'"
echo "   git config --global user.email 'seu-email@example.com'"
echo ""
echo "6. 🚀 Execute o push:"
echo "   git push -u origin main"
echo ""
echo "   Quando solicitado:"
echo "   - Username: Jistriane"
echo "   - Password: [cole o token aqui]"
echo ""
echo "💡 Alternativa: Use SSH se preferir:"
echo "   git remote set-url origin git@github.com:Jistriane/CredChain-Descentralizado.git"
echo "   git push -u origin main"
echo ""
echo "🌐 Repositório: https://github.com/Jistriane/CredChain-Descentralizado"
