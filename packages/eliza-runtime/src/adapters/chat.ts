import { Config } from '../config';
import { Logger } from '../utils/logger';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export interface ChatMessage {
  id: string;
  userId: string;
  agentName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'voice' | 'image' | 'file';
  metadata?: {
    sentiment?: number;
    intent?: string;
    entities?: any[];
    confidence?: number;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  agentName: string;
  startedAt: number;
  lastActivity: number;
  status: 'active' | 'closed' | 'escalated';
  summary?: string;
  metadata?: any;
}

export interface ChatConfig {
  maxMessageLength: number;
  maxMessagesPerSession: number;
  sessionTimeout: number;
  enableVoice: boolean;
  enableFileUpload: boolean;
  enableImageUpload: boolean;
}

export class ChatAdapter {
  private config: Config;
  private logger: Logger;
  private io: SocketIOServer | null = null;
  private chatConfig: ChatConfig;
  private activeSessions: Map<string, ChatSession> = new Map();
  private messageHistory: Map<string, ChatMessage[]> = new Map();

  constructor(config: Config) {
    this.config = config;
    this.logger = new Logger('ChatAdapter');
    this.chatConfig = {
      maxMessageLength: parseInt(config.get('CHAT_MAX_MESSAGE_LENGTH', '1000')),
      maxMessagesPerSession: parseInt(config.get('CHAT_MAX_MESSAGES_PER_SESSION', '100')),
      sessionTimeout: parseInt(config.get('CHAT_SESSION_TIMEOUT', '3600000')), // 1 hora
      enableVoice: config.get('CHAT_ENABLE_VOICE', 'true') === 'true',
      enableFileUpload: config.get('CHAT_ENABLE_FILE_UPLOAD', 'true') === 'true',
      enableImageUpload: config.get('CHAT_ENABLE_IMAGE_UPLOAD', 'true') === 'true',
    };
  }

  /**
   * Conecta ao serviço de chat
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando ao serviço de chat...');

      // Inicia limpeza de sessões inativas
      this.startSessionCleanup();

      this.logger.info('✅ Serviço de chat conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao serviço de chat:', error);
      throw error;
    }
  }

  /**
   * Inicializa servidor WebSocket
   */
  initializeWebSocket(server: HTTPServer): void {
    try {
      this.io = new SocketIOServer(server, {
        cors: {
          origin: "*", // Ajustar para produção
          methods: ["GET", "POST"]
        },
        path: '/chat'
      });

      this.setupWebSocketHandlers();
      this.logger.info('✅ WebSocket inicializado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar WebSocket:', error);
      throw error;
    }
  }

  /**
   * Configura handlers do WebSocket
   */
  private setupWebSocketHandlers(): void {
    if (!this.io) {
      return;
    }

    this.io.on('connection', (socket) => {
      this.logger.info(`Cliente conectado: ${socket.id}`);

      // Handler para iniciar sessão de chat
      socket.on('startChat', async (data: { userId: string; agentName: string }) => {
        try {
          const session = await this.startChatSession(data.userId, data.agentName);
          socket.emit('chatStarted', { sessionId: session.id });
          this.logger.info(`Sessão de chat iniciada: ${session.id}`);
        } catch (error) {
          socket.emit('chatError', { message: 'Erro ao iniciar sessão de chat' });
          this.logger.error('Erro ao iniciar sessão de chat:', error);
        }
      });

      // Handler para enviar mensagem
      socket.on('sendMessage', async (data: { sessionId: string; content: string; type: string }) => {
        try {
          const message = await this.sendMessage(data.sessionId, data.content, data.type as any);
          socket.emit('messageReceived', message);
          this.logger.info(`Mensagem enviada: ${message.id}`);
        } catch (error) {
          socket.emit('chatError', { message: 'Erro ao enviar mensagem' });
          this.logger.error('Erro ao enviar mensagem:', error);
        }
      });

      // Handler para encerrar sessão
      socket.on('endChat', async (data: { sessionId: string }) => {
        try {
          await this.endChatSession(data.sessionId);
          socket.emit('chatEnded', { sessionId: data.sessionId });
          this.logger.info(`Sessão de chat encerrada: ${data.sessionId}`);
        } catch (error) {
          socket.emit('chatError', { message: 'Erro ao encerrar sessão de chat' });
          this.logger.error('Erro ao encerrar sessão de chat:', error);
        }
      });

      // Handler para desconexão
      socket.on('disconnect', () => {
        this.logger.info(`Cliente desconectado: ${socket.id}`);
      });
    });
  }

  /**
   * Inicia sessão de chat
   */
  async startChatSession(userId: string, agentName: string): Promise<ChatSession> {
    try {
      const sessionId = this.generateSessionId();
      const now = Date.now();

      const session: ChatSession = {
        id: sessionId,
        userId,
        agentName,
        startedAt: now,
        lastActivity: now,
        status: 'active',
        metadata: {
          userAgent: 'unknown',
          ipAddress: 'unknown',
        },
      };

      this.activeSessions.set(sessionId, session);
      this.messageHistory.set(sessionId, []);

      this.logger.info(`Sessão de chat iniciada: ${sessionId} para ${userId} com ${agentName}`);
      return session;
    } catch (error) {
      this.logger.error('❌ Erro ao iniciar sessão de chat:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem
   */
  async sendMessage(sessionId: string, content: string, type: ChatMessage['type'] = 'text'): Promise<ChatMessage> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Sessão de chat não encontrada');
      }

      if (session.status !== 'active') {
        throw new Error('Sessão de chat não está ativa');
      }

      if (content.length > this.chatConfig.maxMessageLength) {
        throw new Error(`Mensagem muito longa. Máximo: ${this.chatConfig.maxMessageLength} caracteres`);
      }

      const message: ChatMessage = {
        id: this.generateMessageId(),
        userId: session.userId,
        agentName: session.agentName,
        content,
        timestamp: Date.now(),
        type,
        metadata: {
          sentiment: this.analyzeSentiment(content),
          intent: this.extractIntent(content),
          entities: this.extractEntities(content),
          confidence: 0.95, // Simulado
        },
      };

      // Adiciona mensagem ao histórico
      const messages = this.messageHistory.get(sessionId) || [];
      messages.push(message);
      this.messageHistory.set(sessionId, messages);

      // Atualiza atividade da sessão
      session.lastActivity = message.timestamp;
      this.activeSessions.set(sessionId, session);

      // Envia para agente (simulado)
      await this.routeMessageToAgent(message);

      this.logger.info(`Mensagem enviada: ${message.id} para ${session.agentName}`);
      return message;
    } catch (error) {
      this.logger.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Roteia mensagem para agente
   */
  private async routeMessageToAgent(message: ChatMessage): Promise<void> {
    try {
      // Simula roteamento para agente
      const agentService = this.config.get('AGENT_SERVICE_URL');
      if (!agentService) {
        this.logger.warn('AGENT_SERVICE_URL não configurado, roteamento simulado');
        return;
      }

      await axios.post(`${agentService}/chat/message`, {
        messageId: message.id,
        userId: message.userId,
        agentName: message.agentName,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
      });

      this.logger.info(`Mensagem roteada para agente: ${message.agentName}`);
    } catch (error) {
      this.logger.error('❌ Erro ao rotear mensagem para agente:', error);
    }
  }

  /**
   * Encerra sessão de chat
   */
  async endChatSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Sessão de chat não encontrada');
      }

      session.status = 'closed';
      session.summary = this.generateSessionSummary(sessionId);
      this.activeSessions.set(sessionId, session);

      this.logger.info(`Sessão de chat encerrada: ${sessionId}`);
    } catch (error) {
      this.logger.error('❌ Erro ao encerrar sessão de chat:', error);
      throw error;
    }
  }

  /**
   * Obtém histórico de mensagens
   */
  async getMessageHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = this.messageHistory.get(sessionId) || [];
      return messages.slice(-limit);
    } catch (error) {
      this.logger.error('❌ Erro ao obter histórico de mensagens:', error);
      return [];
    }
  }

  /**
   * Obtém sessões ativas
   */
  async getActiveSessions(userId?: string): Promise<ChatSession[]> {
    try {
      const sessions = Array.from(this.activeSessions.values());
      if (userId) {
        return sessions.filter(session => session.userId === userId);
      }
      return sessions;
    } catch (error) {
      this.logger.error('❌ Erro ao obter sessões ativas:', error);
      return [];
    }
  }

  /**
   * Analisa sentimento da mensagem
   */
  private analyzeSentiment(content: string): number {
    // Implementação simples de análise de sentimento
    const positiveWords = ['bom', 'ótimo', 'excelente', 'perfeito', 'obrigado', 'obrigada'];
    const negativeWords = ['ruim', 'terrível', 'horrível', 'problema', 'erro', 'falha'];

    const words = content.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return Math.max(-1, Math.min(1, score / words.length));
  }

  /**
   * Extrai intenção da mensagem
   */
  private extractIntent(content: string): string {
    // Implementação simples de extração de intenção
    const intents = {
      'greeting': ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
      'question': ['como', 'quando', 'onde', 'por que', 'o que'],
      'complaint': ['reclamação', 'problema', 'erro', 'falha'],
      'compliment': ['parabéns', 'excelente', 'ótimo', 'perfeito'],
    };

    const contentLower = content.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return intent;
      }
    }

    return 'unknown';
  }

  /**
   * Extrai entidades da mensagem
   */
  private extractEntities(content: string): any[] {
    // Implementação simples de extração de entidades
    const entities = [];

    // Extrai números
    const numbers = content.match(/\d+/g);
    if (numbers) {
      numbers.forEach(number => {
        entities.push({
          type: 'number',
          value: parseInt(number),
          confidence: 0.9,
        });
      });
    }

    // Extrai emails
    const emails = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    if (emails) {
      emails.forEach(email => {
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.95,
        });
      });
    }

    return entities;
  }

  /**
   * Gera resumo da sessão
   */
  private generateSessionSummary(sessionId: string): string {
    try {
      const messages = this.messageHistory.get(sessionId) || [];
      if (messages.length === 0) {
        return 'Sessão sem mensagens';
      }

      const userMessages = messages.filter(msg => msg.userId !== 'system');
      const topics = this.extractTopics(messages);
      const sentiment = this.calculateSessionSentiment(messages);

      return `Sessão com ${userMessages.length} mensagens. Tópicos: ${topics.join(', ')}. Sentimento: ${sentiment > 0 ? 'positivo' : sentiment < 0 ? 'negativo' : 'neutro'}`;
    } catch (error) {
      this.logger.error('❌ Erro ao gerar resumo da sessão:', error);
      return 'Erro ao gerar resumo';
    }
  }

  /**
   * Extrai tópicos das mensagens
   */
  private extractTopics(messages: ChatMessage[]): string[] {
    const topics = new Set<string>();
    const commonTopics = {
      'score': ['score', 'crédito', 'pontuação'],
      'pagamento': ['pagamento', 'pagar', 'fatura'],
      'conta': ['conta', 'perfil', 'dados'],
      'ajuda': ['ajuda', 'suporte', 'dúvida'],
    };

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      for (const [topic, keywords] of Object.entries(commonTopics)) {
        if (keywords.some(keyword => content.includes(keyword))) {
          topics.add(topic);
        }
      }
    });

    return Array.from(topics);
  }

  /**
   * Calcula sentimento da sessão
   */
  private calculateSessionSentiment(messages: ChatMessage[]): number {
    const sentiments = messages
      .filter(msg => msg.metadata?.sentiment !== undefined)
      .map(msg => msg.metadata!.sentiment!);

    if (sentiments.length === 0) {
      return 0;
    }

    return sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length;
  }

  /**
   * Inicia limpeza de sessões inativas
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000); // 5 minutos
  }

  /**
   * Limpa sessões inativas
   */
  private cleanupInactiveSessions(): void {
    try {
      const now = Date.now();
      const inactiveSessions: string[] = [];

      this.activeSessions.forEach((session, sessionId) => {
        if (now - session.lastActivity > this.chatConfig.sessionTimeout) {
          inactiveSessions.push(sessionId);
        }
      });

      inactiveSessions.forEach(sessionId => {
        const session = this.activeSessions.get(sessionId);
        if (session) {
          session.status = 'closed';
          session.summary = this.generateSessionSummary(sessionId);
          this.activeSessions.set(sessionId, session);
        }
      });

      if (inactiveSessions.length > 0) {
        this.logger.info(`✅ ${inactiveSessions.length} sessões inativas encerradas`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao limpar sessões inativas:', error);
    }
  }

  /**
   * Gera ID único para sessão
   */
  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera ID único para mensagem
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém estatísticas do chat
   */
  async getChatStats(): Promise<any> {
    try {
      const activeSessions = Array.from(this.activeSessions.values());
      const totalMessages = Array.from(this.messageHistory.values())
        .reduce((sum, messages) => sum + messages.length, 0);

      return {
        activeSessions: activeSessions.length,
        totalMessages,
        averageMessagesPerSession: activeSessions.length > 0 ? totalMessages / activeSessions.length : 0,
        sessionsByAgent: this.groupSessionsByAgent(activeSessions),
        config: this.chatConfig,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter estatísticas do chat:', error);
      return {
        activeSessions: 0,
        totalMessages: 0,
        averageMessagesPerSession: 0,
        sessionsByAgent: {},
        config: this.chatConfig,
      };
    }
  }

  /**
   * Agrupa sessões por agente
   */
  private groupSessionsByAgent(sessions: ChatSession[]): Record<string, number> {
    const groups: Record<string, number> = {};
    sessions.forEach(session => {
      groups[session.agentName] = (groups[session.agentName] || 0) + 1;
    });
    return groups;
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<any> {
    return {
      connected: true,
      activeSessions: this.activeSessions.size,
      webSocketConnected: this.io !== null,
      config: this.chatConfig,
    };
  }

  /**
   * Desconecta do serviço de chat
   */
  async disconnect(): Promise<void> {
    try {
      if (this.io) {
        this.io.close();
        this.io = null;
      }

      this.activeSessions.clear();
      this.messageHistory.clear();

      this.logger.info('✅ Desconectado do serviço de chat');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar do serviço de chat:', error);
      throw error;
    }
  }
}