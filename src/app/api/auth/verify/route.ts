import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Em produção, buscar dados do usuário no banco de dados
    const userData = {
      id: decoded.userId,
      name: 'Admin CredChain',
      email: decoded.email,
      score: 850,
      verified: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString()
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}
