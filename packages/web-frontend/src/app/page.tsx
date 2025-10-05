'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  UserGroupIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ScoreCard } from '@/components/dashboard/ScoreCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { CreditFactors } from '@/components/dashboard/CreditFactors'
import { FinancialHealth } from '@/components/dashboard/FinancialHealth'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { socket, isConnected } = useSocket()
  const [dashboardData, setDashboardData] = useState({
    score: 0,
    trend: 0,
    factors: [],
    recentActivity: [],
    financialHealth: {},
    recommendations: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for real-time updates
      socket.on('scoreUpdate', (data) => {
        setDashboardData(prev => ({
          ...prev,
          score: data.score,
          trend: data.trend
        }))
      })

      socket.on('activityUpdate', (data) => {
        setDashboardData(prev => ({
          ...prev,
          recentActivity: [data, ...prev.recentActivity.slice(0, 9)]
        }))
      })

      return () => {
        socket.off('scoreUpdate')
        socket.off('activityUpdate')
      }
    }
  }, [socket, isConnected])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-gray-600">
              Você precisa estar logado para acessar o dashboard.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Aqui está um resumo da sua saúde financeira
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Score and Factors */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ScoreCard 
                score={dashboardData.score}
                trend={dashboardData.trend}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Credit Factors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CreditFactors 
                factors={dashboardData.factors}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Financial Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FinancialHealth 
                data={dashboardData.financialHealth}
                isLoading={isLoading}
              />
            </motion.div>
          </div>

          {/* Right Column - Activity and Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <QuickActions />
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <RecentActivity 
                activities={dashboardData.recentActivity}
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Score Atual</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.score}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUpIcon className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tendência</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.trend > 0 ? '+' : ''}{dashboardData.trend}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pagamentos</p>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Compliance</p>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
