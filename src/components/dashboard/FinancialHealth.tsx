'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface FinancialMetric {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical' | 'neutral'
  description: string
}

// Dados serão carregados dinamicamente com base na carteira conectada
const getDefaultMetrics = (): FinancialMetric[] => [
  {
    id: '1',
    name: 'Saldo da Carteira',
    value: 0,
    previousValue: 0,
    unit: 'ETH',
    trend: 'stable',
    status: 'neutral',
    description: 'Saldo atual da carteira blockchain'
  },
  {
    id: '2',
    name: 'Transações Totais',
    value: 0,
    previousValue: 0,
    unit: '',
    trend: 'stable',
    status: 'neutral',
    description: 'Total de transações realizadas'
  },
  {
    id: '3',
    name: 'Valor Total Movimentado',
    value: 0,
    previousValue: 0,
    unit: 'ETH',
    trend: 'stable',
    status: 'neutral',
    description: 'Valor total movimentado na carteira'
  },
  {
    id: '4',
    name: 'Atividade Recente',
    value: 0,
    previousValue: 0,
    unit: 'dias',
    trend: 'stable',
    status: 'neutral',
    description: 'Última atividade na carteira'
  },
  {
    id: '5',
    name: 'Idade da Carteira',
    value: 0,
    previousValue: 0,
    unit: 'dias',
    trend: 'stable',
    status: 'neutral',
    description: 'Tempo desde a criação da carteira'
  },
  {
    id: '6',
    name: 'Score de Crédito',
    value: 0,
    previousValue: 0,
    unit: '',
    trend: 'stable',
    status: 'neutral',
    description: 'Score será calculado com base nos dados da carteira'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'neutral':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
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

const formatValue = (value: number, unit: string) => {
  if (unit === 'R$') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  if (unit === '%') {
    return `${value}%`
  }
  return value.toString()
}

interface FinancialHealthProps {
  data?: {
    totalDebt: number
    monthlyIncome: number
    creditUtilization: number
    paymentHistory: number
  }
  isLoading?: boolean
}

export function FinancialHealth({ data, isLoading = false }: FinancialHealthProps) {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([])

  useEffect(() => {
    if (data) {
      // Atualizar métricas com dados reais
      const updatedMetrics = getDefaultMetrics().map(metric => {
        switch (metric.name) {
          case 'Saldo da Carteira':
            return { ...metric, value: data.monthlyIncome, status: 'good' as const }
          case 'Transações Totais':
            return { ...metric, value: data.paymentHistory, status: 'good' as const }
          case 'Valor Total Movimentado':
            return { ...metric, value: data.totalDebt, status: data.totalDebt > 0 ? 'warning' as const : 'good' as const }
          case 'Score de Crédito':
            return { ...metric, value: 750, status: 'good' as const }
          default:
            return metric
        }
      })
      setMetrics(updatedMetrics)
    } else {
      setMetrics(getDefaultMetrics())
    }
  }, [data])

  const overallHealth = metrics.reduce((acc, metric) => {
    const weight = metric.name === 'Score de Crédito' ? 0.3 : 0.14
    return acc + (metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 20) * weight
  }, 0)

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Saúde Financeira</h3>
            <p className="text-sm text-gray-500">Visão geral da sua situação financeira</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(overallHealth)}
            </div>
            <div className="text-sm text-gray-500">Índice Geral</div>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const statusColor = getStatusColor(metric.status)
            const TrendIcon = getTrendIcon(metric.trend)
            const trendColor = getTrendColor(metric.trend)
            const change = metric.value - metric.previousValue
            const changePercent = metric.previousValue > 0 ? 
              ((change / metric.previousValue) * 100) : 0
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${statusColor.split(' ')[2]} border-opacity-50`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{metric.name}</h4>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {change > 0 ? '+' : ''}{formatValue(change, metric.unit)} vs mês anterior
                  </div>
                </div>
                
                <p className="text-xs text-gray-600">{metric.description}</p>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metric.status === 'good' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.status === 'good' ? 'Bom' :
                       metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {metrics.length === 0 && (
          <div className="text-center py-8">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado disponível</h3>
            <p className="mt-1 text-sm text-gray-500">
              Os dados financeiros aparecerão aqui
            </p>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <div className="flex items-center justify-between">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver relatório completo
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Atualizado há 2 horas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
