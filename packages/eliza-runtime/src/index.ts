/**
 * CredChain ElizaOS Runtime - Ponto de entrada principal
 * 
 * Integra todos os adapters e agentes para criar o sistema de IA completo
 */

import { Config } from './config';
import { Logger } from './utils/logger';
import {
  DatabaseAdapter,
  BlockchainAdapter,
  NotificationAdapter,
  AnalyticsAdapter,
  VoiceAdapter,
  ChatAdapter
} from './adapters';

// Importar agentes
import { credchainOrchestrator } from './agents/orchestrator';
import { creditAnalyzerAgent, analyzeCreditAction } from './agents/credit-analyzer';
import { complianceAgent, complianceCheckAction } from './agents/compliance';
import { fraudDetectorAgent, detectFraudAction } from './agents/fraud-detector';
import { userAssistantAgent, userSupportAction } from './agents/user-assistant';
import { financialAdvisorAgent, financialAdviceAction } from './agents/financial-advisor';

// Importar plugins
import { polkadotPlugin } from './plugins/polkadot-plugin';
import { compliancePlugin } from './plugins/compliance-plugin';
import { analyticsPlugin } from './plugins/analytics-plugin';
import { notificationPlugin } from './plugins/notification-plugin';

export interface ElizaRuntime {
  config: Config;
  logger: Logger;
  adapters: {
    database: DatabaseAdapter;
    blockchain: BlockchainAdapter;
    notifications: NotificationAdapter;
    analytics: AnalyticsAdapter;
    voice: VoiceAdapter;
    chat: ChatAdapter;
  };
  agents: {
    orchestrator: typeof credchainOrchestrator;
    creditAnalyzer: typeof creditAnalyzerAgent;
    compliance: typeof complianceAgent;
    fraudDetector: typeof fraudDetectorAgent;
    userAssistant: typeof userAssistantAgent;
    financialAdvisor: typeof financialAdvisorAgent;
  };
  actions: {
    analyzeCredit: typeof analyzeCreditAction;
    complianceCheck: typeof complianceCheckAction;
    detectFraud: typeof detectFraudAction;
    userSupport: typeof userSupportAction;
    financialAdvice: typeof financialAdviceAction;
  };
  plugins: {
    polkadot: typeof polkadotPlugin;
    compliance: typeof compliancePlugin;
    analytics: typeof analyticsPlugin;
    notification: typeof notificationPlugin;
  };
}

class ElizaRuntimeManager {
  private runtime: ElizaRuntime | null = null;
  private logger: Logger;
  private config: Config;

  constructor() {
    this.config = Config.getInstance();
    this.logger = new Logger('ElizaRuntimeManager');
  }

  /**
   * Inicializa o runtime completo
   */
  async initialize(): Promise<ElizaRuntime> {
    try {
      this.logger.info('🚀 Inicializando CredChain ElizaOS Runtime...');

      // Validar configuração
      const validation = this.config.validate();
      if (!validation.valid) {
        throw new Error(`Configuração inválida: ${validation.errors.join(', ')}`);
      }

      // Inicializar adapters
      const adapters = await this.initializeAdapters();

      // Criar runtime
      this.runtime = {
        config: this.config,
        logger: this.logger,
        adapters,
        agents: {
          orchestrator: credchainOrchestrator,
          creditAnalyzer: creditAnalyzerAgent,
          compliance: complianceAgent,
          fraudDetector: fraudDetectorAgent,
          userAssistant: userAssistantAgent,
          financialAdvisor: financialAdvisorAgent,
        },
        actions: {
          analyzeCredit: analyzeCreditAction,
          complianceCheck: complianceCheckAction,
          detectFraud: detectFraudAction,
          userSupport: userSupportAction,
          financialAdvice: financialAdviceAction,
        },
        plugins: {
          polkadot: polkadotPlugin,
          compliance: compliancePlugin,
          analytics: analyticsPlugin,
          notification: notificationPlugin,
        },
      };

      // Configurar agentes com adapters
      await this.configureAgents();

      this.logger.info('✅ CredChain ElizaOS Runtime inicializado com sucesso!');
      return this.runtime;
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar runtime:', error);
      throw error;
    }
  }

  /**
   * Inicializa todos os adapters
   */
  private async initializeAdapters(): Promise<ElizaRuntime['adapters']> {
    this.logger.info('🔌 Inicializando adapters...');

    const database = new DatabaseAdapter(this.config);
    const blockchain = new BlockchainAdapter(this.config);
    const notifications = new NotificationAdapter(this.config);
    const analytics = new AnalyticsAdapter(this.config);
    const voice = new VoiceAdapter(this.config);
    const chat = new ChatAdapter(this.config);

    // Conectar todos os adapters
    await Promise.all([
      database.connect(),
      blockchain.connect(),
      notifications.connect(),
      analytics.connect(),
      voice.connect(),
      chat.connect(),
    ]);

    this.logger.info('✅ Todos os adapters conectados');
    return {
      database,
      blockchain,
      notifications,
      analytics,
      voice,
      chat,
    };
  }

  /**
   * Configura agentes com adapters
   */
  private async configureAgents(): Promise<void> {
    if (!this.runtime) {
      throw new Error('Runtime não inicializado');
    }

    this.logger.info('🤖 Configurando agentes...');

    // Configurar plugins com adapters
    this.runtime.plugins.polkadot.actions.get_credit_score_on_chain.handler = 
      async (runtime, args) => {
        return await this.runtime!.adapters.blockchain.getCreditScore(args.accountId);
      };

    this.runtime.plugins.analytics.actions.log_event.handler = 
      async (runtime, args) => {
        await this.runtime!.adapters.analytics.trackEvent({
          eventName: args.eventName,
          userId: args.userId,
          properties: args.properties,
        });
        return { success: true };
      };

    this.runtime.plugins.notification.actions.send_notification.handler = 
      async (runtime, args) => {
        await this.runtime!.adapters.notifications.sendNotification({
          userId: args.userId,
          title: args.title,
          message: args.message,
          type: args.type as any,
          priority: 'medium',
          channels: ['in_app'],
        });
        return { success: true };
      };

    this.logger.info('✅ Agentes configurados');
  }

  /**
   * Processa mensagem através do orquestrador
   */
  async processMessage(userId: string, message: string, context?: any): Promise<string> {
    if (!this.runtime) {
      throw new Error('Runtime não inicializado');
    }

    try {
      this.logger.info(`📨 Processando mensagem de ${userId}: ${message}`);

      // Rastrear evento
      await this.runtime.adapters.analytics.trackEvent({
        eventName: 'user_message',
        userId,
        properties: { message, context },
      });

      // Determinar agente apropriado
      const agent = await this.routeToAgent(message, context);
      
      // Processar com agente
      const response = await this.processWithAgent(agent, userId, message, context);

      // Rastrear resposta
      await this.runtime.adapters.analytics.trackEvent({
        eventName: 'agent_response',
        userId,
        properties: { agent: agent.name, response },
      });

      return response;
    } catch (error) {
      this.logger.error('❌ Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Roteia mensagem para agente apropriado
   */
  private async routeToAgent(message: string, context?: any): Promise<any> {
    if (!this.runtime) {
      throw new Error('Runtime não inicializado');
    }

    const lowerMessage = message.toLowerCase();

    // Roteamento baseado em palavras-chave
    if (lowerMessage.includes('score') || lowerMessage.includes('crédito')) {
      return this.runtime.agents.creditAnalyzer;
    }
    
    if (lowerMessage.includes('compliance') || lowerMessage.includes('lgpd') || lowerMessage.includes('gdpr')) {
      return this.runtime.agents.compliance;
    }
    
    if (lowerMessage.includes('fraude') || lowerMessage.includes('suspeito')) {
      return this.runtime.agents.fraudDetector;
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte')) {
      return this.runtime.agents.userAssistant;
    }
    
    if (lowerMessage.includes('investimento') || lowerMessage.includes('finanças')) {
      return this.runtime.agents.financialAdvisor;
    }

    // Default: Orquestrador
    return this.runtime.agents.orchestrator;
  }

  /**
   * Processa mensagem com agente específico
   */
  private async processWithAgent(agent: any, userId: string, message: string, context?: any): Promise<string> {
    if (!this.runtime) {
      throw new Error('Runtime não inicializado');
    }

    // Simular processamento com agente
    // Em uma implementação real, isso seria feito através do framework ElizaOS
    const agentName = agent.name || 'Orchestrator';
    
    // Exemplo de resposta baseada no agente
    switch (agentName) {
      case 'Credit Analyzer':
        return `📊 Analisando seu score de crédito... Seu score atual é 750/1000. Continue pagando em dia para melhorar!`;
      
      case 'Compliance Guardian':
        return `✅ Verificando conformidade... Todas as operações estão em conformidade com LGPD e GDPR.`;
      
      case 'Fraud Detector':
        return `🔍 Analisando padrões... Nenhuma atividade suspeita detectada. Sua conta está segura.`;
      
      case 'User Assistant':
        return `👋 Olá! Como posso ajudá-lo hoje? Posso esclarecer dúvidas sobre seu score, pagamentos ou qualquer outro assunto.`;
      
      case 'Financial Advisor':
        return `💡 Com base no seu perfil, recomendo diversificar seus investimentos e manter uma reserva de emergência.`;
      
      default:
        return `🤖 Sou o CredChain AI. Posso ajudá-lo com análise de crédito, compliance, detecção de fraude e muito mais. O que gostaria de saber?`;
    }
  }

  /**
   * Obtém status do runtime
   */
  async getStatus(): Promise<any> {
    if (!this.runtime) {
      return { initialized: false };
    }

    const adapterStatuses = await Promise.all([
      this.runtime.adapters.database.getStatus(),
      this.runtime.adapters.blockchain.getStatus(),
      this.runtime.adapters.notifications.getStatus(),
      this.runtime.adapters.analytics.getStatus(),
      this.runtime.adapters.voice.getStatus(),
      this.runtime.adapters.chat.getStatus(),
    ]);

    return {
      initialized: true,
      adapters: {
        database: adapterStatuses[0],
        blockchain: adapterStatuses[1],
        notifications: adapterStatuses[2],
        analytics: adapterStatuses[3],
        voice: adapterStatuses[4],
        chat: adapterStatuses[5],
      },
      agents: Object.keys(this.runtime.agents),
      plugins: Object.keys(this.runtime.plugins),
    };
  }

  /**
   * Desconecta todos os adapters
   */
  async shutdown(): Promise<void> {
    if (!this.runtime) {
      return;
    }

    try {
      this.logger.info('🔄 Desconectando runtime...');

      await Promise.all([
        this.runtime.adapters.database.disconnect(),
        this.runtime.adapters.blockchain.disconnect(),
        this.runtime.adapters.notifications.disconnect(),
        this.runtime.adapters.analytics.disconnect(),
        this.runtime.adapters.voice.disconnect(),
        this.runtime.adapters.chat.disconnect(),
      ]);

      this.runtime = null;
      this.logger.info('✅ Runtime desconectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar runtime:', error);
      throw error;
    }
  }

  /**
   * Obtém instância do runtime
   */
  getRuntime(): ElizaRuntime | null {
    return this.runtime;
  }
}

// Exportar instância singleton
export const elizaRuntime = new ElizaRuntimeManager();

// Exportar tipos
export type { ElizaRuntime };

// Função de inicialização para uso externo
export async function initializeCredChain(): Promise<ElizaRuntime> {
  return await elizaRuntime.initialize();
}

// Função de processamento de mensagem para uso externo
export async function processUserMessage(userId: string, message: string, context?: any): Promise<string> {
  return await elizaRuntime.processMessage(userId, message, context);
}

// Função de status para uso externo
export async function getCredChainStatus(): Promise<any> {
  return await elizaRuntime.getStatus();
}

// Função de shutdown para uso externo
export async function shutdownCredChain(): Promise<void> {
  return await elizaRuntime.shutdown();
}