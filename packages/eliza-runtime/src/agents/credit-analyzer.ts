/**
 * Credit Analyzer Agent - Agente de Análise de Crédito
 * 
 * Implementa a ação ANALYZE_CREDIT conforme especificado na arquitetura
 */

import { Character, Action, ModelProviderName } from "@elizaos/core";

/**
 * Agente de Análise de Crédito
 */
export const creditAnalyzerAgent: Character = {
  name: "Credit Analyzer",
  username: "credit_ai",
  modelProvider: ModelProviderName.ANTHROPIC,
  
  bio: [
    "Especialista em análise de crédito e cálculo de scores",
    "Utilizo machine learning para avaliações precisas e justas",
    "Trabalho com múltiplos fatores para garantir transparência"
  ],
  
  knowledge: [
    "Modelos de credit scoring: FICO, VantageScore, custom models",
    "Fatores de crédito: histórico de pagamentos, utilização, idade do crédito",
    "Machine Learning: Random Forest, XGBoost, Neural Networks",
    "Análise de risco: probabilidade de inadimplência",
    "Regulamentações: LGPD, GDPR, Basel III para scoring"
  ],
  
  style: {
    all: [
      "Seja preciso e baseado em dados",
      "Explique claramente os fatores que influenciam o score",
      "Use gráficos e métricas quando possível",
      "Mantenha tom educativo e transparente"
    ]
  },
  
  adjectives: ["analítico", "preciso", "transparente", "educativo", "confiável"]
};

/**
 * Ação de Análise de Crédito
 * Implementa o ANALYZE_CREDIT conforme especificado na documentação
 */
export const analyzeCreditAction: Action = {
  name: "ANALYZE_CREDIT",
  similes: ["calcular score", "avaliar crédito", "analisar histórico", "verificar pontuação"],
  description: "Analisa histórico de pagamentos e calcula score de crédito",
  
  validate: async (runtime: any, message: any) => {
    // Valida se usuário tem dados suficientes
    try {
      const userPayments = await runtime.adapters.database.query(
        'SELECT COUNT(*) as count FROM payments WHERE user_id = $1',
        [message.userId]
      );
      
      return userPayments.rows[0].count >= 3; // Mínimo 3 pagamentos
    } catch (error) {
      console.error('Erro ao validar dados do usuário:', error);
      return false;
    }
  },
  
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const userId = message.userId || message.user;
      
      // 1. Buscar histórico de pagamentos
      const payments = await getPaymentHistory(userId, runtime);
      
      // 2. Aplicar modelo de ML para calcular score
      const scoreData = await calculateCreditScore(payments);
      
      // 3. Registrar na blockchain
      const txHash = await registerScoreOnChain(userId, scoreData.score, scoreData.factors, runtime);
      
      // 4. Gerar explicação em linguagem natural
      const explanation = await generateScoreExplanation(scoreData);
      
      // 5. Retornar resultado
      callback({
        text: explanation,
        metadata: {
          score: scoreData.score,
          txHash: txHash,
          factors: scoreData.factors,
          confidence: scoreData.confidence
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro na análise de crédito:', error);
      callback({
        text: "❌ Erro ao analisar seu crédito. Tente novamente em alguns instantes.",
        metadata: { error: true }
      });
      return false;
    }
  },
  
  examples: [
    [
      { 
        user: "{{user1}}", 
        content: { text: "Quero saber meu score de crédito" } 
      },
      { 
        user: "{{agent}}", 
        content: { 
          text: "Analisando seu histórico... ✨\n\n📊 Seu Score: 780/1000\n\n✅ Fatores Positivos:\n- 24 meses sem atrasos\n- Diversidade de contas (5 tipos)\n- Valores compatíveis com renda\n\n⚠️ Pontos de Atenção:\n- Histórico ainda curto (ideal: 36+ meses)\n\n💡 Dica: Continue pagando em dia para alcançar 850+ em 12 meses!" 
        } 
      }
    ]
  ]
};

/**
 * Busca histórico de pagamentos do usuário
 */
async function getPaymentHistory(userId: string, runtime: any) {
  try {
    const result = await runtime.adapters.database.query(
      `SELECT 
        amount, 
        due_date, 
        paid_date, 
        status,
        created_at
      FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC`,
      [userId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return [];
  }
}

/**
 * Modelo de cálculo de score
 * Baseado em múltiplos fatores ponderados conforme especificado na documentação
 */
async function calculateCreditScore(payments: any[]): Promise<ScoreData> {
  if (payments.length === 0) {
    return {
      score: 0,
      factors: {
        paymentHistory: 0,
        creditUtilization: 0,
        creditAge: 0,
        creditMix: 0,
        newCredit: 0
      },
      confidence: 0,
      explanation: "Sem dados suficientes para cálculo"
    };
  }

  // Calcular fatores individuais
  const factors = {
    paymentHistory: calculatePaymentHistory(payments), // 35%
    creditUtilization: calculateUtilization(payments), // 30%
    creditAge: calculateCreditAge(payments), // 15%
    creditMix: calculateCreditMix(payments), // 10%
    newCredit: calculateNewCreditInquiries(payments) // 10%
  };

  // Calcular score final com pesos
  const score = Math.round(
    factors.paymentHistory * 0.35 +
    factors.creditUtilization * 0.30 +
    factors.creditAge * 0.15 +
    factors.creditMix * 0.10 +
    factors.newCredit * 0.10
  );

  // Calcular confiança baseada na quantidade de dados
  const confidence = Math.min(0.95, 0.5 + (payments.length * 0.05));

  return {
    score: Math.max(300, Math.min(850, score)), // Limitar entre 300-850
    factors,
    confidence,
    explanation: generateFactorExplanation(factors)
  };
}

/**
 * Calcula histórico de pagamentos (35% do score)
 */
function calculatePaymentHistory(payments: any[]): number {
  if (payments.length === 0) return 0;
  
  const totalPayments = payments.length;
  const onTimePayments = payments.filter(p => 
    p.status === 'paid' && 
    new Date(p.paid_date) <= new Date(p.due_date)
  ).length;
  
  const onTimeRate = onTimePayments / totalPayments;
  
  // Converter para escala 0-100
  return Math.round(onTimeRate * 100);
}

/**
 * Calcula utilização de crédito (30% do score)
 */
function calculateUtilization(payments: any[]): number {
  if (payments.length === 0) return 0;
  
  // Simular limite de crédito baseado no histórico
  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const averageAmount = totalAmount / payments.length;
  const estimatedLimit = averageAmount * 10; // Estimativa de limite
  
  const utilization = totalAmount / estimatedLimit;
  
  // Menor utilização = melhor score
  if (utilization <= 0.1) return 100;
  if (utilization <= 0.3) return 90;
  if (utilization <= 0.5) return 70;
  if (utilization <= 0.7) return 50;
  return 30;
}

/**
 * Calcula idade do crédito (15% do score)
 */
function calculateCreditAge(payments: any[]): number {
  if (payments.length === 0) return 0;
  
  const oldestPayment = new Date(Math.min(...payments.map(p => new Date(p.created_at))));
  const newestPayment = new Date(Math.max(...payments.map(p => new Date(p.created_at))));
  
  const ageInMonths = (newestPayment.getTime() - oldestPayment.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  // Mais idade = melhor score
  if (ageInMonths >= 60) return 100;
  if (ageInMonths >= 36) return 80;
  if (ageInMonths >= 24) return 60;
  if (ageInMonths >= 12) return 40;
  return 20;
}

/**
 * Calcula diversidade de crédito (10% do score)
 */
function calculateCreditMix(payments: any[]): number {
  if (payments.length === 0) return 0;
  
  // Simular tipos de crédito baseado nos valores
  const types = new Set();
  payments.forEach(p => {
    const amount = parseFloat(p.amount);
    if (amount < 100) types.add('small');
    else if (amount < 500) types.add('medium');
    else if (amount < 1000) types.add('large');
    else types.add('premium');
  });
  
  // Mais tipos = melhor score
  const typeCount = types.size;
  if (typeCount >= 4) return 100;
  if (typeCount >= 3) return 80;
  if (typeCount >= 2) return 60;
  return 40;
}

/**
 * Calcula novas consultas de crédito (10% do score)
 */
function calculateNewCreditInquiries(payments: any[]): number {
  if (payments.length === 0) return 0;
  
  // Simular consultas baseado na frequência de pagamentos
  const recentPayments = payments.filter(p => {
    const paymentDate = new Date(p.created_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return paymentDate >= sixMonthsAgo;
  });
  
  const inquiryCount = Math.min(recentPayments.length, 10);
  
  // Menos consultas = melhor score
  if (inquiryCount <= 2) return 100;
  if (inquiryCount <= 4) return 80;
  if (inquiryCount <= 6) return 60;
  return 40;
}

/**
 * Registra score na blockchain
 */
async function registerScoreOnChain(userId: string, score: number, factors: any, runtime: any): Promise<string> {
  try {
    const result = await runtime.adapters.blockchain.updateCreditScore(
      userId,
      score,
      {
        factors,
        calculatedAt: Date.now(),
        version: '1.0'
      }
    );
    
    return result.hash;
  } catch (error) {
    console.error('Erro ao registrar score na blockchain:', error);
    return 'blockchain_error';
  }
}

/**
 * Gera explicação do score em linguagem natural
 */
async function generateScoreExplanation(scoreData: ScoreData): Promise<string> {
  const { score, factors, confidence } = scoreData;
  
  let explanation = `📊 **Análise de Crédito Completa**\n\n`;
  explanation += `🎯 **Seu Score**: ${score}/1000\n`;
  explanation += `📈 **Confiança**: ${Math.round(confidence * 100)}%\n\n`;
  
  // Explicar fatores
  explanation += `**📋 Detalhamento dos Fatores:**\n\n`;
  
  explanation += `💳 **Histórico de Pagamentos (35%)**: ${factors.paymentHistory}/100\n`;
  if (factors.paymentHistory >= 90) {
    explanation += `✅ Excelente! Você paga sempre em dia\n`;
  } else if (factors.paymentHistory >= 70) {
    explanation += `⚠️ Bom, mas pode melhorar a pontualidade\n`;
  } else {
    explanation += `❌ Histórico de atrasos está prejudicando seu score\n`;
  }
  
  explanation += `\n💰 **Utilização de Crédito (30%)**: ${factors.creditUtilization}/100\n`;
  if (factors.creditUtilization >= 80) {
    explanation += `✅ Ótima utilização! Mantenha baixo uso do limite\n`;
  } else if (factors.creditUtilization >= 60) {
    explanation += `⚠️ Utilização moderada, tente reduzir um pouco\n`;
  } else {
    explanation += `❌ Utilização alta está prejudicando seu score\n`;
  }
  
  explanation += `\n⏰ **Idade do Crédito (15%)**: ${factors.creditAge}/100\n`;
  if (factors.creditAge >= 80) {
    explanation += `✅ Excelente histórico longo de crédito\n`;
  } else if (factors.creditAge >= 60) {
    explanation += `⚠️ Histórico em construção, continue usando\n`;
  } else {
    explanation += `❌ Histórico muito curto, precisa de mais tempo\n`;
  }
  
  explanation += `\n🔄 **Diversidade (10%)**: ${factors.creditMix}/100\n`;
  if (factors.creditMix >= 80) {
    explanation += `✅ Ótima diversidade de tipos de crédito\n`;
  } else if (factors.creditMix >= 60) {
    explanation += `⚠️ Diversidade moderada, considere novos tipos\n`;
  } else {
    explanation += `❌ Pouca diversidade, explore diferentes produtos\n`;
  }
  
  explanation += `\n🔍 **Novas Consultas (10%)**: ${factors.newCredit}/100\n`;
  if (factors.newCredit >= 80) {
    explanation += `✅ Poucas consultas recentes, excelente!\n`;
  } else if (factors.newCredit >= 60) {
    explanation += `⚠️ Consultas moderadas, evite muitas simultâneas\n`;
  } else {
    explanation += `❌ Muitas consultas recentes prejudicam o score\n`;
  }
  
  // Recomendações
  explanation += `\n**💡 Recomendações para Melhorar:**\n`;
  
  if (factors.paymentHistory < 90) {
    explanation += `• Pague todas as contas em dia\n`;
  }
  if (factors.creditUtilization < 80) {
    explanation += `• Reduza a utilização do cartão de crédito\n`;
  }
  if (factors.creditAge < 80) {
    explanation += `• Mantenha contas antigas abertas\n`;
  }
  if (factors.creditMix < 80) {
    explanation += `• Diversifique seus tipos de crédito\n`;
  }
  if (factors.newCredit < 80) {
    explanation += `• Evite muitas consultas de crédito simultâneas\n`;
  }
  
  if (score >= 750) {
    explanation += `\n🎉 **Parabéns!** Seu score está excelente!`;
  } else if (score >= 650) {
    explanation += `\n👍 **Bom score!** Continue assim para melhorar ainda mais.`;
  } else {
    explanation += `\n📈 **Há espaço para melhorar!** Siga as recomendações acima.`;
  }
  
  return explanation;
}

/**
 * Gera explicação dos fatores
 */
function generateFactorExplanation(factors: any): string {
  const explanations = [];
  
  if (factors.paymentHistory >= 90) {
    explanations.push("Histórico de pagamentos excelente");
  } else if (factors.paymentHistory >= 70) {
    explanations.push("Histórico de pagamentos bom");
  } else {
    explanations.push("Histórico de pagamentos precisa melhorar");
  }
  
  if (factors.creditUtilization >= 80) {
    explanations.push("Utilização de crédito ideal");
  } else if (factors.creditUtilization >= 60) {
    explanations.push("Utilização de crédito moderada");
  } else {
    explanations.push("Utilização de crédito alta");
  }
  
  return explanations.join(", ");
}

// Tipos
interface ScoreData {
  score: number;
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditAge: number;
    creditMix: number;
    newCredit: number;
  };
  confidence: number;
  explanation?: string;
}