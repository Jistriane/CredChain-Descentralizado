import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    let payments = []
    
    if (walletAddress) {
      // Pagamentos baseados na carteira real conectada
      payments = [
        {
          id: '1',
          description: `Transação da carteira ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          amount: 0, // Será calculado com base nas transações reais
          dueDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          category: 'Blockchain',
          walletAddress,
          message: 'Dados de pagamento serão carregados com base nas transações da sua carteira'
        }
      ]
    } else {
      // Pagamentos padrão quando carteira não está conectada
      payments = [
        {
          id: '1',
          description: 'Conecte sua carteira para ver pagamentos',
          amount: 0,
          dueDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          category: 'Info',
          message: 'Conecte sua carteira para visualizar pagamentos reais'
        }
      ]
    }

    return NextResponse.json({ 
      payments,
      message: walletAddress 
        ? 'Pagamentos serão calculados com base nas transações reais da sua carteira'
        : 'Conecte sua carteira para visualizar pagamentos reais'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
