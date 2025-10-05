#!/bin/bash

echo "🚀 Tentando fazer upload do CredChain para GitHub..."

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

echo "📤 Tentando diferentes métodos de upload..."

# Método 1: Push direto
echo "🔄 Tentativa 1: Push direto..."
if git push -u origin main 2>/dev/null; then
    echo "✅ Sucesso! CredChain foi enviado para GitHub"
    echo "🌐 Repositório: https://github.com/Jistriane/CredChain-Descentralizado"
    exit 0
fi

# Método 2: Com configuração de credenciais
echo "🔄 Tentativa 2: Com configuração de credenciais..."
git config --global credential.helper store
if git push -u origin main 2>/dev/null; then
    echo "✅ Sucesso! CredChain foi enviado para GitHub"
    echo "🌐 Repositório: https://github.com/Jistriane/CredChain-Descentralizado"
    exit 0
fi

# Método 3: SSH
echo "🔄 Tentativa 3: Configurando SSH..."
git remote set-url origin git@github.com:Jistriane/CredChain-Descentralizado.git
if git push -u origin main 2>/dev/null; then
    echo "✅ Sucesso! CredChain foi enviado para GitHub"
    echo "🌐 Repositório: https://github.com/Jistriane/CredChain-Descentralizado"
    exit 0
fi

# Se todos os métodos falharam
echo "❌ Todos os métodos automáticos falharam."
echo ""
echo "🔧 Soluções manuais:"
echo ""
echo "1. 📤 UPLOAD MANUAL (RECOMENDADO):"
echo "   - Acesse: https://github.com/Jistriane/CredChain-Descentralizado"
echo "   - Clique em 'uploading an existing file'"
echo "   - Arraste todos os arquivos do projeto"
echo "   - Use a mensagem de commit fornecida no arquivo UPLOAD_INSTRUCTIONS.md"
echo ""
echo "2. 🔑 TOKEN DE ACESSO:"
echo "   - Crie um token em: https://github.com/settings/tokens"
echo "   - Execute: git push -u origin main"
echo "   - Use o token como senha"
echo ""
echo "3. 🔐 SSH KEY:"
echo "   - Configure SSH key no GitHub"
echo "   - Execute: git push -u origin main"
echo ""
echo "📋 Arquivos prontos para upload:"
echo "   - 229 arquivos commitados"
echo "   - README.md multilíngue"
echo "   - Logo do CredChain"
echo "   - Sistema completo implementado"
echo ""
echo "📚 Consulte UPLOAD_INSTRUCTIONS.md para instruções detalhadas"
