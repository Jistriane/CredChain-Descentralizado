import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    
    // Notificações baseadas na carteira conectada
    const notifications = []
    
    if (walletAddress) {
      notifications.push({
        id: '1',
        type: 'success',
        title: 'Carteira Conectada',
        message: `Carteira ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} conectada com sucesso`,
        actionUrl: '/wallet',
        metadata: { walletAddress },
        timestamp: new Date().toISOString(),
        read: false
      })
      
      notifications.push({
        id: '2',
        type: 'info',
        title: 'Dados Reais Ativados',
        message: 'Sistema configurado para usar dados reais da sua carteira',
        actionUrl: '/dashboard',
        metadata: { realData: true },
        timestamp: new Date().toISOString(),
        read: false
      })
    } else {
      notifications.push({
        id: '1',
        type: 'info',
        title: 'Conecte sua Carteira',
        message: 'Conecte sua carteira para obter dados reais e notificações personalizadas',
        actionUrl: '/wallet',
        metadata: { connectWallet: true },
        timestamp: new Date().toISOString(),
        read: false
      })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'read-all') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'clear') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
