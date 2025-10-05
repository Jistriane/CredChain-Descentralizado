'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface ActivityItem {
  id: string
  type: 'score_update' | 'payment' | 'verification' | 'alert'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
  value?: string
}

// Dados serão carregados dinamicamente da API

const getActivityIcon = (type: string, status: string) => {
  switch (type) {
    case 'score_update':
      return status === 'success' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
    case 'payment':
      return CheckCircleIcon
    case 'verification':
      return ClockIcon
    case 'alert':
      return ExclamationTriangleIcon
    default:
      return ClockIcon
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

interface RecentActivityProps {
  activities?: Array<{
    id: string
    type: string
    description: string
    amount?: number
    date: string
  }>
  isLoading?: boolean
}

export function RecentActivity({ activities: propActivities, isLoading = false }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (propActivities) {
      // Converter atividades das props para o formato do componente
      const convertedActivities: ActivityItem[] = propActivities.map(activity => ({
        id: activity.id,
        type: activity.type as any,
        title: activity.type === 'payment' ? 'Pagamento Realizado' :
               activity.type === 'score_update' ? 'Score Atualizado' :
               activity.type === 'wallet_connected' ? 'Carteira Conectada' : 'Atividade',
        description: activity.description,
        timestamp: new Date(activity.date).toLocaleString('pt-BR'),
        status: activity.type === 'payment' ? 'success' as const :
                activity.type === 'score_update' ? 'success' as const :
                activity.type === 'wallet_connected' ? 'info' as const : 'info' as const,
        value: activity.amount ? `R$ ${activity.amount.toFixed(2)}` : undefined
      }))
      setActivities(convertedActivities)
    } else {
      setActivities([])
    }
  }, [propActivities])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
        <p className="text-sm text-gray-500">Últimas atualizações do seu perfil</p>
      </div>
      
      <div className="card-body">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type, activity.status)
            const statusColor = getStatusColor(activity.status)
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${statusColor}`}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  
                  {activity.value && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      activity.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.value}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade</h3>
            <p className="mt-1 text-sm text-gray-500">
              Suas atividades aparecerão aqui
            </p>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver todas as atividades
        </button>
      </div>
    </div>
  )
}
