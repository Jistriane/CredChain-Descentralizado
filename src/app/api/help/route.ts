import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Em produção, buscar dados do banco de dados
    const faqs = [
      {
        id: '1',
        question: 'Como funciona o sistema de score de crédito?',
        answer: 'O sistema utiliza inteligência artificial e dados da blockchain para calcular seu score de crédito. Analisamos seu histórico de pagamentos, comportamento financeiro e outros fatores para gerar uma pontuação de 0 a 1000.',
        category: 'score',
        helpful: 45
      },
      {
        id: '2',
        question: 'Como conectar minha carteira digital?',
        answer: 'Para conectar sua carteira, clique no botão "Conectar Carteira" no canto superior direito. Certifique-se de ter uma carteira Polkadot compatível instalada e aprovada a conexão.',
        category: 'wallet',
        helpful: 32
      },
      {
        id: '3',
        question: 'Meus dados estão seguros?',
        answer: 'Sim! Utilizamos criptografia de ponta e blockchain para proteger seus dados. Todas as informações são criptografadas e armazenadas de forma descentralizada, garantindo máxima segurança e privacidade.',
        category: 'security',
        helpful: 28
      },
      {
        id: '4',
        question: 'Como posso melhorar meu score?',
        answer: 'Para melhorar seu score, mantenha pagamentos em dia, evite atrasos, diversifique suas fontes de crédito e mantenha um histórico consistente de bom comportamento financeiro.',
        category: 'score',
        helpful: 67
      },
      {
        id: '5',
        question: 'O que é o ElizaOS?',
        answer: 'O ElizaOS é nossa IA assistente que ajuda você a entender seu score, oferece recomendações personalizadas e responde perguntas sobre suas finanças 24/7.',
        category: 'ai',
        helpful: 23
      }
    ]

    const articles = [
      {
        id: '1',
        title: 'Guia Completo: Como Usar o Sistema',
        description: 'Aprenda os conceitos básicos e como navegar pela plataforma',
        category: 'getting-started',
        readTime: '5 min',
        difficulty: 'beginner' as const
      },
      {
        id: '2',
        title: 'Entendendo Seu Score de Crédito',
        description: 'Explicação detalhada sobre como o score é calculado',
        category: 'score',
        readTime: '8 min',
        difficulty: 'intermediate' as const
      },
      {
        id: '3',
        title: 'Segurança e Privacidade',
        description: 'Como protegemos seus dados e garantimos sua privacidade',
        category: 'security',
        readTime: '6 min',
        difficulty: 'intermediate' as const
      }
    ]

    return NextResponse.json({
      faqs,
      articles
    })

  } catch (error) {
    console.error('Erro na API de help:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
