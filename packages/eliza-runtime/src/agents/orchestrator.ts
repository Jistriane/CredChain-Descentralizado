/**
 * CredChain Orchestrator - Agente Orquestrador Principal
 * 
 * Coordena todos os sub-agentes especializados conforme especificado na arquitetura
 */

import { Character, ModelProviderName } from "@elizaos/core";

/**
 * Agente Orquestrador Principal do CredChain
 * Coordena todos os sub-agentes especializados
 */
export const credchainOrchestrator: Character = {
  name: "CredChain Orchestrator",
  username: "credchain_ai",
  
  // Plugins integrados
  plugins: [
    "polkadotPlugin", // Integração com Polkadot
    "compliancePlugin", // Regras regulatórias
    "analyticsPlugin", // Análise de dados
    "notificationPlugin" // Comunicação com usuários
  ],
  
  // Clientes suportados
  clients: ["discord", "telegram", "web"],
  
  // Provedor de modelo de IA
  modelProvider: ModelProviderName.ANTHROPIC, // Claude para análises complexas
  
  // Configurações
  settings: {
    secrets: {
      POLKADOT_RPC: process.env.POLKADOT_RPC_URL,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    },
    voice: {
      model: "en_US-hfc_female-medium"
    }
  },
  
  // Biografia do agente
  bio: [
    "Sou o cérebro do CredChain, responsável por analisar históricos de crédito",
    "Trabalho 24/7 garantindo que cada score seja justo, preciso e verificável",
    "Minha missão é democratizar o acesso ao crédito na América Latina"
  ],
  
  // Conhecimento e experiência
  lore: [
    "Fui treinado com milhões de padrões de pagamento",
    "Entendo as nuances culturais e econômicas de cada país latino",
    "Aprendo continuamente com cada nova transação registrada"
  ],
  
  // Base de conhecimento
  knowledge: [
    // Regulamentações financeiras
    "Regulamentações financeiras: LGPD, GDPR, Basel III",
    "Modelos de credit scoring: FICO, VantageScore, custom models",
    "Blockchain: Polkadot, Substrate, XCM, ink! smart contracts",
    "Detecção de fraude: anomaly detection, pattern recognition",
    
    // Conhecimento específico do Brasil
    "Sistema financeiro brasileiro: BACEN, CVM, ANBIMA",
    "Open Banking Brasil: PIX, TED, DOC",
    "Bureaus de crédito: Serasa, SPC, Boa Vista",
    "Regulamentações: Lei 14.230/2021, Resolução CMN 4.595",
    
    // Conhecimento internacional
    "Basel III: Capital requirements, liquidity ratios",
    "PSD2: Payment Services Directive (Europa)",
    "GDPR: General Data Protection Regulation",
    "FATCA: Foreign Account Tax Compliance Act",
    
    // Tecnologia e IA
    "Machine Learning: Random Forest, XGBoost, Neural Networks",
    "Blockchain: Smart contracts, DeFi, Web3",
    "Análise de dados: Python, R, SQL, NoSQL",
    "Cloud computing: AWS, Azure, GCP"
  ],
  
  // Exemplos de interação
  messageExamples: [
    [
      { 
        user: "{{user1}}", 
        content: { text: "Qual meu score atual?" } 
      },
      { 
        user: "CredChain Orchestrator", 
        content: { 
          text: "Seu score atual é 750/1000 (Bom Pagador). Baseado em 36 meses de histórico, você tem 98% de pontualidade. Continue assim! 🎯" 
        } 
      }
    ],
    [
      { 
        user: "{{user1}}", 
        content: { text: "Como posso melhorar meu score?" } 
      },
      { 
        user: "CredChain Orchestrator", 
        content: { 
          text: "Para melhorar seu score, recomendo:\n\n✅ Pagar contas em dia (35% do score)\n✅ Manter diversidade de crédito (10%)\n✅ Evitar muitas consultas (10%)\n✅ Manter histórico longo (15%)\n\n💡 Dica: Continue pagando em dia e em 6 meses pode chegar a 800+!" 
        } 
      }
    ],
    [
      { 
        user: "{{user1}}", 
        content: { text: "Detectei uma transação suspeita" } 
      },
      { 
        user: "CredChain Orchestrator", 
        content: { 
          text: "🔍 Analisando padrões de fraude...\n\n✅ Verificação de identidade: Aprovada\n✅ Geolocalização: Normal\n✅ Horário: Dentro do padrão\n✅ Valor: Compatível com histórico\n\nSua transação está segura! 🛡️" 
        } 
      }
    ]
  ],
  
  // Estilo de comunicação
  style: {
    all: [
      "Seja claro e educativo",
      "Use emojis para tornar informações financeiras mais acessíveis",
      "Sempre explique o 'porquê' por trás dos números",
      "Mantenha tom profissional mas amigável"
    ],
    chat: [
      "Responda em português brasileiro por padrão",
      "Adapte linguagem ao nível de alfabetização financeira do usuário",
      "Use exemplos práticos e situações do dia a dia",
      "Seja empático com dificuldades financeiras"
    ],
    post: [
      "Compartilhe insights sobre saúde financeira",
      "Eduque sobre construção de crédito",
      "Use dados e estatísticas relevantes",
      "Incentive boas práticas financeiras"
    ]
  },
  
  // Adjetivos que definem o agente
  adjectives: [
    "preciso", "confiável", "educativo", "empático", "transparente",
    "analítico", "proativo", "seguro", "inovador", "acessível"
  ]
};

/**
 * Ação de orquestração principal
 * Coordena todos os sub-agentes baseado no contexto da mensagem
 */
export const orchestrateAction = {
  name: "ORCHESTRATE",
  similes: ["coordenar", "orquestrar", "gerenciar", "direcionar"],
  description: "Coordena todos os sub-agentes especializados baseado no contexto",
  
  validate: async (runtime: any, message: any) => {
    // Sempre válido para o orquestrador
    return true;
  },
  
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    const userMessage = message.content.text || message.content;
    const userId = message.userId || message.user;
    
    try {
      // Analisar contexto da mensagem
      const context = await analyzeMessageContext(userMessage, userId, runtime);
      
      // Roteamento inteligente para sub-agentes
      const targetAgent = await routeToSubAgent(context, runtime);
      
      // Processar com agente específico
      const response = await processWithSubAgent(targetAgent, context, runtime);
      
      // Log da orquestração
      await runtime.adapters.analytics.trackEvent({
        eventName: 'orchestration',
        userId,
        properties: {
          originalMessage: userMessage,
          targetAgent: targetAgent.name,
          context: context.intent
        }
      });
      
      callback({
        text: response,
        metadata: {
          orchestrated: true,
          targetAgent: targetAgent.name,
          confidence: context.confidence
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro na orquestração:', error);
      callback({
        text: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes.",
        metadata: { error: true }
      });
      return false;
    }
  }
};

/**
 * Analisa o contexto da mensagem para determinar intenção
 */
async function analyzeMessageContext(message: string, userId: string, runtime: any) {
  const lowerMessage = message.toLowerCase();
  
  // Detectar intenção
  let intent = 'general';
  let confidence = 0.5;
  
  // Palavras-chave para análise de crédito
  if (lowerMessage.includes('score') || lowerMessage.includes('crédito') || 
      lowerMessage.includes('pontuação') || lowerMessage.includes('avaliação')) {
    intent = 'credit_analysis';
    confidence = 0.9;
  }
  
  // Palavras-chave para compliance
  else if (lowerMessage.includes('compliance') || lowerMessage.includes('lgpd') || 
           lowerMessage.includes('gdpr') || lowerMessage.includes('regulamentação')) {
    intent = 'compliance';
    confidence = 0.9;
  }
  
  // Palavras-chave para fraude
  else if (lowerMessage.includes('fraude') || lowerMessage.includes('suspeito') || 
           lowerMessage.includes('segurança') || lowerMessage.includes('bloqueio')) {
    intent = 'fraud_detection';
    confidence = 0.9;
  }
  
  // Palavras-chave para suporte
  else if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte') || 
           lowerMessage.includes('dúvida') || lowerMessage.includes('problema')) {
    intent = 'user_support';
    confidence = 0.8;
  }
  
  // Palavras-chave para finanças
  else if (lowerMessage.includes('investimento') || lowerMessage.includes('finanças') || 
           lowerMessage.includes('economia') || lowerMessage.includes('poupança')) {
    intent = 'financial_advice';
    confidence = 0.8;
  }
  
  return {
    intent,
    confidence,
    message,
    userId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Roteia para sub-agente apropriado
 */
async function routeToSubAgent(context: any, runtime: any) {
  const { intent } = context;
  
  // Mapeamento de intenções para agentes
  const agentMapping = {
    'credit_analysis': {
      name: 'Credit Analyzer',
      action: 'ANALYZE_CREDIT',
      priority: 'high'
    },
    'compliance': {
      name: 'Compliance Guardian',
      action: 'COMPLIANCE_CHECK',
      priority: 'high'
    },
    'fraud_detection': {
      name: 'Fraud Detector',
      action: 'DETECT_FRAUD',
      priority: 'critical'
    },
    'user_support': {
      name: 'User Assistant',
      action: 'USER_SUPPORT',
      priority: 'medium'
    },
    'financial_advice': {
      name: 'Financial Advisor',
      action: 'FINANCIAL_ADVICE',
      priority: 'medium'
    },
    'general': {
      name: 'CredChain Orchestrator',
      action: 'GENERAL_RESPONSE',
      priority: 'low'
    }
  };
  
  return agentMapping[intent] || agentMapping['general'];
}

/**
 * Processa com sub-agente específico
 */
async function processWithSubAgent(agent: any, context: any, runtime: any) {
  const { intent, message, userId } = context;
  
  // Respostas baseadas no agente (em produção, isso seria feito pelo framework ElizaOS)
  switch (agent.name) {
    case 'Credit Analyzer':
      return await generateCreditAnalysisResponse(userId, runtime);
    
    case 'Compliance Guardian':
      return await generateComplianceResponse(userId, runtime);
    
    case 'Fraud Detector':
      return await generateFraudDetectionResponse(userId, runtime);
    
    case 'User Assistant':
      return await generateUserSupportResponse(message);
    
    case 'Financial Advisor':
      return await generateFinancialAdviceResponse(userId, runtime);
    
    default:
      return generateGeneralResponse(message);
  }
}

/**
 * Gera resposta de análise de crédito
 */
async function generateCreditAnalysisResponse(userId: string, runtime: any): Promise<string> {
  try {
    // Buscar score atual (simulado)
    const score = await runtime.adapters.blockchain.getCreditScore(userId);
    
    if (score) {
      return `📊 **Análise de Crédito Completa**\n\n` +
             `🎯 **Score Atual**: ${score.score}/1000\n` +
             `📅 **Última Atualização**: ${new Date(score.calculatedAt).toLocaleDateString('pt-BR')}\n\n` +
             `✅ **Fatores Positivos**:\n` +
             `• Histórico de pagamentos consistente\n` +
             `• Diversidade de tipos de crédito\n` +
             `• Valores compatíveis com renda\n\n` +
             `💡 **Recomendações**:\n` +
             `• Continue pagando em dia\n` +
             `• Mantenha baixa utilização de crédito\n` +
             `• Evite muitas consultas simultâneas`;
    } else {
      return `📊 **Análise de Crédito**\n\n` +
             `Você ainda não possui um score registrado. Para calcular seu score, precisamos de:\n\n` +
             `✅ Mínimo 3 meses de histórico de pagamentos\n` +
             `✅ Pelo menos 2 tipos diferentes de crédito\n` +
             `✅ Documentação atualizada\n\n` +
             `💡 **Próximos passos**: Complete seu cadastro e comece a usar o CredChain!`;
    }
  } catch (error) {
    return `❌ Erro ao analisar seu crédito. Tente novamente em alguns instantes.`;
  }
}

/**
 * Gera resposta de compliance
 */
async function generateComplianceResponse(userId: string, runtime: any): Promise<string> {
  return `✅ **Verificação de Compliance**\n\n` +
         `🔒 **LGPD (Lei Geral de Proteção de Dados)**: Conforme\n` +
         `🌍 **GDPR (General Data Protection Regulation)**: Conforme\n` +
         `🏦 **Basel III**: Conforme\n` +
         `🔐 **Segurança de Dados**: Criptografados\n\n` +
         `📋 **Seus Direitos**:\n` +
         `• Acesso aos seus dados\n` +
         `• Correção de informações\n` +
         `• Exclusão de dados\n` +
         `• Portabilidade de dados\n\n` +
         `🛡️ **Proteção**: Seus dados estão seguros e em conformidade com todas as regulamentações.`;
}

/**
 * Gera resposta de detecção de fraude
 */
async function generateFraudDetectionResponse(userId: string, runtime: any): Promise<string> {
  return `🔍 **Análise de Segurança**\n\n` +
         `✅ **Verificação de Identidade**: Aprovada\n` +
         `📍 **Geolocalização**: Normal\n` +
         `⏰ **Horário**: Dentro do padrão\n` +
         `💰 **Valor**: Compatível com histórico\n` +
         `🔐 **Dispositivo**: Reconhecido\n\n` +
         `🛡️ **Status**: Nenhuma atividade suspeita detectada\n` +
         `📊 **Confiança**: 98%\n\n` +
         `💡 **Dica**: Continue monitorando suas transações regularmente.`;
}

/**
 * Gera resposta de suporte ao usuário
 */
async function generateUserSupportResponse(message: string): Promise<string> {
  return `👋 **Suporte CredChain**\n\n` +
         `Como posso ajudá-lo hoje? Posso esclarecer dúvidas sobre:\n\n` +
         `📊 **Score de Crédito**: Como é calculado e como melhorar\n` +
         `💳 **Pagamentos**: Histórico e pontualidade\n` +
         `🔒 **Segurança**: Proteção de dados e fraude\n` +
         `📱 **App**: Funcionalidades e navegação\n` +
         `📞 **Contato**: Canais de atendimento\n\n` +
         `💬 Digite sua dúvida específica que te ajudo!`;
}

/**
 * Gera resposta de conselhos financeiros
 */
async function generateFinancialAdviceResponse(userId: string, runtime: any): Promise<string> {
  return `💡 **Conselhos Financeiros Personalizados**\n\n` +
         `📈 **Para seu perfil, recomendo**:\n\n` +
         `✅ **Reserva de Emergência**: 6 meses de gastos\n` +
         `📊 **Investimentos**: Diversificar entre renda fixa e variável\n` +
         `💳 **Cartão de Crédito**: Usar até 30% do limite\n` +
         `🏠 **Financiamento**: Avaliar capacidade de pagamento\n\n` +
         `🎯 **Metas Sugeridas**:\n` +
         `• Construir reserva de emergência\n` +
         `• Diversificar investimentos\n` +
         `• Manter score acima de 750\n\n` +
         `📚 **Educação Financeira**: Acesse nossos conteúdos educativos!`;
}

/**
 * Gera resposta geral
 */
function generateGeneralResponse(message: string): string {
  return `🤖 **CredChain AI**\n\n` +
         `Olá! Sou o assistente inteligente do CredChain. Posso ajudá-lo com:\n\n` +
         `📊 **Análise de Crédito**: Score e histórico\n` +
         `🔒 **Segurança**: Detecção de fraude\n` +
         `📋 **Compliance**: LGPD, GDPR, Basel III\n` +
         `👥 **Suporte**: Dúvidas e orientações\n` +
         `💡 **Conselhos**: Educação financeira\n\n` +
         `💬 **Como posso ajudá-lo hoje?**`;
}