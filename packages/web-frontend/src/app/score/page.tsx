'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useWalletSafe } from '../../hooks/useWalletSafe'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface ScoreFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  current: number
  max: number
  description: string
  recommendation: string
}

interface ScoreHistory {
  date: string
  score: number
  change: number
}

export default function ScorePage() {
  const { user } = useAuth()
  const { isConnected, address } = useWalletSafe()
  const [activeTab, setActiveTab] = useState('overview')
  const [scoreData, setScoreData] = useState({
    currentScore: 0,
    previousScore: 0,
    factors: [],
    history: [],
    recommendations: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const currentScore = scoreData.currentScore
  const previousScore = scoreData.previousScore
  const scoreChange = currentScore - previousScore

  useEffect(() => {
    loadScoreData()
  }, [isConnected, address])

  const loadScoreData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Incluir endereço da carteira se conectada
      const url = isConnected && address 
        ? `/api/score?walletAddress=${address}`
        : '/api/score'
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setScoreData(data)
    } catch (error) {
      console.error('Error loading score data:', error)
      setError('Erro ao carregar dados do score')
    } finally {
      setIsLoading(false)
    }
  }
  
  const scoreRange = {
    excellent: { min: 800, max: 1000, color: '#10B981' },
    good: { min: 700, max: 799, color: '#3B82F6' },
    fair: { min: 600, max: 699, color: '#F59E0B' },
    poor: { min: 300, max: 599, color: '#EF4444' }
  }

  const getScoreLevel = (score: number) => {
    if (score >= 800) return { level: 'Excelente', color: scoreRange.excellent.color }
    if (score >= 700) return { level: 'Bom', color: scoreRange.good.color }
    if (score >= 600) return { level: 'Regular', color: scoreRange.fair.color }
    return { level: 'Ruim', color: scoreRange.poor.color }
  }

  const scoreLevel = getScoreLevel(currentScore)

  const factors: ScoreFactor[] = scoreData.factors || []
  const scoreHistory: ScoreHistory[] = scoreData.history || []
  const recommendations = scoreData.recommendations || []

  const getFactorIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
      case 'negative':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error">Alta</Badge>
      case 'medium':
        return <Badge variant="warning">Média</Badge>
      case 'low':
        return <Badge variant="success">Baixa</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadScoreData}
                className="btn btn-primary"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Score de Crédito</h1>
          <p className="text-gray-600 mt-2">Análise detalhada do seu score e fatores de influência</p>
        </div>

        {/* Score Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Seu Score Atual</h2>
                  <p className="text-gray-600">Última atualização: 15 de Janeiro, 2024</p>
                </div>
                <div className="flex items-center space-x-2">
                  {scoreChange > 0 ? (
                    <ArrowUpIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange} pontos
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="w-48 h-48">
                  <CircularProgressbar
                    value={currentScore}
                    maxValue={1000}
                    text={`${currentScore}`}
                    styles={buildStyles({
                      pathColor: scoreLevel.color,
                      textColor: scoreLevel.color,
                      trailColor: '#E5E7EB',
                      textSize: '24px'
                    })}
                  />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Score {scoreLevel.level}
                </h3>
                <p className="text-gray-600 mb-4">
                  Seu score está na faixa {scoreLevel.level.toLowerCase()}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button>
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                  <Button variant="secondary">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Resumo Rápido */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Score Atual:</span>
                  <span className="font-semibold">{currentScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Variação:</span>
                  <span className={`font-semibold ${
                    scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classificação:</span>
                  <Badge variant="success">{scoreLevel.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Próxima Atualização:</span>
                  <span className="text-sm">30 dias</span>
                </div>
              </div>
            </Card>

            {/* Faixas de Score */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Faixas de Score</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Excelente (800-1000)</span>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: scoreRange.excellent.color }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bom (700-799)</span>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: scoreRange.good.color }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Regular (600-699)</span>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: scoreRange.fair.color }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ruim (300-599)</span>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: scoreRange.poor.color }}></div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('factors')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'factors'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              Fatores
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Histórico
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LightBulbIcon className="w-4 h-4 mr-2" />
              Recomendações
            </button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pontos Fortes</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Histórico de pagamentos excelente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Boa idade do crédito</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Sem atrasos recentes</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Melhoria</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Utilização de crédito alta</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Muitas consultas recentes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Diversificação limitada</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="space-y-4">
            {factors.map((factor, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getFactorIcon(factor.impact)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{factor.name}</h3>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{factor.current}</div>
                    <div className="text-sm text-gray-600">de {factor.max}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{Math.round((factor.current / factor.max) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        factor.impact === 'positive' ? 'bg-green-500' : 
                        factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min((factor.current / factor.max) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <LightBulbIcon className="w-4 h-4 inline mr-1" />
                    <strong>Recomendação:</strong> {factor.recommendation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico de Score</h3>
            <div className="space-y-4">
              {scoreHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <div className="font-semibold text-gray-900">{entry.score} pontos</div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.change > 0 ? (
                      <ArrowUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      entry.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.change > 0 ? '+' : ''}{entry.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                      {getPriorityBadge(rec.priority)}
                    </div>
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Impacto estimado:</span>
                      <span className="text-sm font-semibold text-green-600">{rec.impact}</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Aplicar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export const dynamic = "force-dynamic"
export const dynamic = "force-dynamic"
