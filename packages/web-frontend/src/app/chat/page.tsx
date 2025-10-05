'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'text' | 'suggestion' | 'action'
  suggestions?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o ElizaOS, sua assistente de IA para questões financeiras. Como posso ajudá-lo hoje?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        sender: 'ai',
        timestamp: new Date(),
        type: aiResponse.type,
        suggestions: aiResponse.suggestions
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('score') || input.includes('pontuação')) {
      return {
        text: 'Seu score atual é 750 pontos, que está na faixa "Bom". Para melhorar seu score, recomendo:\n\n• Manter pagamentos em dia\n• Reduzir utilização de crédito\n• Diversificar tipos de crédito\n\nGostaria de ver um relatório detalhado?',
        type: 'suggestion' as const,
        suggestions: ['Ver relatório de score', 'Como melhorar meu score', 'Histórico de score']
      }
    }
    
    if (input.includes('pagamento') || input.includes('pagar')) {
      return {
        text: 'Vejo que você tem 2 pagamentos pendentes totalizando R$ 2.000,00. Posso ajudá-lo a:\n\n• Agendar pagamentos\n• Configurar lembretes\n• Analisar impacto no score\n\nO que gostaria de fazer?',
        type: 'suggestion' as const,
        suggestions: ['Agendar pagamento', 'Configurar lembretes', 'Ver impacto no score']
      }
    }
    
    if (input.includes('ajuda') || input.includes('help')) {
      return {
        text: 'Estou aqui para ajudá-lo! Posso auxiliar com:\n\n• Análise do seu score de crédito\n• Gestão de pagamentos\n• Recomendações financeiras\n• Explicações sobre produtos\n\nO que você gostaria de saber?',
        type: 'suggestion' as const,
        suggestions: ['Explicar meu score', 'Recomendações financeiras', 'Como funciona o sistema']
      }
    }
    
    return {
      text: 'Entendi sua pergunta. Posso ajudá-lo com questões relacionadas ao seu score de crédito, pagamentos, relatórios financeiros e muito mais. Poderia ser mais específico sobre o que gostaria de saber?',
      type: 'suggestion' as const,
      suggestions: ['Ver meu score', 'Gerenciar pagamentos', 'Relatórios financeiros']
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat com ElizaOS</h1>
              <p className="text-gray-600 mt-2">Sua assistente de IA para questões financeiras</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Principal */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              {/* Mensagens */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'user' 
                              ? 'bg-blue-500' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            {message.sender === 'user' ? (
                              <UserIcon className="w-5 h-5 text-white" />
                            ) : (
                              <CpuChipIcon className="w-5 h-5 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Mensagem */}
                        <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="whitespace-pre-line">{message.text}</p>
                          </div>
                          
                          {/* Sugestões */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <span className="text-xs text-gray-500 mt-1">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicador de digitação */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-lg">
                        <CpuChipIcon className="w-5 h-5 text-purple-500" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status da IA */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">ElizaOS</h3>
                  <p className="text-sm text-gray-600">Assistente de IA</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Resposta:</span>
                  <span className="text-gray-900">~2s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Precisão:</span>
                  <span className="text-gray-900">98%</span>
                </div>
              </div>
            </Card>

            {/* Ações Rápidas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Ver meu score de crédito')}
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Ver Score
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Gerenciar pagamentos')}
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Pagamentos
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Relatórios financeiros')}
                >
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </div>
            </Card>

            {/* Dicas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Dicas</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Pergunte sobre seu score e como melhorá-lo</span>
                </div>
                <div className="flex items-start space-x-2">
                  <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Solicite análises de pagamentos</span>
                </div>
                <div className="flex items-start space-x-2">
                  <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Peça recomendações personalizadas</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
