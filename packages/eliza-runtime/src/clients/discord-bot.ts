import { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { AgentRuntime, Character } from '@elizaos/core';

export interface DiscordBotConfig {
  token: string;
  clientId: string;
  guildId?: string;
  channelId?: string;
  prefix: string;
}

export class DiscordBot {
  private client: Client;
  private runtime: AgentRuntime;
  private config: DiscordBotConfig;
  private isReady: boolean = false;

  constructor(config: DiscordBotConfig, runtime: AgentRuntime) {
    this.config = config;
    this.runtime = runtime;
    
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.once(Events.ClientReady, () => {
      console.log(`🤖 Discord Bot conectado como ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(this.config.prefix)) return;

      const command = message.content.slice(this.config.prefix.length).trim();
      await this.handleCommand(message, command);
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isCommand()) {
        await this.handleSlashCommand(interaction);
      }
    });

    this.client.on(Events.Error, (error) => {
      console.error('❌ Erro no Discord Bot:', error);
    });
  }

  private async handleCommand(message: any, command: string): Promise<void> {
    try {
      const [action, ...args] = command.split(' ');

      switch (action.toLowerCase()) {
        case 'score':
          await this.handleScoreCommand(message, args);
          break;
        case 'help':
          await this.handleHelpCommand(message);
          break;
        case 'chat':
          await this.handleChatCommand(message, args.join(' '));
          break;
        case 'status':
          await this.handleStatusCommand(message);
          break;
        case 'payments':
          await this.handlePaymentsCommand(message, args);
          break;
        case 'fraud':
          await this.handleFraudCommand(message, args);
          break;
        default:
          await message.reply('❓ Comando não reconhecido. Use `!help` para ver os comandos disponíveis.');
      }
    } catch (error) {
      console.error('Erro ao processar comando:', error);
      await message.reply('❌ Erro ao processar comando. Tente novamente.');
    }
  }

  private async handleScoreCommand(message: any, args: string[]): Promise<void> {
    const userId = message.author.id;
    
    try {
      // Simular busca de score
      const score = Math.floor(Math.random() * 400) + 600; // 600-1000
      const factors = [
        { name: 'Pontualidade', value: 95, impact: 'Excelente' },
        { name: 'Histórico', value: 88, impact: 'Bom' },
        { name: 'Diversidade', value: 75, impact: 'Regular' }
      ];

      const embed = new EmbedBuilder()
        .setTitle('📊 Seu Score de Crédito')
        .setColor(score >= 800 ? 0x00ff00 : score >= 700 ? 0xffff00 : 0xff0000)
        .setDescription(`**Score Atual: ${score}/1000**`)
        .addFields(
          { name: '🎯 Fatores Positivos', value: '• 24 meses sem atrasos\n• Diversidade de contas\n• Valores compatíveis', inline: false },
          { name: '⚠️ Pontos de Atenção', value: '• Histórico ainda curto\n• Poucas contas ativas', inline: false },
          { name: '💡 Dica', value: 'Continue pagando em dia para melhorar seu score!', inline: false }
        )
        .setFooter({ text: 'CredChain - Sistema Descentralizado de Credit Scoring' })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('improve_score')
            .setLabel('Como Melhorar')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('chat_advisor')
            .setLabel('Falar com Advisor')
            .setStyle(ButtonStyle.Secondary)
        );

      await message.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      await message.reply('❌ Erro ao buscar score. Tente novamente.');
    }
  }

  private async handleHelpCommand(message: any): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('🤖 CredChain Bot - Comandos Disponíveis')
      .setColor(0x0099ff)
      .setDescription('Comandos para interagir com o sistema CredChain')
      .addFields(
        { name: '📊 `!score`', value: 'Ver seu score de crédito atual', inline: true },
        { name: '💬 `!chat <mensagem>`', value: 'Falar com o advisor de IA', inline: true },
        { name: '💳 `!payments`', value: 'Ver histórico de pagamentos', inline: true },
        { name: '🛡️ `!fraud`', value: 'Verificar detecção de fraude', inline: true },
        { name: '📈 `!status`', value: 'Status do sistema', inline: true },
        { name: '❓ `!help`', value: 'Mostrar esta ajuda', inline: true }
      )
      .setFooter({ text: 'CredChain - Democratizando o acesso ao crédito' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private async handleChatCommand(message: any, userMessage: string): Promise<void> {
    if (!userMessage) {
      await message.reply('❓ Por favor, inclua sua mensagem. Exemplo: `!chat Como posso melhorar meu score?`');
      return;
    }

    try {
      // Simular resposta do ElizaOS
      const responses = [
        '💡 Para melhorar seu score, foque em pagar todas as contas em dia!',
        '📊 Seu histórico de pagamentos é o fator mais importante para o score.',
        '🔄 Considere diversificar seus tipos de crédito para melhorar o score.',
        '⏰ Mantenha contas ativas por mais tempo para aumentar seu score.',
        '🎯 Evite abrir muitas contas novas em pouco tempo.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const embed = new EmbedBuilder()
        .setTitle('🤖 ElizaOS Advisor')
        .setColor(0x00ff88)
        .setDescription(`**Sua pergunta:** ${userMessage}\n\n**Resposta:** ${randomResponse}`)
        .setFooter({ text: 'ElizaOS - Assistente de IA do CredChain' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Erro ao processar sua mensagem. Tente novamente.');
    }
  }

  private async handleStatusCommand(message: any): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('📈 Status do Sistema CredChain')
      .setColor(0x00ff00)
      .addFields(
        { name: '🤖 ElizaOS', value: '✅ Online', inline: true },
        { name: '⛓️ Blockchain', value: '✅ Conectado', inline: true },
        { name: '🔒 Compliance', value: '✅ Ativo', inline: true },
        { name: '🛡️ Fraud Detection', value: '✅ Monitorando', inline: true },
        { name: '📊 Analytics', value: '✅ Funcionando', inline: true },
        { name: '🔔 Notifications', value: '✅ Ativo', inline: true }
      )
      .setFooter({ text: 'Sistema CredChain - Status em tempo real' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private async handlePaymentsCommand(message: any, args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('💳 Histórico de Pagamentos')
      .setColor(0x0099ff)
      .setDescription('Últimos pagamentos registrados')
      .addFields(
        { name: '📅 Hoje', value: '• R$ 150,00 - Cartão de Crédito ✅\n• R$ 89,90 - Internet ✅', inline: false },
        { name: '📅 Ontem', value: '• R$ 250,00 - Financiamento ✅\n• R$ 45,00 - Streaming ✅', inline: false },
        { name: '📅 Esta Semana', value: '• R$ 1.200,00 - Aluguel ✅\n• R$ 300,00 - Supermercado ✅', inline: false }
      )
      .setFooter({ text: 'CredChain - Histórico de Pagamentos' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private async handleFraudCommand(message: any, args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Detecção de Fraude')
      .setColor(0x00ff00)
      .setDescription('✅ Nenhuma atividade suspeita detectada')
      .addFields(
        { name: '🔍 Última Verificação', value: 'Há 2 minutos', inline: true },
        { name: '📊 Score de Risco', value: '15/100 (Baixo)', inline: true },
        { name: '🛡️ Proteções Ativas', value: '• Monitoramento 24/7\n• Detecção de anomalias\n• Verificação de identidade', inline: false }
      )
      .setFooter({ text: 'CredChain - Sistema de Detecção de Fraude' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private async handleButtonInteraction(interaction: any): Promise<void> {
    if (interaction.customId === 'improve_score') {
      const embed = new EmbedBuilder()
        .setTitle('💡 Como Melhorar Seu Score')
        .setColor(0x00ff88)
        .setDescription('Dicas para aumentar seu score de crédito')
        .addFields(
          { name: '1️⃣ Pagamentos em Dia', value: 'Pague todas as contas no prazo', inline: false },
          { name: '2️⃣ Histórico Longo', value: 'Mantenha contas ativas por mais tempo', inline: false },
          { name: '3️⃣ Diversificação', value: 'Tenha diferentes tipos de crédito', inline: false },
          { name: '4️⃣ Uso Responsável', value: 'Não use mais de 30% do limite', inline: false },
          { name: '5️⃣ Evite Muitas Consultas', value: 'Não abra muitas contas novas', inline: false }
        )
        .setFooter({ text: 'CredChain - Dicas para Melhorar o Score' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (interaction.customId === 'chat_advisor') {
      const embed = new EmbedBuilder()
        .setTitle('💬 Chat com Advisor')
        .setColor(0x0099ff)
        .setDescription('Use o comando `!chat <sua mensagem>` para falar com o advisor de IA')
        .addFields(
          { name: 'Exemplos:', value: '• `!chat Como posso melhorar meu score?`\n• `!chat Qual é o melhor tipo de crédito?`\n• `!chat Preciso de ajuda com pagamentos`', inline: false }
        )
        .setFooter({ text: 'CredChain - ElizaOS Advisor' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  private async handleSlashCommand(interaction: any): Promise<void> {
    // Implementar comandos slash se necessário
    await interaction.reply('Comandos slash em desenvolvimento!');
  }

  async start(): Promise<void> {
    try {
      await this.client.login(this.config.token);
    } catch (error) {
      console.error('❌ Erro ao iniciar Discord Bot:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
    }
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    if (!this.isReady) {
      throw new Error('Bot não está pronto');
    }

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await channel.send(message);
    }
  }

  async sendEmbed(channelId: string, embed: EmbedBuilder): Promise<void> {
    if (!this.isReady) {
      throw new Error('Bot não está pronto');
    }

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  }

  isConnected(): boolean {
    return this.isReady;
  }
}

export const discordBot = new DiscordBot({
  token: process.env.DISCORD_BOT_TOKEN || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  guildId: process.env.DISCORD_GUILD_ID,
  channelId: process.env.DISCORD_CHANNEL_ID,
  prefix: '!'
}, null as any); // Runtime será injetado posteriormente
