/**
 * User Assistant Agent - Agente de Suporte ao Usuário
 * 
 * Fornece suporte e educação financeira aos usuários
 */

import { Character, Action, ModelProviderName } from "@elizaos/core";

/**
 * Agente de Suporte ao Usuário
 */
export const userAssistantAgent: Character = {
  name: "User Assistant",
  username: "assistant_ai",
  modelProvider: ModelProviderName.ANTHROPIC,
  
  bio: [
    "Sou seu assistente pessoal para questões financeiras",
    "Ajudo com dúvidas sobre score, pagamentos e uso da plataforma",
    "Forneço educação financeira de forma clara e acessível"
  ],
  
  knowledge: [
    "Educação financeira: orçamento, poupança, investimentos",
    "Score de crédito: como funciona, como melhorar",
    "Produtos financeiros: cartões, empréstimos, financiamentos",
    "Plataforma CredChain: funcionalidades e navegação",
    "Suporte técnico: problemas comuns e soluções"
  ],
  
  style: {
    all: [
      "Seja amigável e prestativo",
      "Use linguagem simples e clara",
      "Seja paciente com dúvidas",
      "Forneça exemplos práticos"
    ]
  },
  
  adjectives: ["amigável", "prestativo", "educativo", "paciente", "claro"]
};

/**
 * Ação de Suporte ao Usuário
 */
export const userSupportAction: Action = {
  name: "USER_SUPPORT",
  similes: ["ajudar usuário", "suporte", "dúvida", "orientação", "assistência"],
  description: "Fornece suporte e orientação ao usuário",
  
  validate: async (runtime: any, message: any) => {
    // Sempre válido para suporte
    return true;
  },
  
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const { userId, question, context } = message.content;
      
      // Analisar tipo de pergunta
      const questionType = analyzeQuestionType(question);
      
      // Buscar informações relevantes
      const userInfo = await getUserInformation(userId, runtime);
      
      // Gerar resposta personalizada
      const response = await generateSupportResponse(questionType, question, userInfo, runtime);
      
      // Rastrear interação
      await runtime.adapters.analytics.trackEvent({
        eventName: 'user_support_interaction',
        userId,
        properties: {
          questionType,
          question: question.substring(0, 100), // Limitar tamanho
          responseGenerated: true
        }
      });
      
      callback({
        text: response,
        metadata: {
          questionType,
          personalized: true,
          timestamp: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro no suporte ao usuário:', error);
      callback({
        text: "❌ Desculpe, ocorreu um erro. Nossa equipe foi notificada e entrará em contato em breve.",
        metadata: { error: true }
      });
      return false;
    }
  },
  
  examples: [
    [
      { 
        user: "{{user1}}", 
        content: { text: "Como posso melhorar meu score de crédito?" } 
      },
      { 
        user: "{{agent}}", 
        content: { 
          text: "📈 **Como Melhorar Seu Score de Crédito**\n\n" +
                "🎯 **Dicas Práticas**:\n\n" +
                "✅ **Pague sempre em dia** (35% do score)\n" +
                "• Configure lembretes ou débito automático\n" +
                "• Priorize contas essenciais\n\n" +
                "💰 **Mantenha baixa utilização** (30% do score)\n" +
                "• Use no máximo 30% do limite do cartão\n" +
                "• Evite gastar o limite total\n\n" +
                "⏰ **Mantenha histórico longo** (15% do score)\n" +
                "• Não cancele cartões antigos\n" +
                "• Continue usando crédito responsavelmente\n\n" +
                "💡 **Dica Extra**: Monitore seu score regularmente no CredChain!" 
        } 
      }
    ]
  ]
};

/**
 * Analisa o tipo de pergunta do usuário
 */
function analyzeQuestionType(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  // Score de crédito
  if (lowerQuestion.includes('score') || lowerQuestion.includes('crédito') || 
      lowerQuestion.includes('pontuação')) {
    return 'credit_score';
  }
  
  // Pagamentos
  if (lowerQuestion.includes('pagamento') || lowerQuestion.includes('conta') || 
      lowerQuestion.includes('fatura')) {
    return 'payments';
  }
  
  // App/Plataforma
  if (lowerQuestion.includes('app') || lowerQuestion.includes('plataforma') || 
      lowerQuestion.includes('como usar') || lowerQuestion.includes('funcionalidade')) {
    return 'platform';
  }
  
  // Educação financeira
  if (lowerQuestion.includes('investimento') || lowerQuestion.includes('poupança') || 
      lowerQuestion.includes('finanças') || lowerQuestion.includes('orçamento')) {
    return 'financial_education';
  }
  
  // Problemas técnicos
  if (lowerQuestion.includes('erro') || lowerQuestion.includes('problema') || 
      lowerQuestion.includes('não funciona') || lowerQuestion.includes('bug')) {
    return 'technical_issue';
  }
  
  // Segurança
  if (lowerQuestion.includes('segurança') || lowerQuestion.includes('fraude') || 
      lowerQuestion.includes('hack') || lowerQuestion.includes('roubo')) {
    return 'security';
  }
  
  // Geral
  return 'general';
}

/**
 * Busca informações do usuário
 */
async function getUserInformation(userId: string, runtime: any): Promise<any> {
  try {
    // Buscar dados básicos do usuário
    const userResult = await runtime.adapters.database.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    // Buscar score atual
    const score = await runtime.adapters.blockchain.getCreditScore(userId);
    
    // Buscar histórico de pagamentos
    const payments = await runtime.adapters.database.query(
      'SELECT COUNT(*) as count, AVG(amount) as avg_amount FROM payments WHERE user_id = $1',
      [userId]
    );
    
    return {
      user: userResult.rows[0] || null,
      score: score,
      paymentStats: payments.rows[0] || { count: 0, avg_amount: 0 }
    };
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    return {
      user: null,
      score: null,
      paymentStats: { count: 0, avg_amount: 0 }
    };
  }
}

/**
 * Gera resposta de suporte personalizada
 */
async function generateSupportResponse(questionType: string, question: string, userInfo: any, runtime: any): Promise<string> {
  switch (questionType) {
    case 'credit_score':
      return generateCreditScoreSupport(question, userInfo);
    
    case 'payments':
      return generatePaymentsSupport(question, userInfo);
    
    case 'platform':
      return generatePlatformSupport(question);
    
    case 'financial_education':
      return generateFinancialEducationSupport(question);
    
    case 'technical_issue':
      return generateTechnicalSupport(question);
    
    case 'security':
      return generateSecuritySupport(question);
    
    default:
      return generateGeneralSupport(question);
  }
}

/**
 * Gera suporte sobre score de crédito
 */
function generateCreditScoreSupport(question: string, userInfo: any): string {
  const score = userInfo.score;
  const hasScore = score && score.score > 0;
  
  let response = "📊 **Suporte - Score de Crédito**\n\n";
  
  if (hasScore) {
    response += `🎯 **Seu Score Atual**: ${score.score}/1000\n`;
    response += `📅 **Última Atualização**: ${new Date(score.calculatedAt).toLocaleDateString('pt-BR')}\n\n`;
  }
  
  response += "**💡 Como Funciona o Score**:\n";
  response += "• **Histórico de Pagamentos (35%)**: Pontualidade é fundamental\n";
  response += "• **Utilização de Crédito (30%)**: Mantenha baixo uso do limite\n";
  response += "• **Idade do Crédito (15%)**: Histórico longo é melhor\n";
  response += "• **Diversidade (10%)**: Diferentes tipos de crédito\n";
  response += "• **Novas Consultas (10%)**: Evite muitas simultâneas\n\n";
  
  response += "**🚀 Dicas para Melhorar**:\n";
  response += "✅ Pague sempre em dia\n";
  response += "✅ Use no máximo 30% do limite\n";
  response += "✅ Mantenha contas antigas abertas\n";
  response += "✅ Diversifique seus produtos\n";
  response += "✅ Evite muitas consultas\n\n";
  
  if (!hasScore) {
    response += "**📈 Para Ter Seu Primeiro Score**:\n";
    response += "• Complete seu cadastro\n";
    response += "• Faça pelo menos 3 pagamentos\n";
    response += "• Aguarde 30 dias para o primeiro cálculo\n";
  }
  
  return response;
}

/**
 * Gera suporte sobre pagamentos
 */
function generatePaymentsSupport(question: string, userInfo: any): string {
  const paymentStats = userInfo.paymentStats;
  
  let response = "💳 **Suporte - Pagamentos**\n\n";
  
  if (paymentStats.count > 0) {
    response += `📊 **Seu Histórico**:\n`;
    response += `• Total de pagamentos: ${paymentStats.count}\n`;
    response += `• Valor médio: R$ ${parseFloat(paymentStats.avg_amount).toFixed(2)}\n\n`;
  }
  
  response += "**💡 Dicas para Pagamentos**:\n";
  response += "✅ Configure lembretes automáticos\n";
  response += "✅ Use débito automático quando possível\n";
  response += "✅ Priorize contas essenciais\n";
  response += "✅ Mantenha um calendário de vencimentos\n\n";
  
  response += "**🚨 Em Caso de Atraso**:\n";
  response += "• Pague o mais rápido possível\n";
  response += "• Entre em contato com o credor\n";
  response += "• Negocie condições se necessário\n";
  response += "• Evite acumular mais atrasos\n\n";
  
  response += "**📱 Funcionalidades do App**:\n";
  response += "• Histórico completo de pagamentos\n";
  response += "• Lembretes personalizados\n";
  response += "• Análise de padrões\n";
  response += "• Alertas de vencimento\n";
  
  return response;
}

/**
 * Gera suporte sobre a plataforma
 */
function generatePlatformSupport(question: string): string {
  return "📱 **Suporte - Plataforma CredChain**\n\n" +
         "**🎯 Principais Funcionalidades**:\n\n" +
         "📊 **Dashboard**:\n" +
         "• Visualize seu score atual\n" +
         "• Acompanhe histórico de pagamentos\n" +
         "• Receba insights personalizados\n\n" +
         "💬 **Chat com IA**:\n" +
         "• Tire dúvidas sobre crédito\n" +
         "• Receba conselhos financeiros\n" +
         "• Análise de padrões suspeitos\n\n" +
         "🔔 **Notificações**:\n" +
         "• Alertas de vencimento\n" +
         "• Atualizações de score\n" +
         "• Dicas personalizadas\n\n" +
         "📈 **Analytics**:\n" +
         "• Gráficos de evolução\n" +
         "• Comparação com média\n" +
         "• Projeções futuras\n\n" +
         "**🆘 Precisa de Mais Ajuda?**:\n" +
         "• Central de Ajuda: help.credchain.com\n" +
         "• Email: suporte@credchain.com\n" +
         "• WhatsApp: (11) 99999-9999";
}

/**
 * Gera suporte sobre educação financeira
 */
function generateFinancialEducationSupport(question: string): string {
  return "🎓 **Educação Financeira**\n\n" +
         "**💰 Orçamento Pessoal**:\n" +
         "• 50% para necessidades (moradia, alimentação)\n" +
         "• 30% para desejos (lazer, entretenimento)\n" +
         "• 20% para investimentos e emergências\n\n" +
         "**🏦 Reserva de Emergência**:\n" +
         "• 6 meses de gastos essenciais\n" +
         "• Mantenha em conta de alta liquidez\n" +
         "• Não use para investimentos arriscados\n\n" +
         "**💳 Uso Consciente do Crédito**:\n" +
         "• Use apenas para necessidades\n" +
         "• Pague sempre o valor total\n" +
         "• Evite parcelamentos desnecessários\n" +
         "• Monitore seu limite disponível\n\n" +
         "**📈 Investimentos Básicos**:\n" +
         "• Comece com renda fixa (CDB, LCI, LCA)\n" +
         "• Diversifique seus investimentos\n" +
         "• Invista regularmente (mesmo pequenos valores)\n" +
         "• Estude antes de investir\n\n" +
         "**📚 Recursos Educativos**:\n" +
         "• Blog CredChain: artigos semanais\n" +
         "• Webinars: toda quinta-feira\n" +
         "• E-book gratuito: 'Finanças Pessoais 101'";
}

/**
 * Gera suporte técnico
 */
function generateTechnicalSupport(question: string): string {
  return "🔧 **Suporte Técnico**\n\n" +
         "**📱 Problemas Comuns no App**:\n\n" +
         "**App não abre**:\n" +
         "• Verifique se está atualizado\n" +
         "• Reinicie o aplicativo\n" +
         "• Desinstale e reinstale se necessário\n\n" +
         "**Login não funciona**:\n" +
         "• Verifique email e senha\n" +
         "• Use 'Esqueci minha senha'\n" +
         "• Verifique conexão com internet\n\n" +
         "**Dados não atualizam**:\n" +
         "• Aguarde alguns minutos\n" +
         "• Faça logout e login novamente\n" +
         "• Verifique sua conexão\n\n" +
         "**🔍 Diagnóstico Rápido**:\n" +
         "1. Reinicie o app\n" +
         "2. Verifique a internet\n" +
         "3. Atualize o app\n" +
         "4. Entre em contato conosco\n\n" +
         "**📞 Contato Técnico**:\n" +
         "• Email: tech@credchain.com\n" +
         "• WhatsApp: (11) 99999-8888\n" +
         "• Horário: 8h às 18h (seg-sex)";
}

/**
 * Gera suporte sobre segurança
 */
function generateSecuritySupport(question: string): string {
  return "🔒 **Segurança da Conta**\n\n" +
         "**🛡️ Proteja Sua Conta**:\n\n" +
         "**Senha Forte**:\n" +
         "• Use pelo menos 8 caracteres\n" +
         "• Combine letras, números e símbolos\n" +
         "• Não use informações pessoais\n" +
         "• Troque regularmente\n\n" +
         "**🔐 Autenticação**:\n" +
         "• Ative autenticação de dois fatores\n" +
         "• Use biometria quando disponível\n" +
         "• Não compartilhe códigos\n" +
         "• Desconfie de links suspeitos\n\n" +
         "**📱 Dispositivo Seguro**:\n" +
         "• Mantenha o sistema atualizado\n" +
         "• Use antivírus confiável\n" +
         "• Evite redes Wi-Fi públicas\n" +
         "• Faça logout em dispositivos compartilhados\n\n" +
         "**🚨 Sinais de Alerta**:\n" +
         "• Transações não autorizadas\n" +
         "• Mudanças não solicitadas\n" +
         "• Emails suspeitos\n" +
         "• Acesso de locais estranhos\n\n" +
         "**📞 Em Caso de Problema**:\n" +
         "• Bloqueie a conta imediatamente\n" +
         "• Entre em contato conosco\n" +
         "• Altere todas as senhas\n" +
         "• Monitore suas contas";
}

/**
 * Gera suporte geral
 */
function generateGeneralSupport(question: string): string {
  return "👋 **Como Posso Ajudar?**\n\n" +
         "Estou aqui para esclarecer suas dúvidas sobre:\n\n" +
         "📊 **Score de Crédito**: Como funciona e como melhorar\n" +
         "💳 **Pagamentos**: Histórico, pontualidade e dicas\n" +
         "📱 **App CredChain**: Funcionalidades e navegação\n" +
         "🎓 **Educação Financeira**: Orçamento, investimentos, poupança\n" +
         "🔒 **Segurança**: Proteção da conta e dados\n" +
         "🔧 **Problemas Técnicos**: Bugs, erros e soluções\n\n" +
         "**💬 Dica**: Seja específico na sua pergunta para receber uma resposta mais precisa!\n\n" +
         "**📞 Outros Canais**:\n" +
         "• Email: suporte@credchain.com\n" +
         "• WhatsApp: (11) 99999-9999\n" +
         "• Central de Ajuda: help.credchain.com";
}