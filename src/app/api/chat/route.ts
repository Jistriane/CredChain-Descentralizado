import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, walletAddress } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    let aiResponse
    
    // Tentar conectar com ElizaOS com timeout
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout
      
      const elizaResponse = await fetch(`${process.env.ELIZA_API_URL || 'http://localhost:8000'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ELIZA_API_KEY || ''}`
        },
        body: JSON.stringify({
          message,
          walletAddress,
          context: 'credchain'
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (elizaResponse.ok) {
        const elizaData = await elizaResponse.json()
        aiResponse = elizaData.response
      } else {
        throw new Error('ElizaOS retornou erro')
      }
    } catch (error) {
      // Fallback para respostas básicas quando ElizaOS não estiver disponível
      const responses = [
        "Olá! Como posso ajudá-lo com seu crédito hoje?",
        "Posso ajudá-lo a entender melhor seu score de crédito.",
        "Que tal verificarmos seus pagamentos pendentes?",
        "Posso orientá-lo sobre como melhorar seu perfil financeiro.",
        "Estou aqui para ajudá-lo com questões sobre crédito e blockchain."
      ]
      aiResponse = responses[Math.floor(Math.random() * responses.length)]
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      walletAddress: walletAddress || null
    })

  } catch (error) {
    console.error('Erro na API de chat:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Chat CredChain funcionando',
    status: 'online',
    timestamp: new Date().toISOString()
  })
}
