import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Obter dados reais da carteira conectada
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Endereço da carteira é obrigatório' },
        { status: 400 }
      )
    }

    // Dados baseados na carteira real conectada
    const dashboardData = {
      score: 0, // Será calculado baseado na carteira
      trend: 0,
      walletAddress,
      factors: [
        { name: 'Histórico de Pagamentos', score: 0, impact: 'high' },
        { name: 'Utilização de Crédito', score: 0, impact: 'medium' },
        { name: 'Tempo de Conta', score: 0, impact: 'high' },
        { name: 'Tipos de Crédito', score: 0, impact: 'low' }
      ],
      recentActivity: [
        { 
          id: '1', 
          type: 'wallet_connected', 
          description: `Carteira ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} conectada`, 
          amount: null, 
          date: new Date().toISOString() 
        }
      ],
      financialHealth: {
        totalDebt: 0,
        monthlyIncome: 0,
        creditUtilization: 0,
        paymentHistory: 0
      },
      recommendations: [
        'Conecte sua carteira para obter dados reais',
        'Configure suas informações financeiras',
        'Complete seu perfil para melhor análise'
      ],
      message: 'Dados serão carregados conforme você interage com a plataforma'
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
