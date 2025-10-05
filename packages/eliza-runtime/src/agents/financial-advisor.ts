/**
 * Financial Advisor Agent - Agente de Conselhos Financeiros
 * 
 * Fornece recomendações financeiras personalizadas
 */

import { Character, Action, ModelProviderName } from "@elizaos/core";

/**
 * Agente de Conselhos Financeiros
 */
export const financialAdvisorAgent: Character = {
  name: "Financial Advisor",
  username: "advisor_ai",
  modelProvider: ModelProviderName.ANTHROPIC,
  
  bio: [
    "Especialista em conselhos financeiros personalizados",
    "Analiso seu perfil para recomendações adequadas",
    "Ajuda a construir um futuro financeiro sólido"
  ],
  
  knowledge: [
    "Investimentos: renda fixa, variável, fundos, ações",
    "Planejamento financeiro: orçamento, metas, reserva",
    "Produtos bancários: contas, cartões, empréstimos",
    "Educação financeira: conceitos e práticas",
    "Análise de risco: perfil do investidor, diversificação"
  ],
  
  style: {
    all: [
      "Seja consultivo e educativo",
      "Adapte conselhos ao perfil do usuário",
      "Use dados para fundamentar recomendações",
      "Mantenha tom profissional mas acessível"
    ]
  },
  
  adjectives: ["consultivo", "educativo", "personalizado", "preciso", "confiável"]
};

/**
 * Ação de Conselhos Financeiros
 */
export const financialAdviceAction: Action = {
  name: "FINANCIAL_ADVICE",
  similes: ["conselho financeiro", "recomendação", "orientação", "sugestão", "dica"],
  description: "Fornece conselhos financeiros personalizados",
  
  validate: async (runtime: any, message: any) => {
    // Sempre válido para conselhos financeiros
    return true;
  },
  
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const { userId, topic, context } = message.content;
      
      // Analisar perfil do usuário
      const userProfile = await analyzeUserProfile(userId, runtime);
      
      // Determinar tipo de conselho
      const adviceType = determineAdviceType(topic, context);
      
      // Gerar conselho personalizado
      const advice = await generatePersonalizedAdvice(adviceType, userProfile, runtime);
      
      // Rastrear interação
      await runtime.adapters.analytics.trackEvent({
        eventName: 'financial_advice_given',
        userId,
        properties: {
          adviceType,
          userProfile: userProfile.riskLevel,
          personalized: true
        }
      });
      
      callback({
        text: advice,
        metadata: {
          adviceType,
          personalized: true,
          userProfile: userProfile.riskLevel,
          timestamp: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar conselho financeiro:', error);
      callback({
        text: "❌ Desculpe, não consegui gerar um conselho personalizado no momento. Tente novamente em alguns instantes.",
        metadata: { error: true }
      });
      return false;
    }
  },
  
  examples: [
    [
      { 
        user: "{{user1}}", 
        content: { text: "Quero começar a investir, por onde começar?" } 
      },
      { 
        user: "{{agent}}", 
        content: { 
          text: "🎯 **Plano de Investimentos Personalizado**\n\n" +
                "**📊 Seu Perfil**: Conservador (baseado no seu score de 750)\n\n" +
                "**🚀 Primeiros Passos**:\n" +
                "1. **Reserva de Emergência** (6 meses de gastos)\n" +
                "2. **Renda Fixa** (CDB, LCI, LCA)\n" +
                "3. **Fundos Conservadores** (DI, Renda Fixa)\n\n" +
                "**💰 Sugestões Específicas**:\n" +
                "• CDB 100% CDI (liquidez diária)\n" +
                "• LCI/LCA (isento de IR)\n" +
                "• Fundo DI (diversificação)\n\n" +
                "**📈 Próximos Passos**:\n" +
                "• Após 6 meses, considere fundos mistos\n" +
                "• Estude sobre ações (comece com ETFs)\n" +
                "• Mantenha disciplina nos aportes\n\n" +
                "💡 **Dica**: Comece com R$ 100/mês e aumente gradualmente!" 
        } 
      }
    ]
  ]
};

/**
 * Analisa perfil do usuário
 */
async function analyzeUserProfile(userId: string, runtime: any): Promise<UserProfile> {
  try {
    // Buscar score de crédito
    const score = await runtime.adapters.blockchain.getCreditScore(userId);
    
    // Buscar histórico de pagamentos
    const payments = await runtime.adapters.database.query(
      `SELECT 
        amount, 
        created_at, 
        status
      FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50`,
      [userId]
    );
    
    // Buscar dados demográficos
    const userData = await runtime.adapters.database.query(
      'SELECT age, income, occupation FROM users WHERE id = $1',
      [userId]
    );
    
    // Calcular perfil de risco
    const riskLevel = calculateRiskLevel(score, payments.rows, userData.rows[0]);
    
    // Calcular capacidade de investimento
    const investmentCapacity = calculateInvestmentCapacity(userData.rows[0], payments.rows);
    
    return {
      userId,
      score: score?.score || 0,
      riskLevel,
      investmentCapacity,
      paymentHistory: payments.rows,
      demographics: userData.rows[0] || {},
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao analisar perfil do usuário:', error);
    return {
      userId,
      score: 0,
      riskLevel: 'conservative',
      investmentCapacity: 'low',
      paymentHistory: [],
      demographics: {},
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Calcula perfil de risco do usuário
 */
function calculateRiskLevel(score: any, payments: any[], demographics: any): string {
  let riskScore = 0;
  
  // Fator score de crédito (0-3 pontos)
  if (score && score.score >= 800) riskScore += 3;
  else if (score && score.score >= 700) riskScore += 2;
  else if (score && score.score >= 600) riskScore += 1;
  
  // Fator histórico de pagamentos (0-2 pontos)
  const onTimeRate = payments.filter(p => p.status === 'paid').length / payments.length;
  if (onTimeRate >= 0.95) riskScore += 2;
  else if (onTimeRate >= 0.85) riskScore += 1;
  
  // Fator idade (0-2 pontos)
  if (demographics.age) {
    if (demographics.age < 30) riskScore += 2;
    else if (demographics.age < 50) riskScore += 1;
  }
  
  // Fator renda (0-2 pontos)
  if (demographics.income) {
    if (demographics.income > 10000) riskScore += 2;
    else if (demographics.income > 5000) riskScore += 1;
  }
  
  // Classificar perfil
  if (riskScore >= 7) return 'aggressive';
  if (riskScore >= 4) return 'moderate';
  return 'conservative';
}

/**
 * Calcula capacidade de investimento
 */
function calculateInvestmentCapacity(demographics: any, payments: any[]): string {
  const income = demographics.income || 0;
  const avgPayment = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) / payments.length;
  
  // Estimar capacidade baseada na renda e gastos
  const estimatedSavings = income * 0.2; // 20% da renda para investimentos
  
  if (estimatedSavings >= 2000) return 'high';
  if (estimatedSavings >= 500) return 'medium';
  return 'low';
}

/**
 * Determina tipo de conselho
 */
function determineAdviceType(topic: string, context: any): string {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes('investimento') || lowerTopic.includes('investir')) {
    return 'investment';
  }
  
  if (lowerTopic.includes('orçamento') || lowerTopic.includes('budget')) {
    return 'budgeting';
  }
  
  if (lowerTopic.includes('poupança') || lowerTopic.includes('reserva')) {
    return 'savings';
  }
  
  if (lowerTopic.includes('aposentadoria') || lowerTopic.includes('aposentar')) {
    return 'retirement';
  }
  
  if (lowerTopic.includes('dívida') || lowerTopic.includes('empréstimo')) {
    return 'debt_management';
  }
  
  if (lowerTopic.includes('casa') || lowerTopic.includes('imóvel')) {
    return 'real_estate';
  }
  
  return 'general';
}

/**
 * Gera conselho personalizado
 */
async function generatePersonalizedAdvice(adviceType: string, userProfile: UserProfile, runtime: any): Promise<string> {
  switch (adviceType) {
    case 'investment':
      return generateInvestmentAdvice(userProfile);
    
    case 'budgeting':
      return generateBudgetingAdvice(userProfile);
    
    case 'savings':
      return generateSavingsAdvice(userProfile);
    
    case 'retirement':
      return generateRetirementAdvice(userProfile);
    
    case 'debt_management':
      return generateDebtAdvice(userProfile);
    
    case 'real_estate':
      return generateRealEstateAdvice(userProfile);
    
    default:
      return generateGeneralAdvice(userProfile);
  }
}

/**
 * Gera conselho sobre investimentos
 */
function generateInvestmentAdvice(userProfile: UserProfile): string {
  const { riskLevel, investmentCapacity, score } = userProfile;
  
  let advice = "💼 **Estratégia de Investimentos Personalizada**\n\n";
  
  advice += `📊 **Seu Perfil**: ${getRiskLevelDescription(riskLevel)}\n`;
  advice += `💰 **Capacidade**: ${getCapacityDescription(investmentCapacity)}\n`;
  advice += `🎯 **Score**: ${score}/1000\n\n`;
  
  if (riskLevel === 'conservative') {
    advice += "**🛡️ Estratégia Conservadora**:\n";
    advice += "• 70% Renda Fixa (CDB, LCI, LCA)\n";
    advice += "• 20% Fundos Conservadores\n";
    advice += "• 10% Fundos Mistos\n\n";
    advice += "**📈 Produtos Recomendados**:\n";
    advice += "• CDB 100% CDI (liquidez)\n";
    advice += "• LCI/LCA (isento de IR)\n";
    advice += "• Fundo DI (diversificação)\n";
    advice += "• Tesouro Selic (segurança)\n";
  } else if (riskLevel === 'moderate') {
    advice += "**⚖️ Estratégia Moderada**:\n";
    advice += "• 50% Renda Fixa\n";
    advice += "• 30% Fundos Mistos\n";
    advice += "• 20% Renda Variável\n\n";
    advice += "**📈 Produtos Recomendados**:\n";
    advice += "• Fundos Multimercado\n";
    advice += "• ETFs de Índices\n";
    advice += "• Ações Blue Chips\n";
    advice += "• Fundos de Ações\n";
  } else {
    advice += "**🚀 Estratégia Agressiva**:\n";
    advice += "• 30% Renda Fixa\n";
    advice += "• 40% Renda Variável\n";
    advice += "• 30% Alternativos\n\n";
    advice += "**📈 Produtos Recomendados**:\n";
    advice += "• Ações Individuais\n";
    advice += "• ETFs Específicos\n";
    advice += "• Fundos de Ações\n";
    advice += "• REITs (Fundos Imobiliários)\n";
  }
  
  advice += "\n**💡 Dicas Importantes**:\n";
  advice += "• Diversifique sempre\n";
  advice += "• Invista regularmente\n";
  advice += "• Mantenha disciplina\n";
  advice += "• Revise periodicamente\n";
  
  return advice;
}

/**
 * Gera conselho sobre orçamento
 */
function generateBudgetingAdvice(userProfile: UserProfile): string {
  return "📊 **Planejamento Orçamentário Personalizado**\n\n" +
         "**💰 Regra 50-30-20**:\n" +
         "• 50% Necessidades (moradia, alimentação, transporte)\n" +
         "• 30% Desejos (lazer, entretenimento, hobbies)\n" +
         "• 20% Investimentos e emergências\n\n" +
         "**📱 Ferramentas Recomendadas**:\n" +
         "• App CredChain (controle de gastos)\n" +
         "• Planilha Excel (orçamento detalhado)\n" +
         "• Apps de controle financeiro\n\n" +
         "**🎯 Metas Sugeridas**:\n" +
         "• Reserva de emergência (6 meses)\n" +
         "• Reduzir dívidas de alto custo\n" +
         "• Aumentar aportes em investimentos\n\n" +
         "**📈 Próximos Passos**:\n" +
         "• Faça um diagnóstico mensal\n" +
         "• Ajuste conforme necessário\n" +
         "• Celebre pequenas conquistas";
}

/**
 * Gera conselho sobre poupança
 */
function generateSavingsAdvice(userProfile: UserProfile): string {
  return "🏦 **Estratégia de Poupança Inteligente**\n\n" +
         "**🎯 Objetivos de Poupança**:\n" +
         "• Reserva de emergência (6 meses)\n" +
         "• Metas de curto prazo (1-2 anos)\n" +
         "• Metas de médio prazo (3-5 anos)\n" +
         "• Metas de longo prazo (5+ anos)\n\n" +
         "**💰 Onde Guardar**:\n" +
         "• Conta corrente (gastos do dia)\n" +
         "• Poupança (reserva de emergência)\n" +
         "• CDB (reserva + rendimento)\n" +
         "• Fundos DI (reserva + liquidez)\n\n" +
         "**📈 Estratégias**:\n" +
         "• Automatize transferências\n" +
         "• Use a regra do 'pagamento a si mesmo'\n" +
         "• Separe por objetivos\n" +
         "• Revise mensalmente\n\n" +
         "**💡 Dicas Práticas**:\n" +
         "• Comece com 10% da renda\n" +
         "• Aumente gradualmente\n" +
         "• Use aplicativos de controle\n" +
         "• Evite tocar na reserva";
}

/**
 * Gera conselho sobre aposentadoria
 */
function generateRetirementAdvice(userProfile: UserProfile): string {
  return "👴 **Planejamento para Aposentadoria**\n\n" +
         "**⏰ Tempo é Seu Aliado**:\n" +
         "• Quanto mais cedo começar, melhor\n" +
         "• Juros compostos fazem a diferença\n" +
         "• Pequenos valores se tornam grandes\n\n" +
         "**💰 Produtos para Aposentadoria**:\n" +
         "• PGBL (Plano Gerador de Benefício Livre)\n" +
         "• VGBL (Vida Gerador de Benefício Livre)\n" +
         "• Tesouro IPCA+ (proteção inflacionária)\n" +
         "• Fundos de Longo Prazo\n\n" +
         "**📊 Estratégia por Idade**:\n" +
         "• 20-30 anos: 70% variável, 30% fixa\n" +
         "• 30-40 anos: 60% variável, 40% fixa\n" +
         "• 40-50 anos: 50% variável, 50% fixa\n" +
         "• 50+ anos: 30% variável, 70% fixa\n\n" +
         "**🎯 Metas Realistas**:\n" +
         "• Calcule suas necessidades futuras\n" +
         "• Considere inflação e longevidade\n" +
         "• Diversifique as fontes de renda\n" +
         "• Revise anualmente o plano";
}

/**
 * Gera conselho sobre gestão de dívidas
 */
function generateDebtAdvice(userProfile: UserProfile): string {
  return "💳 **Gestão Inteligente de Dívidas**\n\n" +
         "**📊 Avalie Sua Situação**:\n" +
         "• Liste todas as dívidas\n" +
         "• Calcule juros e prazos\n" +
         "• Priorize por custo-benefício\n\n" +
         "**🎯 Estratégias de Pagamento**:\n" +
         "• Método da Bola de Neve (menores valores)\n" +
         "• Método da Avalanche (maiores juros)\n" +
         "• Reestruturação de dívidas\n" +
         "• Renegociação com credores\n\n" +
         "**💰 Reduza Custos**:\n" +
         "• Transfira dívidas para cartões com menor juros\n" +
         "• Use empréstimos pessoais para quitar cartões\n" +
         "• Negocie prazos e valores\n" +
         "• Evite novos empréstimos\n\n" +
         "**📈 Reconstrua o Crédito**:\n" +
         "• Pague sempre em dia\n" +
         "• Mantenha baixa utilização\n" +
         "• Não cancele cartões antigos\n" +
         "• Monitore seu score regularmente";
}

/**
 * Gera conselho sobre imóveis
 */
function generateRealEstateAdvice(userProfile: UserProfile): string {
  return "🏠 **Investimento Imobiliário**\n\n" +
         "**📊 Avalie Sua Capacidade**:\n" +
         "• Renda mensal x 30% (máximo para financiamento)\n" +
         "• Entrada de 20% (mínimo recomendado)\n" +
         "• Reserva para custos extras (ITBI, cartório, etc.)\n\n" +
         "**🏘️ Opções de Investimento**:\n" +
         "• Imóvel próprio (moradia)\n" +
         "• Imóvel para aluguel (renda passiva)\n" +
         "• Fundos Imobiliários (FIIs)\n" +
         "• Crowdfunding imobiliário\n\n" +
         "**💰 Análise de Viabilidade**:\n" +
         "• Localização estratégica\n" +
         "• Potencial de valorização\n" +
         "• Facilidade de aluguel\n" +
         "• Custos de manutenção\n\n" +
         "**📈 Estratégias**:\n" +
         "• Comece com FIIs (menor capital)\n" +
         "• Estude o mercado local\n" +
         "• Considere financiamento\n" +
         "• Diversifique o portfólio";
}

/**
 * Gera conselho geral
 */
function generateGeneralAdvice(userProfile: UserProfile): string {
  return "💡 **Conselhos Financeiros Gerais**\n\n" +
         "**🎯 Princípios Fundamentais**:\n" +
         "• Gaste menos do que ganha\n" +
         "• Invista regularmente\n" +
         "• Diversifique sempre\n" +
         "• Tenha paciência\n\n" +
         "**📊 Seu Perfil Atual**:\n" +
         `• Score: ${userProfile.score}/1000\n` +
         `• Perfil de Risco: ${getRiskLevelDescription(userProfile.riskLevel)}\n` +
         `• Capacidade: ${getCapacityDescription(userProfile.investmentCapacity)}\n\n` +
         "**🚀 Próximos Passos**:\n" +
         "• Construa sua reserva de emergência\n" +
         "• Estude sobre investimentos\n" +
         "• Defina metas claras\n" +
         "• Monitore seu progresso\n\n" +
         "**📚 Recursos Educativos**:\n" +
         "• Blog CredChain\n" +
         "• Webinars semanais\n" +
         "• E-books gratuitos\n" +
         "• Comunidade de investidores";
}

/**
 * Obtém descrição do perfil de risco
 */
function getRiskLevelDescription(riskLevel: string): string {
  switch (riskLevel) {
    case 'conservative': return 'Conservador (prioriza segurança)';
    case 'moderate': return 'Moderado (equilíbrio risco/retorno)';
    case 'aggressive': return 'Agressivo (busca maior retorno)';
    default: return 'Não definido';
  }
}

/**
 * Obtém descrição da capacidade de investimento
 */
function getCapacityDescription(capacity: string): string {
  switch (capacity) {
    case 'low': return 'Baixa (até R$ 500/mês)';
    case 'medium': return 'Média (R$ 500-2.000/mês)';
    case 'high': return 'Alta (acima de R$ 2.000/mês)';
    default: return 'Não definida';
  }
}

// Tipos
interface UserProfile {
  userId: string;
  score: number;
  riskLevel: string;
  investmentCapacity: string;
  paymentHistory: any[];
  demographics: any;
  lastUpdated: string;
}