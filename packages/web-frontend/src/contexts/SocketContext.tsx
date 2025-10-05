'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SocketMessage {
  id: string
  type: 'score_update' | 'payment' | 'notification' | 'alert'
  title: string
  message: string
  timestamp: string
  data?: any
}

interface SocketContextType {
  isConnected: boolean
  messages: SocketMessage[]
  sendMessage: (message: any) => void
  subscribe: (event: string, callback: (data: any) => void) => void
  unsubscribe: (event: string, callback: (data: any) => void) => void
  lastMessage: SocketMessage | null
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<SocketMessage[]>([])
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null)
  const [subscriptions, setSubscriptions] = useState<Map<string, Set<(data: any) => void>>>(new Map())

  // Simular conexão WebSocket
  useEffect(() => {
    const connectSocket = () => {
      // Simular conexão
      setTimeout(() => {
        setIsConnected(true)
        console.log('Socket conectado')
      }, 1000)
    }

    connectSocket()

    // Simular mensagens periódicas
    const interval = setInterval(() => {
      if (isConnected) {
        const mockMessages: SocketMessage[] = [
          {
            id: Date.now().toString(),
            type: 'score_update',
            title: 'Score Atualizado',
            message: 'Seu score foi atualizado com base em novos dados',
            timestamp: new Date().toISOString(),
            data: { score: 750 + Math.floor(Math.random() * 20) - 10 }
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'payment',
            title: 'Pagamento Confirmado',
            message: 'Pagamento de R$ 1.250,00 foi confirmado',
            timestamp: new Date().toISOString(),
            data: { amount: 1250, status: 'confirmed' }
          },
          {
            id: (Date.now() + 2).toString(),
            type: 'notification',
            title: 'Nova Oferta',
            message: 'Você tem uma nova oferta de crédito disponível',
            timestamp: new Date().toISOString(),
            data: { offer: { amount: 5000, rate: 2.5 } }
          },
          {
            id: (Date.now() + 3).toString(),
            type: 'alert',
            title: 'Alerta de Score',
            message: 'Seu score caiu 5 pontos devido a atraso em pagamento',
            timestamp: new Date().toISOString(),
            data: { scoreChange: -5, reason: 'late_payment' }
          }
        ]

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        
        setMessages(prev => [randomMessage, ...prev.slice(0, 9)]) // Manter apenas 10 mensagens
        setLastMessage(randomMessage)

        // Notificar subscribers
        const callbacks = subscriptions.get(randomMessage.type)
        if (callbacks) {
          callbacks.forEach(callback => callback(randomMessage))
        }
      }
    }, 10000) // Mensagem a cada 10 segundos

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [isConnected, subscriptions])

  const sendMessage = (message: any) => {
    if (!isConnected) {
      console.warn('Socket não conectado')
      return
    }

    // Simular envio de mensagem
    console.log('Enviando mensagem:', message)
    
    // Simular resposta
    setTimeout(() => {
      const response: SocketMessage = {
        id: Date.now().toString(),
        type: 'notification',
        title: 'Mensagem Enviada',
        message: 'Sua mensagem foi processada com sucesso',
        timestamp: new Date().toISOString(),
        data: message
      }
      
      setMessages(prev => [response, ...prev.slice(0, 9)])
      setLastMessage(response)
    }, 500)
  }

  const subscribe = (event: string, callback: (data: any) => void) => {
    setSubscriptions(prev => {
      const newSubscriptions = new Map(prev)
      const callbacks = newSubscriptions.get(event) || new Set()
      callbacks.add(callback)
      newSubscriptions.set(event, callbacks)
      return newSubscriptions
    })
  }

  const unsubscribe = (event: string, callback: (data: any) => void) => {
    setSubscriptions(prev => {
      const newSubscriptions = new Map(prev)
      const callbacks = newSubscriptions.get(event)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          newSubscriptions.delete(event)
        } else {
          newSubscriptions.set(event, callbacks)
        }
      }
      return newSubscriptions
    })
  }

  const value: SocketContextType = {
    isConnected,
    messages,
    sendMessage,
    subscribe,
    unsubscribe,
    lastMessage
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider')
  }
  return context
}