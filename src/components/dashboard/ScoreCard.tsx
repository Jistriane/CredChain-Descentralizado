'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface ScoreCardProps {
  score: number
  trend: number
  isLoading?: boolean
}

export function ScoreCard({ score, trend, isLoading = false }: ScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getScoreLevel = (score: number) => {
    if (score >= 800) return { level: 'Excelente', color: 'text-success-600', bg: 'bg-success-50' }
    if (score >= 700) return { level: 'Bom', color: 'text-primary-600', bg: 'bg-primary-50' }
    if (score >= 600) return { level: 'Regular', color: 'text-warning-600', bg: 'bg-warning-50' }
    if (score >= 500) return { level: 'Ruim', color: 'text-error-600', bg: 'bg-error-50' }
    return { level: 'Muito Ruim', color: 'text-error-600', bg: 'bg-error-50' }
  }

  const scoreLevel = getScoreLevel(score)
  const percentage = (score / 1000) * 100

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card hover-lift">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Seu Score de Crédito</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <InformationCircleIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="flex items-center justify-between">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32">
              <CircularProgressbar
                value={percentage}
                text={`${score}`}
                styles={buildStyles({
                  pathColor: scoreLevel.color.replace('text-', '#'),
                  textColor: '#1f2937',
                  trailColor: '#e5e7eb',
                  textSize: '24px',
                })}
              />
            </div>
          </div>

          {/* Score Info */}
          <div className="flex-1 ml-8">
            <div className="space-y-4">
              <div>
                <h3 className={`text-2xl font-bold ${scoreLevel.color}`}>
                  {scoreLevel.level}
                </h3>
                <p className="text-gray-600">
                  Score de {score} pontos
                </p>
              </div>

              {/* Trend */}
              <div className="flex items-center space-x-2">
                {trend > 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-success-500" />
                ) : trend < 0 ? (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-error-500" />
                ) : null}
                <span className={`text-sm font-medium ${
                  trend > 0 ? 'text-success-600' : 
                  trend < 0 ? 'text-error-600' : 
                  'text-gray-600'
                }`}>
                  {trend > 0 ? '+' : ''}{trend} pontos este mês
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${scoreLevel.bg}`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: scoreLevel.color.replace('text-', '#')
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Como seu score é calculado:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Histórico de pagamentos</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilização de crédito</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Idade do crédito</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diversidade de crédito</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Novas consultas</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
