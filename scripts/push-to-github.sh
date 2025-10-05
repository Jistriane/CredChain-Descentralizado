#!/bin/bash

echo "🚀 Fazendo push do CredChain para GitHub..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto CredChain"
    exit 1
fi

# Verificar se o Git está configurado
if ! git config user.name > /dev/null 2>&1; then
    echo "⚠️  Configurando Git..."
    git config user.name "Jistriane"
    git config user.email "jistriane@example.com"
fi

# Verificar se há mudanças para commitar
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Adicionando mudanças..."
    git add .
    git commit -m "🔄 Update: Melhorias e correções no CredChain"
fi

# Verificar se o remote está configurado
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Configurando remote origin..."
    git remote add origin https://github.com/Jistriane/CredChain-Descentralizado.git
fi

echo "📤 Fazendo push para GitHub..."
echo "💡 Se solicitado, use seu token de acesso pessoal do GitHub como senha"

# Tentar push
if git push -u origin main; then
    echo "✅ Sucesso! CredChain foi enviado para GitHub"
    echo "🌐 Repositório: https://github.com/Jistriane/CredChain-Descentralizado"
else
    echo "❌ Erro no push. Verifique:"
    echo "   1. Se você tem acesso ao repositório"
    echo "   2. Se sua autenticação está configurada"
    echo "   3. Se o repositório existe no GitHub"
    echo ""
    echo "🔧 Soluções:"
    echo "   - Configure um token de acesso pessoal:"
    echo "     https://github.com/settings/tokens"
    echo "   - Ou use SSH: git remote set-url origin git@github.com:Jistriane/CredChain-Descentralizado.git"
    echo "   - Ou faça o push manualmente via interface do GitHub"
fi
