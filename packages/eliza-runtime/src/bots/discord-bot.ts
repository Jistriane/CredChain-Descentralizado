/**
 * Discord Bot Integration with ElizaOS
 * 
 * Bot do Discord integrado com ElizaOS para interação com usuários
 */

import { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Logger } from '../utils/logger';
import { Config } from '../utils/config';
import { CredChainElizaOS } from '../index';

export interface DiscordBotConfig {
  token: string;
  clientId: string;
  guildId?: string;
  prefix: string;
  enabledAgents: string[];
}

export class DiscordBot {
  private client: Client;
  private logger: Logger;
  private config: DiscordBotConfig;
  private elizaOS: CredChainElizaOS;
  private isReady: boolean = false;

  constructor(config: DiscordBotConfig) {
    this.config = config;
    this.logger = new Logger('DiscordBot');
    this.elizaOS = new CredChainElizaOS();
    
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.setupEventHandlers();
  }

  /**
   * Configurar event handlers
   */
  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      this.logger.info(`Discord Bot conectado como ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on('messageCreate', async (message: Message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(this.config.prefix)) return;

      try {
        await this.handleMessage(message);
      } catch (error) {
        this.logger.error('Erro ao processar mensagem:', error);
        await message.reply('❌ Ocorreu um erro ao processar sua mensagem. Tente novamente.');
      }
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      try {
        await this.handleButtonInteraction(interaction);
      } catch (error) {
        this.logger.error('Erro ao processar interação:', error);
        await interaction.reply({
          content: '❌ Ocorreu um erro ao processar sua interação.',
          ephemeral: true,
        });
      }
    });

    this.client.on('error', (error) => {
      this.logger.error('Erro do Discord Bot:', error);
    });
  }

  /**
   * Processar mensagem do usuário
   */
  private async handleMessage(message: Message): Promise<void> {
    const content = message.content.slice(this.config.prefix.length).trim();
    const args = content.split(' ');
    const command = args[0].toLowerCase();

    this.logger.info(`Comando recebido: ${command} de ${message.author.username}`);

    switch (command) {
      case 'help':
        await this.sendHelpMessage(message);
        break;
      
      case 'score':
        await this.handleScoreCommand(message, args);
        break;
      
      case 'chat':
        await this.handleChatCommand(message, args);
        break;
      
      case 'kyc':
        await this.handleKycCommand(message);
        break;
      
      case 'payments':
        await this.handlePaymentsCommand(message);
        break;
      
      case 'advice':
        await this.handleAdviceCommand(message, args);
        break;
      
      case 'status':
        await this.handleStatusCommand(message);
        break;
      
      default:
        await this.handleGeneralChat(message, content);
        break;
    }
  }

  /**
   * Enviar mensagem de ajuda
   */
  private async sendHelpMessage(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('🤖 CredChain Bot - Comandos Disponíveis')
      .setDescription('Aqui estão os comandos que você pode usar:')
      .setColor(0x3B82F6)
      .addFields(
        {
          name: '📊 Score de Crédito',
          value: '`!score` - Ver seu score atual\n`!score history` - Histórico do score',
          inline: false,
        },
        {
          name: '💬 Chat com IA',
          value: '`!chat [mensagem]` - Conversar com ElizaOS\n`!advice` - Conselhos financeiros',
          inline: false,
        },
        {
          name: '🔐 Verificação',
          value: '`!kyc` - Status da verificação KYC\n`!kyc start` - Iniciar verificação',
          inline: false,
        },
        {
          name: '💳 Pagamentos',
          value: '`!payments` - Ver pagamentos\n`!payments pending` - Pagamentos pendentes',
          inline: false,
        },
        {
          name: 'ℹ️ Informações',
          value: '`!status` - Status do sistema\n`!help` - Esta mensagem',
          inline: false,
        }
      )
      .setFooter({ text: 'CredChain - Sistema Descentralizado de Credit Scoring' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  /**
   * Comando de score
   */
  private async handleScoreCommand(message: Message, args: string[]): Promise<void> {
    const userId = message.author.id;
    
    try {
      if (args[1] === 'history') {
        // Simular histórico de score
        const embed = new EmbedBuilder()
          .setTitle('📈 Histórico do Score de Crédito')
          .setColor(0x10B981)
          .addFields(
            { name: 'Score Atual', value: '750/1000', inline: true },
            { name: 'Última Atualização', value: 'Hoje', inline: true },
            { name: 'Tendência', value: '📈 +15 pontos', inline: true },
            { name: 'Histórico', value: '```\nJan 2024: 735\nDez 2023: 720\nNov 2023: 705\n```', inline: false }
          )
          .setFooter({ text: 'Mantenha os pagamentos em dia para melhorar seu score!' });

        await message.reply({ embeds: [embed] });
      } else {
        // Score atual
        const embed = new EmbedBuilder()
          .setTitle('📊 Seu Score de Crédito')
          .setColor(0x3B82F6)
          .addFields(
            { name: 'Score', value: '750/1000', inline: true },
            { name: 'Classificação', value: 'Bom Pagador', inline: true },
            { name: 'Última Atualização', value: 'Hoje', inline: true },
            { name: 'Fatores Positivos', value: '✅ 24 meses sem atrasos\n✅ Diversidade de contas\n✅ Valores compatíveis', inline: false },
            { name: 'Pontos de Atenção', value: '⚠️ Histórico ainda curto (ideal: 36+ meses)', inline: false }
          )
          .setFooter({ text: 'Use !score history para ver o histórico completo' });

        await message.reply({ embeds: [embed] });
      }
    } catch (error) {
      this.logger.error('Erro no comando score:', error);
      await message.reply('❌ Erro ao obter informações do score. Tente novamente.');
    }
  }

  /**
   * Comando de chat
   */
  private async handleChatCommand(message: Message, args: string[]): Promise<void> {
    const userMessage = args.slice(1).join(' ');
    
    if (!userMessage) {
      await message.reply('❌ Por favor, inclua uma mensagem. Exemplo: `!chat Como posso melhorar meu score?`');
      return;
    }

    try {
      // Simular resposta do ElizaOS
      const response = await this.simulateElizaOSResponse(userMessage, message.author.id);
      
      const embed = new EmbedBuilder()
        .setTitle('🤖 ElizaOS Responde')
        .setDescription(response)
        .setColor(0x8B5CF6)
        .setFooter({ text: 'Powered by ElizaOS AI' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Erro no comando chat:', error);
      await message.reply('❌ Erro ao processar sua mensagem. Tente novamente.');
    }
  }

  /**
   * Comando de KYC
   */
  private async handleKycCommand(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('🔐 Verificação KYC')
      .setColor(0xF59E0B)
      .addFields(
        { name: 'Status', value: '✅ Aprovado', inline: true },
        { name: 'Data de Verificação', value: '15/01/2024', inline: true },
        { name: 'Próxima Verificação', value: '15/01/2025', inline: true }
      )
      .setDescription('Sua verificação KYC está em dia! 🎉')
      .setFooter({ text: 'KYC é necessário para usar todos os recursos do CredChain' });

    await message.reply({ embeds: [embed] });
  }

  /**
   * Comando de pagamentos
   */
  private async handlePaymentsCommand(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('💳 Seus Pagamentos')
      .setColor(0x10B981)
      .addFields(
        { name: 'Pagamentos em Dia', value: '24/24', inline: true },
        { name: 'Próximo Vencimento', value: '01/02/2024', inline: true },
        { name: 'Valor', value: 'R$ 150,00', inline: true },
        { name: 'Histórico Recente', value: '```\n✅ 15/01/2024 - R$ 150,00\n✅ 15/12/2023 - R$ 150,00\n✅ 15/11/2023 - R$ 150,00\n```', inline: false }
      )
      .setFooter({ text: 'Continue pagando em dia para manter seu score alto!' });

    await message.reply({ embeds: [embed] });
  }

  /**
   * Comando de conselhos
   */
  private async handleAdviceCommand(message: Message, args: string[]): Promise<void> {
    const topic = args.slice(1).join(' ') || 'geral';
    
    const advice = await this.getFinancialAdvice(topic);
    
    const embed = new EmbedBuilder()
      .setTitle('💡 Conselhos Financeiros')
      .setDescription(advice)
      .setColor(0x10B981)
      .setFooter({ text: 'Conselhos personalizados pelo ElizaOS' });

    await message.reply({ embeds: [embed] });
  }

  /**
   * Comando de status
   */
  private async handleStatusCommand(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('📊 Status do Sistema')
      .setColor(0x3B82F6)
      .addFields(
        { name: '🟢 ElizaOS', value: 'Online', inline: true },
        { name: '🟢 Blockchain', value: 'Sincronizado', inline: true },
        { name: '🟢 APIs', value: 'Funcionando', inline: true },
        { name: '📈 Score Médio', value: '720', inline: true },
        { name: '👥 Usuários Ativos', value: '1,234', inline: true },
        { name: '⏱️ Uptime', value: '99.9%', inline: true }
      )
      .setFooter({ text: 'CredChain - Sistema Operacional' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  /**
   * Chat geral com ElizaOS
   */
  private async handleGeneralChat(message: Message, content: string): Promise<void> {
    try {
      const response = await this.simulateElizaOSResponse(content, message.author.id);
      
      const embed = new EmbedBuilder()
        .setTitle('🤖 ElizaOS')
        .setDescription(response)
        .setColor(0x8B5CF6)
        .setFooter({ text: 'Use !help para ver todos os comandos' });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      this.logger.error('Erro no chat geral:', error);
      await message.reply('❌ Desculpe, não consegui processar sua mensagem. Tente novamente.');
    }
  }

  /**
   * Processar interação de botão
   */
  private async handleButtonInteraction(interaction: any): Promise<void> {
    const { customId } = interaction;
    
    switch (customId) {
      case 'start_kyc':
        await interaction.reply({
          content: '🔐 Redirecionando para verificação KYC...',
          ephemeral: true,
        });
        break;
      
      case 'view_score':
        await interaction.reply({
          content: '📊 Carregando seu score...',
          ephemeral: true,
        });
        break;
      
      case 'chat_eliza':
        await interaction.reply({
          content: '💬 Iniciando chat com ElizaOS...',
          ephemeral: true,
        });
        break;
    }
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
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Obter conselhos financeiros
   */
  private async getFinancialAdvice(topic: string): Promise<string> {
    const adviceMap: Record<string, string> = {
      'geral': '💡 **Conselhos Gerais:**\n• Pague suas contas em dia\n• Mantenha o uso do crédito baixo\n• Monitore seu score regularmente\n• Evite muitas consultas de crédito',
      'score': '📊 **Para Melhorar seu Score:**\n• Pague todas as contas em dia\n• Mantenha saldos baixos nos cartões\n• Não feche contas antigas\n• Verifique seu relatório regularmente',
      'poupança': '💰 **Dicas de Poupança:**\n• Crie um fundo de emergência\n• Automatize suas economias\n• Invista em educação financeira\n• Diversifique seus investimentos',
      'investimento': '📈 **Investimentos:**\n• Comece com valores pequenos\n• Diversifique sua carteira\n• Invista regularmente\n• Mantenha o foco no longo prazo',
    };
    
    return adviceMap[topic] || adviceMap['geral'];
  }

  /**
   * Conectar bot
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando Discord Bot...');
      await this.client.login(this.config.token);
    } catch (error) {
      this.logger.error('Erro ao conectar Discord Bot:', error);
      throw error;
    }
  }

  /**
   * Desconectar bot
   */
  async disconnect(): Promise<void> {
    try {
      this.logger.info('Desconectando Discord Bot...');
      await this.client.destroy();
    } catch (error) {
      this.logger.error('Erro ao desconectar Discord Bot:', error);
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
  getBotInfo(): { username: string; id: string; guilds: number } {
    return {
      username: this.client.user?.username || 'Unknown',
      id: this.client.user?.id || 'Unknown',
      guilds: this.client.guilds.cache.size,
    };
  }

  /**
   * Enviar mensagem para canal específico
   */
  async sendMessageToChannel(channelId: string, message: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        await channel.send(message);
      }
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem para canal:', error);
    }
  }

  /**
   * Enviar embed para canal específico
   */
  async sendEmbedToChannel(channelId: string, embed: EmbedBuilder): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      this.logger.error('Erro ao enviar embed para canal:', error);
    }
  }
}

// Script standalone
if (require.main === module) {
  const config: DiscordBotConfig = {
    token: process.env.DISCORD_BOT_TOKEN || '',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    guildId: process.env.DISCORD_GUILD_ID,
    prefix: '!',
    enabledAgents: ['orchestrator', 'creditAnalyzer', 'userAssistant'],
  };

  if (!config.token) {
    console.error('DISCORD_BOT_TOKEN é obrigatório');
    process.exit(1);
  }

  const bot = new DiscordBot(config);
  
  bot.connect()
    .then(() => {
      console.log('Discord Bot conectado com sucesso!');
    })
    .catch(error => {
      console.error('Erro ao conectar Discord Bot:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Desconectando Discord Bot...');
    await bot.disconnect();
    process.exit(0);
  });
}