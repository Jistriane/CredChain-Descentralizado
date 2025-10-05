'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CreditFactor {
  id: string
  name: string
  weight: number
  score: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  trend: 'up' | 'down' | 'stable'
  lastUpdate: string
}

// Dados serão carregados dinamicamente com base na carteira conectada
const getDefaultFactors = (): CreditFactor[] => [
  {
    id: '1',
    name: 'Histórico de Pagamentos',
    weight: 35,
    score: 0,
    impact: 'neutral',
    description: 'Será calculado com base no histórico da carteira',
    trend: 'stable',
    lastUpdate: 'Aguardando dados da carteira'
  },
  {
    id: '2',
    name: 'Renda vs Dívidas',
    weight: 25,
    score: 0,
    impact: 'neutral',
    description: 'Será calculado com base nas transações',
    trend: 'stable',
    lastUpdate: 'Aguardando dados da carteira'
  },
  {
    id: '3',
    name: 'Tempo de Conta',
    weight: 15,
    score: 0,
    impact: 'neutral',
    description: 'Será calculado com base na idade da carteira',
    trend: 'stable',
    lastUpdate: 'Aguardando dados da carteira'
  },
  {
    id: '4',
    name: 'Tipos de Crédito',
    weight: 10,
    score: 0,
    impact: 'neutral',
    description: 'Será calculado com base na diversificação',
    trend: 'stable',
    lastUpdate: 'Aguardando dados da carteira'
  },
  {
    id: '5',
    name: 'Consultas Recentes',
    weight: 10,
    score: 0,
    impact: 'neutral',
    description: 'Será calculado com base nas consultas recentes',
    trend: 'stable',
    lastUpdate: 'Aguardando dados da carteira'
  },
  {
    id: '6',
    name: 'Utilização de Limite',
    weight: 5,
    score: 0,
    impact: 'neutral',
    description: 'Será calculado com base na utilização',
    trend: 'stable',
    lastUpdate: 'Aguardando dados da carteira'
  }
]

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bom'
  if (score >= 40) return 'Regular'
  return 'Ruim'
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return ArrowTrendingUpIcon
    case 'down':
      return ArrowTrendingDownIcon
    default:
      return ChartBarIcon
  }
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-green-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

interface CreditFactorsProps {
  factors?: Array<{
    name: string
    score: number
    impact: 'high' | 'medium' | 'low'
  }>
  isLoading?: boolean
}

export function CreditFactors({ factors: propFactors, isLoading = false }: CreditFactorsProps) {
  const [factors, setFactors] = useState<CreditFactor[]>([])

  useEffect(() => {
    if (propFactors) {
      // Atualizar fatores com dados reais
      const updatedFactors = getDefaultFactors().map(defaultFactor => {
        const propFactor = propFactors.find(f => f.name === defaultFactor.name)
        if (propFactor) {
          return {
            ...defaultFactor,
            score: propFactor.score,
            impact: propFactor.impact === 'high' ? 'positive' as const : 
                   propFactor.impact === 'medium' ? 'neutral' as const : 'negative' as const,
            lastUpdate: 'Atualizado agora'
          }
        }
        return defaultFactor
      })
      setFactors(updatedFactors)
    } else {
      setFactors(getDefaultFactors())
    }
  }, [propFactors])

  const totalScore = factors.reduce((acc, factor) => {
    return acc + (factor.score * factor.weight / 100)
  }, 0)

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fatores de Crédito</h3>
            <p className="text-sm text-gray-500">Análise detalhada dos componentes do seu score</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(totalScore)}
            </div>
            <div className="text-sm text-gray-500">Score Calculado</div>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="space-y-4">
          {factors.map((factor, index) => {
            const scoreColor = getScoreColor(factor.score)
            const scoreLabel = getScoreLabel(factor.score)
            const TrendIcon = getTrendIcon(factor.trend)
            const trendColor = getTrendColor(factor.trend)
            
            return (
              <motion.div
                key={factor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{factor.name}</h4>
                    <span className="text-xs text-gray-500">({factor.weight}%)</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${scoreColor.split(' ')[0]}`}>
                      {factor.score}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{scoreLabel}</span>
                    <span>{factor.lastUpdate}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        factor.score >= 80 ? 'bg-green-500' :
                        factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{factor.description}</p>
                
                <div className="mt-3 flex items-center space-x-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                    factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {factor.impact === 'positive' ? 'Positivo' :
                     factor.impact === 'negative' ? 'Negativo' : 'Neutro'}
                  </div>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    factor.trend === 'up' ? 'bg-green-100 text-green-800' :
                    factor.trend === 'down' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {factor.trend === 'up' ? 'Subindo' :
                     factor.trend === 'down' ? 'Descendo' : 'Estável'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {factors.length === 0 && (
          <div className="text-center py-8">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum fator disponível</h3>
            <p className="mt-1 text-sm text-gray-500">
              Os fatores de crédito aparecerão aqui
            </p>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <div className="flex items-center justify-between">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver análise detalhada
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            Atualizar dados
          </button>
        </div>
      </div>
    </div>
  )
}
