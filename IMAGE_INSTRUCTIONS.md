# 📸 Instruções para Adicionar a Imagem do Dashboard

## 🎯 Como adicionar a imagem real do dashboard

### 1. **Capture a Screenshot**
- Acesse o dashboard em funcionamento: `http://localhost:3000`
- Faça login com uma conta de teste
- Conecte uma carteira MetaMask
- Capture uma screenshot completa da tela

### 2. **Salve a Imagem**
- Nome do arquivo: `dashboard-screenshot.png`
- Localização: Raiz do projeto (`/home/jistriane/Area de Trabalho/CredChain Descentralizado/`)
- Formato: PNG (recomendado)
- Resolução: Mínimo 1920x1080

### 3. **Conteúdo da Imagem**
A imagem deve mostrar:

#### **Header Superior:**
- Logo "CredChain" no canto esquerdo
- Menu de navegação (score, payments, chat, wallet, etc.)
- Seletor de idioma "Português (BR)"
- Status da carteira conectada (0x6d71...7743)
- Botão "Desconectar Carteira"
- Ícones de notificação e perfil do usuário

#### **Sidebar Esquerda:**
- Menu lateral com "Dashboard" selecionado
- Links para Score, Pagamentos, Relatórios, etc.

#### **Conteúdo Principal:**
- Saudação: "Olá, João Silva! Aqui está um resumo da sua saúde financeira"
- **Score de Crédito**: Círculo central com número "0" e "Muito Ruim"
- **Fatores de Crédito**: Lista com 6 fatores mostrando "Aguardando dados da carteira"
- **Ações Rápidas**: 6 botões (Solicitar Crédito, Relatório de Score, etc.)
- **Atividade Recente**: Timeline com atividades do usuário

### 4. **Verificação**
Após adicionar a imagem:
```bash
# Verificar se a imagem existe
ls -la dashboard-screenshot.png

# Verificar se o README está correto
grep "dashboard-screenshot.png" README.md
```

### 5. **Commit e Push**
```bash
git add dashboard-screenshot.png
git commit -m "docs: Adicionar screenshot real do dashboard"
git push origin main
```

## 🎨 Dicas para uma Boa Screenshot

### **Preparação:**
- Use uma resolução alta (1920x1080 ou superior)
- Certifique-se de que todos os elementos estão visíveis
- Use uma conta de teste com dados realistas
- Conecte uma carteira MetaMask para mostrar o status

### **Composição:**
- Capture a tela inteira do dashboard
- Evite elementos de debug ou console
- Certifique-se de que o texto está legível
- Mostre tanto o estado conectado quanto os dados

### **Pós-processamento:**
- Redimensione se necessário (mantenha proporção)
- Ajuste contraste e brilho se necessário
- Salve em formato PNG para melhor qualidade
- Verifique se o arquivo não é muito grande (< 2MB)

## 📱 Resultado Esperado

Após adicionar a imagem, o README.md mostrará:
- Imagem do dashboard em todas as seções (PT, EN, ES)
- Descrições detalhadas da interface
- Documentação completa do sistema
- Visualização profissional do projeto

## 🔗 Links Úteis

- **Dashboard Local**: http://localhost:3000
- **MetaMask**: https://metamask.io/
- **Ethereum Mainnet**: https://etherscan.io/
- **Documentação**: README.md

---

**Nota**: A imagem será exibida automaticamente no README.md assim que for adicionada na raiz do projeto com o nome `dashboard-screenshot.png`.
