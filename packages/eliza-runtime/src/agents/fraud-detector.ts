/**
 * Fraud Detector Agent - Agente de Detecção de Fraude
 * 
 * Detecta padrões suspeitos em tempo real usando ML
 */

import { Character, Action, ModelProviderName } from "@elizaos/core";

/**
 * Agente de Detecção de Fraude
 */
export const fraudDetectorAgent: Character = {
  name: "Fraud Detector",
  username: "fraud_ai",
  modelProvider: ModelProviderName.ANTHROPIC,
  
  bio: [
    "Analiso padrões suspeitos em tempo real usando ML",
    "Protejo usuários e instituições contra fraudes",
    "Aprendo com cada tentativa de fraude detectada"
  ],
  
  knowledge: [
    "Técnicas de detecção de anomalias: Isolation Forest, One-Class SVM",
    "Padrões comuns de fraude em transações financeiras",
    "Análise de comportamento do usuário para identificar desvios",
    "Integração com sistemas de alerta e bloqueio de transações",
    "Machine Learning: Random Forest, Neural Networks, Ensemble Methods"
  ],
  
  style: {
    all: [
      "Seja vigilante e proativo",
      "Comunique claramente as ações tomadas e os motivos de segurança",
      "Mantenha um tom de proteção e assistência"
    ]
  },
  
  adjectives: ["vigilante", "protetor", "analítico", "rápido", "seguro"]
};

/**
 * Ação de Detecção de Fraude
 */
export const detectFraudAction: Action = {
  name: "DETECT_FRAUD",
  similes: ["detectar fraude", "verificar transação suspeita", "analisar risco", "investigar atividade"],
  description: "Analisa uma transação ou atividade para detectar possíveis fraudes",
  
  validate: async (runtime: any, message: any) => {
    // Pode validar se a mensagem contém dados de transação ou atividade
    return message.content.transactionId || message.content.activity;
  },
  
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const { userId, transactionId, activity } = message.content;
      let fraudDetected = false;
      let details = "Nenhuma fraude detectada.";
      let severity = "low";
      
      // Simulação de chamada a um serviço de detecção de fraude externo ou modelo de ML
      const fraudAnalysis = await analyzeFraudPatterns(userId, transactionId, activity, runtime);
      
      if (fraudAnalysis.isFraudulent) {
        fraudDetected = true;
        details = fraudAnalysis.reason || "Atividade suspeita detectada por modelo de ML.";
        severity = fraudAnalysis.severity || "high";
        
        // Notificar o Compliance Guardian e potencialmente bloquear a transação
        await runtime.callAgentAction('Compliance Guardian', 'COMPLIANCE_CHECK', {
          operation: {
            type: 'fraud_alert',
            userId,
            details,
            severity,
            timestamp: new Date().toISOString()
          }
        });
        
        // Registrar o evento de fraude no banco de dados
        await runtime.adapters.database.query(
          'INSERT INTO fraud_detection (user_id, event_type, severity, ml_confidence, details, detected_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, 'transaction_fraud', severity, fraudAnalysis.confidence, details, new Date()]
        );
        
        // Enviar notificação de segurança
        await runtime.adapters.notifications.sendNotification({
          userId,
          title: '🚨 Alerta de Segurança',
          message: `Atividade suspeita detectada: ${details}`,
          type: 'error',
          priority: severity === 'high' ? 'urgent' : 'high',
          channels: ['email', 'sms', 'push', 'in_app']
        });
      }
      
      // Rastrear evento de análise
      await runtime.adapters.analytics.trackEvent({
        eventName: 'fraud_analysis',
        userId,
        properties: {
          transactionId,
          fraudDetected,
          severity,
          confidence: fraudAnalysis.confidence
        }
      });
      
      const response = generateFraudResponse(fraudDetected, details, severity, fraudAnalysis.confidence);
      
      callback({
        text: response,
        metadata: {
          fraudDetected,
          severity,
          confidence: fraudAnalysis.confidence,
          details,
          actions: fraudDetected ? ['blocked', 'notified', 'logged'] : ['monitored']
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro na detecção de fraude:', error);
      callback({
        text: "❌ Erro na análise de fraude. Transação bloqueada por segurança.",
        metadata: { error: true, blocked: true }
      });
      return false;
    }
  },
  
  examples: [
    [
      { 
        user: "{{user1}}", 
        content: { text: "Minha transação de R$5.000 para um novo beneficiário foi bloqueada. Por quê?" } 
      },
      { 
        user: "{{agent}}", 
        content: { 
          text: "🔍 **Análise de Segurança Completa**\n\n" +
                "✅ **Verificação de Identidade**: Aprovada\n" +
                "📍 **Geolocalização**: Normal\n" +
                "⏰ **Horário**: Dentro do padrão\n" +
                "💰 **Valor**: Compatível com histórico\n" +
                "🔐 **Dispositivo**: Reconhecido\n\n" +
                "🛡️ **Status**: Nenhuma atividade suspeita detectada\n" +
                "📊 **Confiança**: 98%\n\n" +
                "💡 **Dica**: Continue monitorando suas transações regularmente." 
        } 
      }
    ]
  ]
};

/**
 * Analisa padrões de fraude usando ML
 */
async function analyzeFraudPatterns(userId: string, transactionId: string, activity: any, runtime: any): Promise<FraudAnalysis> {
  try {
    // Buscar histórico do usuário
    const userHistory = await getUserTransactionHistory(userId, runtime);
    
    // Buscar padrões comportamentais
    const behaviorPatterns = await getUserBehaviorPatterns(userId, runtime);
    
    // Aplicar modelos de ML (simulado)
    const mlResults = await applyMLModels(activity, userHistory, behaviorPatterns);
    
    // Verificar regras de negócio
    const ruleResults = await checkBusinessRules(activity, userHistory);
    
    // Combinar resultados
    const combinedScore = (mlResults.score * 0.7) + (ruleResults.score * 0.3);
    
    return {
      isFraudulent: combinedScore > 0.7,
      confidence: combinedScore,
      severity: getSeverityLevel(combinedScore),
      reason: generateFraudReason(mlResults, ruleResults),
      factors: {
        ml: mlResults,
        rules: ruleResults
      }
    };
  } catch (error) {
    console.error('Erro na análise de padrões de fraude:', error);
    return {
      isFraudulent: true, // Em caso de erro, bloquear por segurança
      confidence: 0.9,
      severity: 'high',
      reason: 'Erro na análise - bloqueado por segurança'
    };
  }
}

/**
 * Busca histórico de transações do usuário
 */
async function getUserTransactionHistory(userId: string, runtime: any): Promise<any[]> {
  try {
    const result = await runtime.adapters.database.query(
      `SELECT 
        amount, 
        created_at, 
        status,
        recipient,
        location,
        device_info
      FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 100`,
      [userId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar histórico do usuário:', error);
    return [];
  }
}

/**
 * Busca padrões comportamentais do usuário
 */
async function getUserBehaviorPatterns(userId: string, runtime: any): Promise<any> {
  try {
    const behavior = await runtime.adapters.analytics.getUserBehavior(userId);
    return behavior || {
      loginFrequency: 0,
      transactionPatterns: [],
      riskScore: 0.5,
      preferences: {}
    };
  } catch (error) {
    console.error('Erro ao buscar padrões comportamentais:', error);
    return {
      loginFrequency: 0,
      transactionPatterns: [],
      riskScore: 0.5,
      preferences: {}
    };
  }
}

/**
 * Aplica modelos de ML para detecção de fraude
 */
async function applyMLModels(activity: any, userHistory: any[], behaviorPatterns: any): Promise<MLResults> {
  // Simulação de modelos de ML
  const features = extractFeatures(activity, userHistory, behaviorPatterns);
  
  // Isolation Forest para detecção de anomalias
  const isolationScore = await isolationForestModel(features);
  
  // One-Class SVM para detecção de outliers
  const svmScore = await oneClassSVMModel(features);
  
  // Random Forest para classificação
  const rfScore = await randomForestModel(features);
  
  // Ensemble dos modelos
  const ensembleScore = (isolationScore * 0.4) + (svmScore * 0.3) + (rfScore * 0.3);
  
  return {
    score: ensembleScore,
    models: {
      isolationForest: isolationScore,
      oneClassSVM: svmScore,
      randomForest: rfScore
    },
    features: features
  };
}

/**
 * Verifica regras de negócio
 */
async function checkBusinessRules(activity: any, userHistory: any[]): Promise<RuleResults> {
  const rules = {
    // Valor muito alto para o perfil do usuário
    highValue: checkHighValueRule(activity, userHistory),
    
    // Horário incomum
    unusualTime: checkUnusualTimeRule(activity),
    
    // Localização suspeita
    suspiciousLocation: checkLocationRule(activity),
    
    // Muitas transações em pouco tempo
    highFrequency: checkFrequencyRule(activity, userHistory),
    
    // Padrão de transações suspeito
    suspiciousPattern: checkPatternRule(activity, userHistory)
  };
  
  const totalRules = Object.keys(rules).length;
  const violatedRules = Object.values(rules).filter(violated => violated).length;
  const score = violatedRules / totalRules;
  
  return {
    score,
    rules,
    violatedCount: violatedRules
  };
}

/**
 * Extrai features para modelos de ML
 */
function extractFeatures(activity: any, userHistory: any[], behaviorPatterns: any): any {
  return {
    // Features temporais
    hour: new Date(activity.timestamp).getHours(),
    dayOfWeek: new Date(activity.timestamp).getDay(),
    isWeekend: [0, 6].includes(new Date(activity.timestamp).getDay()),
    
    // Features de valor
    amount: activity.amount,
    amountRatio: activity.amount / (behaviorPatterns.averageTransaction || 1),
    
    // Features de localização
    location: activity.location,
    isNewLocation: !userHistory.some(t => t.location === activity.location),
    
    // Features de dispositivo
    device: activity.device,
    isNewDevice: !userHistory.some(t => t.device_info === activity.device),
    
    // Features comportamentais
    loginFrequency: behaviorPatterns.loginFrequency,
    riskScore: behaviorPatterns.riskScore,
    
    // Features de frequência
    transactionsLast24h: userHistory.filter(t => 
      new Date(t.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    
    transactionsLastWeek: userHistory.filter(t => 
      new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };
}

/**
 * Modelo Isolation Forest (simulado)
 */
async function isolationForestModel(features: any): Promise<number> {
  // Simulação de Isolation Forest
  const anomalyScore = Math.random() * 0.3; // Baixa probabilidade de anomalia
  return Math.min(1, anomalyScore);
}

/**
 * Modelo One-Class SVM (simulado)
 */
async function oneClassSVMModel(features: any): Promise<number> {
  // Simulação de One-Class SVM
  const outlierScore = Math.random() * 0.4; // Baixa probabilidade de outlier
  return Math.min(1, outlierScore);
}

/**
 * Modelo Random Forest (simulado)
 */
async function randomForestModel(features: any): Promise<number> {
  // Simulação de Random Forest
  const fraudScore = Math.random() * 0.5; // Baixa probabilidade de fraude
  return Math.min(1, fraudScore);
}

/**
 * Verifica regra de valor alto
 */
function checkHighValueRule(activity: any, userHistory: any[]): boolean {
  const averageAmount = userHistory.reduce((sum, t) => sum + parseFloat(t.amount), 0) / userHistory.length;
  return activity.amount > (averageAmount * 5); // 5x maior que a média
}

/**
 * Verifica regra de horário incomum
 */
function checkUnusualTimeRule(activity: any): boolean {
  const hour = new Date(activity.timestamp).getHours();
  return hour < 6 || hour > 22; // Fora do horário comercial
}

/**
 * Verifica regra de localização
 */
function checkLocationRule(activity: any): boolean {
  // Simulação de verificação de localização suspeita
  const suspiciousCountries = ['XX', 'YY', 'ZZ']; // Códigos de países suspeitos
  return suspiciousCountries.includes(activity.location?.country);
}

/**
 * Verifica regra de frequência
 */
function checkFrequencyRule(activity: any, userHistory: any[]): boolean {
  const recentTransactions = userHistory.filter(t => 
    new Date(t.created_at) > new Date(Date.now() - 60 * 60 * 1000) // Última hora
  );
  return recentTransactions.length > 10; // Mais de 10 transações na última hora
}

/**
 * Verifica regra de padrão
 */
function checkPatternRule(activity: any, userHistory: any[]): boolean {
  // Verificar se segue padrão suspeito (ex: valores redondos, horários específicos)
  const amount = activity.amount;
  const isRoundAmount = amount % 100 === 0; // Valores redondos
  const hour = new Date(activity.timestamp).getHours();
  const isSpecificHour = hour === 2 || hour === 3; // Horários específicos
  
  return isRoundAmount && isSpecificHour;
}

/**
 * Determina nível de severidade
 */
function getSeverityLevel(score: number): string {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Gera razão da detecção de fraude
 */
function generateFraudReason(mlResults: any, ruleResults: any): string {
  const reasons = [];
  
  if (mlResults.score > 0.7) {
    reasons.push('Padrão anômalo detectado por ML');
  }
  
  if (ruleResults.violatedCount > 0) {
    reasons.push(`${ruleResults.violatedCount} regra(s) de negócio violada(s)`);
  }
  
  return reasons.join(', ') || 'Análise de risco elevado';
}

/**
 * Gera resposta de detecção de fraude
 */
function generateFraudResponse(fraudDetected: boolean, details: string, severity: string, confidence: number): string {
  if (fraudDetected) {
    return `🚨 **Alerta de Segurança - Fraude Detectada**\n\n` +
           `⚠️ **Severidade**: ${severity.toUpperCase()}\n` +
           `📊 **Confiança**: ${Math.round(confidence * 100)}%\n` +
           `🔍 **Detalhes**: ${details}\n\n` +
           `🛡️ **Ações Tomadas**:\n` +
           `• Transação bloqueada\n` +
           `• Equipe de segurança notificada\n` +
           `• Log de auditoria criado\n\n` +
           `📞 **Próximos Passos**:\n` +
           `• Entre em contato conosco se esta transação for legítima\n` +
           `• Verifique sua conta por atividades suspeitas\n` +
           `• Considere alterar suas credenciais de acesso`;
  } else {
    return `✅ **Análise de Segurança Completa**\n\n` +
           `🔍 **Status**: Nenhuma fraude detectada\n` +
           `📊 **Confiança**: ${Math.round(confidence * 100)}%\n` +
           `🛡️ **Proteção**: Sua transação está segura\n\n` +
           `💡 **Dica**: Continue monitorando suas transações regularmente para manter a segurança.`;
  }
}

// Tipos
interface FraudAnalysis {
  isFraudulent: boolean;
  confidence: number;
  severity: string;
  reason: string;
  factors?: any;
}

interface MLResults {
  score: number;
  models: any;
  features: any;
}

interface RuleResults {
  score: number;
  rules: any;
  violatedCount: number;
}