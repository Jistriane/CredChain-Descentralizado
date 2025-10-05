/**
 * Telegram Bot Integration with ElizaOS
 * 
 * Bot do Telegram integrado com ElizaOS para interação com usuários
 */

import TelegramBot from 'node-telegram-bot-api';
import { Logger } from '../utils/logger';
import { Config } from '../utils/config';
import { CredChainElizaOS } from '../index';

export interface TelegramBotConfig {
  token: string;
  webhookUrl?: string;
  enabledAgents: string[];
  commands: {
    start: string;
    help: string;
    score: string;
    chat: string;
    kyc: string;
    payments: string;
    advice: string;
    status: string;
  };
}

export class TelegramBot {
  private bot: TelegramBot;
  private logger: Logger;
  private config: TelegramBotConfig;
  private elizaOS: CredChainElizaOS;
  private isReady: boolean = false;

  constructor(config: TelegramBotConfig) {
    this.config = config;
    this.logger = new Logger('TelegramBot');
    this.elizaOS = new CredChainElizaOS();
    
    this.bot = new TelegramBot(config.token, { polling: true });
    
    this.setupEventHandlers();
  }

  /**
   * Configurar event handlers
   */
  private setupEventHandlers(): void {
    this.bot.on('message', async (msg) => {
      if (msg.from?.is_bot) return;
      
      try {
        await this.handleMessage(msg);
      } catch (error) {
        this.logger.error('Erro ao processar mensagem:', error);
        await this.bot.sendMessage(msg.chat.id, '❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.');
      }
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      try {
        await this.handleCallbackQuery(callbackQuery);
      } catch (error) {
        this.logger.error('Erro ao processar callback query:', error);
        await this.bot.answerCallbackQuery(callbackQuery.id, {
          text: '❌ Erro ao processar sua solicitação.',
          show_alert: true,
        });
      }
    });

    this.bot.on('error', (error) => {
      this.logger.error('Erro do Telegram Bot:', error);
    });

    this.bot.on('polling_error', (error) => {
      this.logger.error('Erro de polling do Telegram Bot:', error);
    });
  }

  /**
   * Processar mensagem do usuário
   */
  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const userId = msg.from?.id.toString() || '';

    this.logger.info(`Mensagem recebida de ${msg.from?.username}: ${text}`);

    // Comandos de texto
    if (text.startsWith('/start')) {
      await this.handleStartCommand(chatId, msg.from);
    } else if (text.startsWith('/help')) {
      await this.handleHelpCommand(chatId);
    } else if (text.startsWith('/score')) {
      await this.handleScoreCommand(chatId, text);
    } else if (text.startsWith('/chat')) {
      await this.handleChatCommand(chatId, text, userId);
    } else if (text.startsWith('/kyc')) {
      await this.handleKycCommand(chatId);
    } else if (text.startsWith('/payments')) {
      await this.handlePaymentsCommand(chatId);
    } else if (text.startsWith('/advice')) {
      await this.handleAdviceCommand(chatId, text);
    } else if (text.startsWith('/status')) {
      await this.handleStatusCommand(chatId);
    } else {
      // Chat geral com ElizaOS
      await this.handleGeneralChat(chatId, text, userId);
    }
  }

  /**
   * Comando /start
   */
  private async handleStartCommand(chatId: number, user?: TelegramBot.User): Promise<void> {
    const welcomeMessage = `
🤖 *Bem-vindo ao CredChain Bot!*

Olá ${user?.first_name || 'Usuário'}! Eu sou o ElizaOS, seu assistente de crédito inteligente.

*O que posso fazer por você:*
• 📊 Verificar seu score de crédito
• 💬 Conversar sobre finanças
• 🔐 Ajudar com verificação KYC
• 💳 Gerenciar pagamentos
• 💡 Dar conselhos financeiros

*Comandos disponíveis:*
/help - Ver todos os comandos
/score - Seu score de crédito
/chat - Conversar comigo
/kyc - Status da verificação
/payments - Seus pagamentos
/advice - Conselhos financeiros
/status - Status do sistema

*Como usar:*
• Digite /help para ver todos os comandos
• Use /chat [mensagem] para conversar comigo
• Ou simplesmente digite sua pergunta!

Estou aqui para ajudar você a gerenciar seu crédito de forma inteligente! 🚀
    `;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Ver Score', callback_data: 'view_score' },
            { text: '💬 Chat', callback_data: 'chat_eliza' }
          ],
          [
            { text: '🔐 KYC', callback_data: 'start_kyc' },
            { text: '💳 Pagamentos', callback_data: 'view_payments' }
          ],
          [
            { text: '💡 Conselhos', callback_data: 'get_advice' },
            { text: 'ℹ️ Ajuda', callback_data: 'show_help' }
          ]
        ]
      }
    };

    await this.bot.sendMessage(chatId, welcomeMessage, { 
      parse_mode: 'Markdown',
      ...keyboard
    });
  }

  /**
   * Comando /help
   */
  private async handleHelpCommand(chatId: number): Promise<void> {
    const helpMessage = `
📚 *Comandos do CredChain Bot*

*Comandos Principais:*
/start - Iniciar o bot
/help - Esta mensagem de ajuda
/score - Ver seu score de crédito
/score history - Histórico do score

*Chat e IA:*
/chat [mensagem] - Conversar com ElizaOS
/advice - Conselhos financeiros
/advice [tópico] - Conselhos sobre tópico específico

*Verificação e Pagamentos:*
/kyc - Status da verificação KYC
/payments - Ver seus pagamentos
/payments pending - Pagamentos pendentes

*Informações:*
/status - Status do sistema
/help - Esta mensagem

*Exemplos de uso:*
• /chat Como posso melhorar meu score?
• /advice investimento
• /score history

*Dica:* Você também pode simplesmente digitar sua pergunta sem usar comandos!
    `;

    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Comando /score
   */
  private async handleScoreCommand(chatId: number, text: string): Promise<void> {
    if (text.includes('history')) {
      const historyMessage = `
📈 *Histórico do Score de Crédito*

*Score Atual:* 750/1000
*Última Atualização:* Hoje
*Tendência:* 📈 +15 pontos

*Histórico dos últimos meses:*
• Jan 2024: 750 (+15)
• Dez 2023: 735 (+15)
• Nov 2023: 720 (+10)
• Out 2023: 710 (+5)

*Fatores que influenciaram:*
✅ Pagamentos em dia
✅ Diversidade de contas
✅ Valores compatíveis com renda

*Próximos passos:*
• Continue pagando em dia
• Mantenha saldos baixos
• Evite muitas consultas de crédito
      `;

      await this.bot.sendMessage(chatId, historyMessage, { parse_mode: 'Markdown' });
    } else {
      const scoreMessage = `
📊 *Seu Score de Crédito*

*Score:* 750/1000
*Classificação:* Bom Pagador
*Última Atualização:* Hoje

*Fatores Positivos:*
✅ 24 meses sem atrasos
✅ Diversidade de contas (5 tipos)
✅ Valores compatíveis com renda

*Pontos de Atenção:*
⚠️ Histórico ainda curto (ideal: 36+ meses)

*Para melhorar:*
• Continue pagando em dia
• Mantenha o uso do crédito baixo
• Não feche contas antigas
• Monitore seu relatório regularmente

Use /score history para ver o histórico completo!
      `;

      await this.bot.sendMessage(chatId, scoreMessage, { parse_mode: 'Markdown' });
    }
  }

  /**
   * Comando /chat
   */
  private async handleChatCommand(chatId: number, text: string, userId: string): Promise<void> {
    const userMessage = text.replace('/chat', '').trim();
    
    if (!userMessage) {
      await this.bot.sendMessage(chatId, '❌ Por favor, inclua uma mensagem. Exemplo: /chat Como posso melhorar meu score?');
      return;
    }

    try {
      const response = await this.simulateElizaOSResponse(userMessage, userId);
      
      await this.bot.sendMessage(chatId, `🤖 *ElizaOS Responde:*\n\n${response}`, { 
        parse_mode: 'Markdown' 
      });
    } catch (error) {
      this.logger.error('Erro no comando chat:', error);
      await this.bot.sendMessage(chatId, '❌ Erro ao processar sua mensagem. Tente novamente.');
    }
  }

  /**
   * Comando /kyc
   */
  private async handleKycCommand(chatId: number): Promise<void> {
    const kycMessage = `
🔐 *Verificação KYC*

*Status:* ✅ Aprovado
*Data de Verificação:* 15/01/2024
*Próxima Verificação:* 15/01/2025

*Documentos Verificados:*
✅ CPF
✅ RG
✅ Comprovante de Residência
✅ Comprovante de Renda

*Benefícios do KYC:*
• Acesso completo ao sistema
• Maior limite de crédito
• Transações mais seguras
• Proteção contra fraudes

Sua verificação KYC está em dia! 🎉
    `;

    await this.bot.sendMessage(chatId, kycMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Comando /payments
   */
  private async handlePaymentsCommand(chatId: number): Promise<void> {
    const paymentsMessage = `
💳 *Seus Pagamentos*

*Pagamentos em Dia:* 24/24
*Próximo Vencimento:* 01/02/2024
*Valor:* R$ 150,00

*Histórico Recente:*
✅ 15/01/2024 - R$ 150,00 (Pago)
✅ 15/12/2023 - R$ 150,00 (Pago)
✅ 15/11/2023 - R$ 150,00 (Pago)

*Estatísticas:*
• Pontualidade: 100%
• Valor Médio: R$ 150,00
• Frequência: Mensal

*Dica:* Continue pagando em dia para manter seu score alto! 📈
    `;

    await this.bot.sendMessage(chatId, paymentsMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Comando /advice
   */
  private async handleAdviceCommand(chatId: number, text: string): Promise<void> {
    const topic = text.replace('/advice', '').trim() || 'geral';
    const advice = await this.getFinancialAdvice(topic);
    
    await this.bot.sendMessage(chatId, `💡 *Conselhos Financeiros*\n\n${advice}`, { 
      parse_mode: 'Markdown' 
    });
  }

  /**
   * Comando /status
   */
  private async handleStatusCommand(chatId: number): Promise<void> {
    const statusMessage = `
📊 *Status do Sistema*

🟢 *ElizaOS:* Online
🟢 *Blockchain:* Sincronizado
🟢 *APIs:* Funcionando

*Estatísticas:*
📈 Score Médio: 720
👥 Usuários Ativos: 1,234
⏱️ Uptime: 99.9%

*Última Atualização:* Agora
*Versão:* 1.0.0

CredChain - Sistema Operacional ✅
    `;

    await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Chat geral com ElizaOS
   */
  private async handleGeneralChat(chatId: number, text: string, userId: string): Promise<void> {
    try {
      const response = await this.simulateElizaOSResponse(text, userId);
      
      await this.bot.sendMessage(chatId, `🤖 *ElizaOS:*\n\n${response}\n\n*Dica:* Use /help para ver todos os comandos!`, { 
        parse_mode: 'Markdown' 
      });
    } catch (error) {
      this.logger.error('Erro no chat geral:', error);
      await this.bot.sendMessage(chatId, '❌ Desculpe, não consegui processar sua mensagem. Tente novamente.');
    }
  }

  /**
   * Processar callback query
   */
  private async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;
    const userId = callbackQuery.from.id.toString();

    if (!chatId) return;

    switch (data) {
      case 'view_score':
        await this.handleScoreCommand(chatId, '/score');
        break;
      
      case 'chat_eliza':
        await this.bot.sendMessage(chatId, '💬 *Chat com ElizaOS*\n\nDigite sua pergunta ou use /chat [mensagem]', { 
          parse_mode: 'Markdown' 
        });
        break;
      
      case 'start_kyc':
        await this.handleKycCommand(chatId);
        break;
      
      case 'view_payments':
        await this.handlePaymentsCommand(chatId);
        break;
      
      case 'get_advice':
        await this.handleAdviceCommand(chatId, '/advice');
        break;
      
      case 'show_help':
        await this.handleHelpCommand(chatId);
        break;
    }

    await this.bot.answerCallbackQuery(callbackQuery.id);
  }

  /**
   * Simular resposta do ElizaOS
   */
  private async simulateElizaOSResponse(message: string, userId: string): Promise<string> {
    // Simular processamento do ElizaOS
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
      'Olá! Como posso ajudar você hoje?',
      'Entendo sua pergunta. Deixe-me analisar...',
      'Baseado nos seus dados, posso sugerir algumas melhorias.',
      'Seu score está em uma boa trajetória! Continue assim.',
      'Posso ajudá-lo com informações sobre crédito e pagamentos.',
      'Que ótima pergunta! Vou te ajudar com isso.',
      'Baseado no seu histórico, posso dar algumas dicas valiosas.',
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Obter conselhos financeiros
   */
  private async getFinancialAdvice(topic: string): Promise<string> {
    const adviceMap: Record<string, string> = {
      'geral': '💡 *Conselhos Gerais:*\n• Pague suas contas em dia\n• Mantenha o uso do crédito baixo\n• Monitore seu score regularmente\n• Evite muitas consultas de crédito',
      'score': '📊 *Para Melhorar seu Score:*\n• Pague todas as contas em dia\n• Mantenha saldos baixos nos cartões\n• Não feche contas antigas\n• Verifique seu relatório regularmente',
      'poupança': '💰 *Dicas de Poupança:*\n• Crie um fundo de emergência\n• Automatize suas economias\n• Invista em educação financeira\n• Diversifique seus investimentos',
      'investimento': '📈 *Investimentos:*\n• Comece com valores pequenos\n• Diversifique sua carteira\n• Invista regularmente\n• Mantenha o foco no longo prazo',
    };
    
    return adviceMap[topic] || adviceMap['geral'];
  }

  /**
   * Conectar bot
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando Telegram Bot...');
      this.isReady = true;
      this.logger.info('Telegram Bot conectado com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao conectar Telegram Bot:', error);
      throw error;
    }
  }

  /**
   * Desconectar bot
   */
  async disconnect(): Promise<void> {
    try {
      this.logger.info('Desconectando Telegram Bot...');
      await this.bot.stopPolling();
      this.isReady = false;
    } catch (error) {
      this.logger.error('Erro ao desconectar Telegram Bot:', error);
    }
  }

  /**
   * Verificar se bot está pronto
   */
  isBotReady(): boolean {
    return this.isReady;
  }

  /**
   * Obter informações do bot
   */
  async getBotInfo(): Promise<{ username: string; id: string; canJoinGroups: boolean }> {
    try {
      const me = await this.bot.getMe();
      return {
        username: me.username || 'Unknown',
        id: me.id.toString(),
        canJoinGroups: me.can_join_groups || false,
      };
    } catch (error) {
      this.logger.error('Erro ao obter informações do bot:', error);
      return {
        username: 'Unknown',
        id: 'Unknown',
        canJoinGroups: false,
      };
    }
  }

  /**
   * Enviar mensagem para usuário específico
   */
  async sendMessageToUser(userId: string, message: string): Promise<void> {
    try {
      await this.bot.sendMessage(userId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem para usuário:', error);
    }
  }

  /**
   * Enviar notificação para usuário
   */
  async sendNotificationToUser(userId: string, title: string, message: string): Promise<void> {
    try {
      const notificationMessage = `🔔 *${title}*\n\n${message}`;
      await this.bot.sendMessage(userId, notificationMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      this.logger.error('Erro ao enviar notificação:', error);
    }
  }
}

// Script standalone
if (require.main === module) {
  const config: TelegramBotConfig = {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    enabledAgents: ['orchestrator', 'creditAnalyzer', 'userAssistant'],
    commands: {
      start: '/start',
      help: '/help',
      score: '/score',
      chat: '/chat',
      kyc: '/kyc',
      payments: '/payments',
      advice: '/advice',
      status: '/status',
    },
  };

  if (!config.token) {
    console.error('TELEGRAM_BOT_TOKEN é obrigatório');
    process.exit(1);
  }

  const bot = new TelegramBot(config);
  
  bot.connect()
    .then(() => {
      console.log('Telegram Bot conectado com sucesso!');
    })
    .catch(error => {
      console.error('Erro ao conectar Telegram Bot:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Desconectando Telegram Bot...');
    await bot.disconnect();
    process.exit(0);
  });
}