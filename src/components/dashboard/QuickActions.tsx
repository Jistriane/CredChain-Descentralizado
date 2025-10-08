'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
  action: () => void
  disabled?: boolean
}

export function QuickActions() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Ver Score',
      description: 'Consulte seu score de crédito',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: () => router.push('/score')
    },
    {
      id: '2',
      title: 'Pagamentos',
      description: 'Gerencie seus pagamentos',
      icon: BanknotesIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: () => router.push('/payments')
    },
    {
      id: '3',
      title: 'Relatórios',
      description: 'Veja seus relatórios detalhados',
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: () => router.push('/reports')
    },
    {
      id: '4',
      title: 'Chat IA',
      description: 'Converse com nossa IA',
      icon: CreditCardIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      action: () => router.push('/chat')
    },
    {
      id: '5',
      title: 'Carteira',
      description: 'Gerencie sua carteira',
      icon: ShieldCheckIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      action: () => router.push('/wallet'),
      disabled: false
    },
    {
      id: '6',
      title: 'Configurações',
      description: 'Atualize suas configurações',
      icon: ArrowPathIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      action: () => router.push('/settings')
    }
  ]

  const handleAction = async (action: QuickAction) => {
    if (action.disabled) return
    
    setLoading(action.id)
    
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    action.action()
    setLoading(null)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        <p className="text-sm text-gray-500">Acesse as principais funcionalidades</p>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            const isLoading = loading === action.id
            
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action)}
                disabled={action.disabled || isLoading}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200
                  ${action.bgColor} ${action.borderColor} ${action.color}
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                  ${isLoading ? 'animate-pulse' : ''}
                `}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Icon className="h-8 w-8" />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    <p className="text-xs opacity-75 mt-1">{action.description}</p>
                  </div>
                  
                  {action.disabled && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
        
        {/* Ações adicionais */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700">
                <PlusIcon className="h-4 w-4" />
                <span>Adicionar Conta</span>
              </button>
              
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700">
                <EyeIcon className="h-4 w-4" />
                <span>Ver Todas</span>
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              Última atualização: há 2 horas
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}