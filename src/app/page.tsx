'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ScoreCard } from '@/components/dashboard/ScoreCard'
import { FinancialHealth } from '@/components/dashboard/FinancialHealth'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { CreditFactors } from '@/components/dashboard/CreditFactors'

interface DashboardData {
  score: number
  trend: number
  walletAddress?: string
  factors: Array<{
    name: string
    score: number
    impact: 'high' | 'medium' | 'low'
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    amount?: number
    date: string
  }>
  financialHealth: {
    totalDebt: number
    monthlyIncome: number
    creditUtilization: number
    paymentHistory: number
  }
  recommendations: string[]
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados mockados para demonstração
      const mockData: DashboardData = {
        score: 750,
        trend: 15,
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        factors: [
          { name: 'Histórico de Pagamentos', score: 85, impact: 'high' },
          { name: 'Utilização de Crédito', score: 70, impact: 'medium' },
          { name: 'Tempo de Conta', score: 60, impact: 'high' },
          { name: 'Tipos de Crédito', score: 45, impact: 'low' }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'payment',
            description: 'Pagamento realizado com sucesso',
            amount: 150.00,
            date: new Date().toISOString()
          },
          {
            id: '2',
            type: 'score_update',
            description: 'Score atualizado',
            date: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            type: 'wallet_connected',
            description: 'Carteira conectada',
            date: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        financialHealth: {
          totalDebt: 2500.00,
          monthlyIncome: 5000.00,
          creditUtilization: 0.25,
          paymentHistory: 95
        },
        recommendations: [
          'Mantenha seus pagamentos em dia',
          'Diversifique seus tipos de crédito',
          'Monitore sua utilização de crédito'
        ]
      }
      
      setDashboardData(mockData)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando CredChain...</p>
        </div>
      </main>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo ao CredChain! 👋
          </h1>
          <p className="text-blue-100">
            Gerencie seu crédito de forma descentralizada e inteligente
          </p>
        </div>

        {/* Score Card */}
        {dashboardData && (
          <ScoreCard 
            score={dashboardData.score} 
            trend={dashboardData.trend}
            isLoading={isLoading}
          />
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Financial Health */}
        {dashboardData && (
          <FinancialHealth 
            data={dashboardData.financialHealth}
            isLoading={isLoading}
          />
        )}

        {/* Credit Factors */}
        {dashboardData && (
          <CreditFactors 
            factors={dashboardData.factors}
            isLoading={isLoading}
          />
        )}

        {/* Recent Activity */}
        {dashboardData && (
          <RecentActivity 
            activities={dashboardData.recentActivity}
            isLoading={isLoading}
          />
        )}

        {/* Recommendations */}
        {dashboardData && dashboardData.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Recomendações para Melhorar seu Score
            </h3>
            <div className="space-y-2">
              {dashboardData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}