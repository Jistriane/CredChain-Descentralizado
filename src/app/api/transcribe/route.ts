import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio não fornecido' },
        { status: 400 }
      )
    }

    // Integração com serviço de transcrição real (OpenAI Whisper, Google Speech-to-Text, etc.)
    const transcriptionResponse = await fetch(`${process.env.TRANSCRIPTION_API_URL || 'http://localhost:8001'}/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TRANSCRIPTION_API_KEY || ''}`
      },
      body: formData
    })

    if (transcriptionResponse.ok) {
      const { transcription } = await transcriptionResponse.json()
      return NextResponse.json({ transcription })
    } else {
      // Fallback para transcrição básica
      return NextResponse.json({
        transcription: 'Transcrição não disponível no momento'
      })
    }

  } catch (error) {
    console.error('Erro na transcrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
