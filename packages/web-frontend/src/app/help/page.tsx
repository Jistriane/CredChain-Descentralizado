'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PlayIcon,
  BookOpenIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

interface Article {
  id: string
  title: string
  description: string
  category: string
  readTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  // Dados mockados
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'Como funciona o sistema de score de crédito?',
      answer: 'O CredChain utiliza inteligência artificial e dados da blockchain para calcular seu score de crédito. Analisamos seu histórico de pagamentos, comportamento financeiro e outros fatores para gerar uma pontuação de 0 a 1000.',
      category: 'score',
      helpful: 45
    },
    {
      id: '2',
      question: 'Como conectar minha carteira digital?',
      answer: 'Para conectar sua carteira, clique no botão "Conectar Carteira" no canto superior direito. Certifique-se de ter o MetaMask instalado e aprovado a conexão. A rede será automaticamente configurada para Polkadot Hub TestNet.',
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

  const articles: Article[] = [
    {
      id: '1',
      title: 'Guia Completo: Como Usar o CredChain',
      description: 'Aprenda os conceitos básicos e como navegar pela plataforma',
      category: 'getting-started',
      readTime: '5 min',
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Entendendo Seu Score de Crédito',
      description: 'Explicação detalhada sobre como o score é calculado',
      category: 'score',
      readTime: '8 min',
      difficulty: 'intermediate'
    },
    {
      id: '3',
      title: 'Segurança e Privacidade',
      description: 'Como protegemos seus dados e garantimos sua privacidade',
      category: 'security',
      readTime: '6 min',
      difficulty: 'beginner'
    },
    {
      id: '4',
      title: 'Integração com Blockchain',
      description: 'Como funciona a integração com Polkadot e outras redes',
      category: 'blockchain',
      readTime: '12 min',
      difficulty: 'advanced'
    }
  ]

  const categories = [
    { id: 'all', name: 'Todos', count: faqs.length },
    { id: 'score', name: 'Score', count: faqs.filter(f => f.category === 'score').length },
    { id: 'wallet', name: 'Carteira', count: faqs.filter(f => f.category === 'wallet').length },
    { id: 'security', name: 'Segurança', count: faqs.filter(f => f.category === 'security').length },
    { id: 'ai', name: 'IA', count: faqs.filter(f => f.category === 'ai').length }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge variant="success">Iniciante</Badge>
      case 'intermediate':
        return <Badge variant="warning">Intermediário</Badge>
      case 'advanced':
        return <Badge variant="error">Avançado</Badge>
      default:
        return <Badge variant="secondary">{difficulty}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Central de Ajuda</h1>
          <p className="text-gray-600 mt-2">Encontre respostas para suas dúvidas e aprenda a usar o CredChain</p>
        </div>

        {/* Busca */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar ajuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Chat com IA</h3>
                <p className="text-sm text-gray-600">Converse com o ElizaOS</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PhoneIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Suporte</h3>
                <p className="text-sm text-gray-600">0800 123 4567</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <EnvelopeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">E-mail</h3>
                <p className="text-sm text-gray-600">suporte@credchain.com</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
              
              {/* Filtros de Categoria */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="p-6">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {faq.helpful} úteis
                        </span>
                        <div className="w-5 h-5 text-gray-400">
                          {expandedFAQ === faq.id ? (
                            <ExclamationTriangleIcon className="w-5 h-5" />
                          ) : (
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                      <div className="mt-4 flex items-center space-x-4">
                        <Button size="sm" variant="secondary">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Útil
                        </Button>
                        <Button size="sm" variant="secondary">
                          <XMarkIcon className="w-4 h-4 mr-2" />
                          Não útil
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Artigos e Recursos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Artigos e Tutoriais</h2>
            
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <BookOpenIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {article.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getDifficultyBadge(article.difficulty)}
                        <span className="text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3 inline mr-1" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Contato */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Não encontrou o que procura?</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Iniciar Chat
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Enviar E-mail
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Ligar para Suporte
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
