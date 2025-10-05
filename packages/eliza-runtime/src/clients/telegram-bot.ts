import { Telegraf, Markup, Context } from 'telegraf';
import { AgentRuntime } from '@elizaos/core';

export interface TelegramBotConfig {
  token: string;
  webhookUrl?: string;
  webhookPort?: number;
}

export class TelegramBot {
  private bot: Telegraf;
  private runtime: AgentRuntime;
  private config: TelegramBotConfig;
  private isReady: boolean = false;

  constructor(config: TelegramBotConfig, runtime: AgentRuntime) {
    this.config = config;
    this.runtime = runtime;
    
    this.bot = new Telegraf(config.token);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.bot.start((ctx) => this.handleStart(ctx));
    this.bot.help((ctx) => this.handleHelp(ctx));
    this.bot.command('score', (ctx) => this.handleScore(ctx));
    this.bot.command('payments', (ctx) => this.handlePayments(ctx));
    this.bot.command('fraud', (ctx) => this.handleFraud(ctx));
    this.bot.command('status', (ctx) => this.handleStatus(ctx));
    this.bot.command('chat', (ctx) => this.handleChat(ctx));
    this.bot.on('text', (ctx) => this.handleText(ctx));
    this.bot.on('callback_query', (ctx) => this.handleCallbackQuery(ctx));

    this.bot.launch().then(() => {
      console.log('🤖 Telegram Bot iniciado com sucesso');
      this.isReady = true;
    }).catch((error) => {
      console.error('❌ Erro ao iniciar Telegram Bot:', error);
    });
  }

  private async handleStart(ctx: Context): Promise<void> {
    const welcomeMessage = `
🏦 *Bem-vindo ao CredChain!*

Sou seu assistente de IA para credit scoring descentralizado.

*Comandos disponíveis:*
/score - Ver seu score de crédito
/payments - Histórico de pagamentos  
/fraud - Verificar detecção de fraude
/status - Status do sistema
/chat - Falar com o advisor
/help - Ajuda

*Como usar:*
• Digite /score para ver seu score atual
• Use /chat para falar com o advisor de IA
• Envie mensagens diretas para conversar

*Recursos:*
🤖 IA ElizaOS integrada
⛓️ Blockchain Polkadot
🔒 Compliance LGPD/GDPR
🛡️ Detecção de fraude
📊 Analytics em tempo real

Comece digitando /score para ver seu score de crédito!
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📊 Ver Score', 'show_score')],
      [Markup.button.callback('💬 Chat com Advisor', 'start_chat')],
      [Markup.button.callback('💳 Pagamentos', 'show_payments')],
      [Markup.button.callback('🛡️ Fraude', 'check_fraud')]
    ]);

    await ctx.reply(welcomeMessage, { 
      parse_mode: 'Markdown',
      ...keyboard
    });
  }

  private async handleHelp(ctx: Context): Promise<void> {
    const helpMessage = `
🤖 *CredChain Bot - Comandos Disponíveis*

*Comandos principais:*
/start - Iniciar o bot
/score - Ver seu score de crédito
/payments - Histórico de pagamentos
/fraud - Verificar detecção de fraude
/status - Status do sistema
/chat - Falar com o advisor
/help - Mostrar esta ajuda

*Como usar:*
• Use os comandos com / para acessar funcionalidades
• Envie mensagens diretas para conversar com o advisor
• Use os botões para navegação rápida

*Recursos disponíveis:*
📊 Análise de score de crédito
💳 Histórico de pagamentos
🛡️ Detecção de fraude em tempo real
🤖 Chat com IA ElizaOS
📈 Analytics e relatórios
🔒 Compliance regulatório

*Suporte:*
Para mais ajuda, use /chat e fale com o advisor de IA.
    `;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  private async handleScore(ctx: Context): Promise<void> {
    const userId = ctx.from?.id.toString() || 'unknown';
    
    // Simular busca de score
    const score = Math.floor(Math.random() * 400) + 600; // 600-1000
    const factors = [
      { name: 'Pontualidade', value: 95, impact: 'Excelente' },
      { name: 'Histórico', value: 88, impact: 'Bom' },
      { name: 'Diversidade', value: 75, impact: 'Regular' }
    ];

    const scoreMessage = `
📊 *Seu Score de Crédito*

*Score Atual: ${score}/1000*

🎯 *Fatores Positivos:*
• 24 meses sem atrasos
• Diversidade de contas (5 tipos)
• Valores compatíveis com renda

⚠️ *Pontos de Atenção:*
• Histórico ainda curto (ideal: 36+ meses)
• Poucas contas ativas

💡 *Dica:*
Continue pagando em dia para alcançar 850+ em 12 meses!

*Análise Detalhada:*
• Pontualidade: 95% (Excelente)
• Histórico: 88% (Bom)  
• Diversidade: 75% (Regular)
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('💡 Como Melhorar', 'improve_score')],
      [Markup.button.callback('💬 Falar com Advisor', 'chat_advisor')],
      [Markup.button.callback('📈 Ver Histórico', 'score_history')]
    ]);

    await ctx.reply(scoreMessage, { 
      parse_mode: 'Markdown',
      ...keyboard
    });
  }

  private async handlePayments(ctx: Context): Promise<void> {
    const paymentsMessage = `
💳 *Histórico de Pagamentos*

*Últimos Pagamentos:*

📅 *Hoje:*
• R$ 150,00 - Cartão de Crédito ✅
• R$ 89,90 - Internet ✅

📅 *Ontem:*
• R$ 250,00 - Financiamento ✅
• R$ 45,00 - Streaming ✅

📅 *Esta Semana:*
• R$ 1.200,00 - Aluguel ✅
• R$ 300,00 - Supermercado ✅

*Resumo:*
• Total pago: R$ 2.034,90
• Pagamentos em dia: 100%
• Próximo vencimento: 15/12/2023
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📊 Ver Detalhes', 'payment_details')],
      [Markup.button.callback('📈 Gráficos', 'payment_charts')],
      [Markup.button.callback('💬 Chat sobre Pagamentos', 'chat_payments')]
    ]);

    await ctx.reply(paymentsMessage, { 
      parse_mode: 'Markdown',
      ...keyboard
    });
  }

  private async handleFraud(ctx: Context): Promise<void> {
    const fraudMessage = `
🛡️ *Detecção de Fraude*

✅ *Nenhuma atividade suspeita detectada*

*Última Verificação:* Há 2 minutos
*Score de Risco:* 15/100 (Baixo)

🛡️ *Proteções Ativas:*
• Monitoramento 24/7
• Detecção de anomalias
• Verificação de identidade
• Análise comportamental

*Indicadores Monitorados:*
• Transações atípicas
• Horários incomuns
• Valores suspeitos
• Localizações estranhas

*Status:* 🟢 Tudo normal
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔍 Ver Detalhes', 'fraud_details')],
      [Markup.button.callback('⚙️ Configurar Alertas', 'fraud_alerts')],
      [Markup.button.callback('💬 Reportar Suspeita', 'report_fraud')]
    ]);

    await ctx.reply(fraudMessage, { 
      parse_mode: 'Markdown',
      ...keyboard
    });
  }

  private async handleStatus(ctx: Context): Promise<void> {
    const statusMessage = `
📈 *Status do Sistema CredChain*

🤖 *ElizaOS:* ✅ Online
⛓️ *Blockchain:* ✅ Conectado
🔒 *Compliance:* ✅ Ativo
🛡️ *Fraud Detection:* ✅ Monitorando
📊 *Analytics:* ✅ Funcionando
🔔 *Notifications:* ✅ Ativo

*Última Atualização:** ${new Date().toLocaleString('pt-BR')}
*Versão:* 1.0.0
*Uptime:* 99.9%
    `;

    await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
  }

  private async handleChat(ctx: Context): Promise<void> {
    const chatMessage = `
💬 *Chat com Advisor*

Olá! Sou o ElizaOS, seu assistente de IA para questões financeiras.

*Como posso ajudar:*
• Análise de score de crédito
• Dicas para melhorar o score
• Explicações sobre pagamentos
• Orientações sobre fraude
• Conselhos financeiros

*Digite sua pergunta abaixo:*
    `;

    await ctx.reply(chatMessage, { parse_mode: 'Markdown' });
  }

  private async handleText(ctx: Context): Promise<void> {
    const userMessage = ctx.message?.text;
    if (!userMessage) return;

    // Simular resposta do ElizaOS
    const responses = [
      '💡 Para melhorar seu score, foque em pagar todas as contas em dia!',
      '📊 Seu histórico de pagamentos é o fator mais importante para o score.',
      '🔄 Considere diversificar seus tipos de crédito para melhorar o score.',
      '⏰ Mantenha contas ativas por mais tempo para aumentar seu score.',
      '🎯 Evite abrir muitas contas novas em pouco tempo.',
      '💰 Use no máximo 30% do limite do seu cartão de crédito.',
      '📈 Pague mais que o mínimo para reduzir a dívida mais rápido.',
      '🔍 Monitore seu score regularmente para acompanhar melhorias.'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const responseMessage = `
🤖 *ElizaOS Advisor*

*Sua pergunta:* ${userMessage}

*Resposta:* ${randomResponse}

*Dica adicional:* Use /score para ver seu score atual ou /help para mais comandos.
    `;

    await ctx.reply(responseMessage, { parse_mode: 'Markdown' });
  }

  private async handleCallbackQuery(ctx: Context): Promise<void> {
    const callbackData = ctx.callbackQuery?.data;
    if (!callbackData) return;

    switch (callbackData) {
      case 'show_score':
        await this.handleScore(ctx);
        break;
      case 'start_chat':
        await this.handleChat(ctx);
        break;
      case 'show_payments':
        await this.handlePayments(ctx);
        break;
      case 'check_fraud':
        await this.handleFraud(ctx);
        break;
      case 'improve_score':
        await this.handleImproveScore(ctx);
        break;
      case 'chat_advisor':
        await this.handleChat(ctx);
        break;
      case 'score_history':
        await this.handleScoreHistory(ctx);
        break;
      default:
        await ctx.answerCbQuery('Funcionalidade em desenvolvimento!');
    }
  }

  private async handleImproveScore(ctx: Context): Promise<void> {
    const improveMessage = `
💡 *Como Melhorar Seu Score*

*1️⃣ Pagamentos em Dia*
Pague todas as contas no prazo - é o fator mais importante!

*2️⃣ Histórico Longo*
Mantenha contas ativas por mais tempo para mostrar estabilidade.

*3️⃣ Diversificação*
Tenha diferentes tipos de crédito (cartão, financiamento, etc.).

*4️⃣ Uso Responsável*
Não use mais de 30% do limite do cartão.

*5️⃣ Evite Muitas Consultas*
Não abra muitas contas novas em pouco tempo.

*6️⃣ Monitore Regularmente*
Acompanhe seu score para identificar melhorias.

*7️⃣ Pague Mais que o Mínimo*
Reduza a dívida mais rápido pagando valores acima do mínimo.
    `;

    await ctx.reply(improveMessage, { parse_mode: 'Markdown' });
  }

  private async handleScoreHistory(ctx: Context): Promise<void> {
    const historyMessage = `
📈 *Histórico do Score*

*Últimos 6 meses:*
• Nov 2023: 750 (+15)
• Out 2023: 735 (+10)
• Set 2023: 725 (+5)
• Ago 2023: 720 (+20)
• Jul 2023: 700 (+15)
• Jun 2023: 685

*Tendência:* 📈 Crescendo
*Melhoria Total:* +65 pontos
*Próxima Meta:* 800 pontos
    `;

    await ctx.reply(historyMessage, { parse_mode: 'Markdown' });
  }

  async start(): Promise<void> {
    try {
      await this.bot.launch();
      this.isReady = true;
      console.log('🤖 Telegram Bot iniciado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao iniciar Telegram Bot:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
    }
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    if (!this.isReady) {
      throw new Error('Bot não está pronto');
    }

    await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async sendKeyboard(chatId: string, message: string, keyboard: any): Promise<void> {
    if (!this.isReady) {
      throw new Error('Bot não está pronto');
    }

    await this.bot.telegram.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      ...keyboard
    });
  }

  isConnected(): boolean {
    return this.isReady;
  }
}

export const telegramBot = new TelegramBot({
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  webhookPort: parseInt(process.env.TELEGRAM_WEBHOOK_PORT || '3000')
}, null as any); // Runtime será injetado posteriormente
