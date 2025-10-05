import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Endereço da carteira é obrigatório' },
        { status: 400 }
      )
    }

    // Score baseado na carteira real conectada
    const scoreData = {
      currentScore: 0, // Será calculado baseado na carteira
      previousScore: 0,
      trend: 0,
      walletAddress,
      factors: [
        { name: 'Histórico de Pagamentos', score: 0, weight: 0.35 },
        { name: 'Utilização de Crédito', score: 0, weight: 0.30 },
        { name: 'Tempo de Conta', score: 0, weight: 0.15 },
        { name: 'Tipos de Crédito', score: 0, weight: 0.10 },
        { name: 'Consultas Recentes', score: 0, weight: 0.10 }
      ],
      recommendations: [
        'Conecte sua carteira para obter análise real',
        'Complete seu perfil para melhor precisão',
        'Configure suas informações financeiras'
      ],
      lastUpdated: new Date().toISOString(),
      message: 'Score será calculado com base nos dados reais da sua carteira'
    }

    return NextResponse.json(scoreData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
