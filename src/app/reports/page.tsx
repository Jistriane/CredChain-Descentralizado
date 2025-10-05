'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useWalletSafe } from '../../hooks/useWalletSafe'
import { 
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface Report {
  id: string
  title: string
  description: string
  type: 'credit' | 'payment' | 'financial' | 'compliance'
  status: 'ready' | 'generating' | 'error'
  createdAt: string
  fileSize?: string
  downloadCount: number
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { isConnected, address } = useWalletSafe()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'payment' | 'financial' | 'compliance'>('all')
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [isConnected, address])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Incluir endereço da carteira se conectada
      const url = isConnected && address 
        ? `/api/reports?walletAddress=${address}`
        : '/api/reports'
      
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
      setReports(data.reports || [])
      
      if (isConnected && address) {
        console.log('Relatórios carregados com dados da carteira:', address)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
      setError('Erro ao carregar relatórios')
    } finally {
      setIsLoading(false)
    }
  }

  // Dados serão carregados dinamicamente com base na carteira conectada

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Erro ao baixar relatório')
    }
  }

  const handleGenerateReport = async (type: string) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Recarregar lista de relatórios
      loadReports()
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Erro ao gerar relatório')
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'credit':
        return <Badge variant="primary">Score</Badge>
      case 'payment':
        return <Badge variant="success">Pagamentos</Badge>
      case 'financial':
        return <Badge variant="warning">Financeiro</Badge>
      case 'compliance':
        return <Badge variant="error">Compliance</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Pronto</Badge>
      case 'generating':
        return <Badge variant="warning">Gerando</Badge>
      case 'error':
        return <Badge variant="error">Erro</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <DocumentTextIcon className="w-5 h-5 text-green-500" />
      case 'generating':
        return <ChartBarIcon className="w-5 h-5 text-yellow-500 animate-pulse" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ChartBarIcon className="w-6 h-6 text-blue-600" />
      case 'payment':
        return <CreditCardIcon className="w-6 h-6 text-green-600" />
      case 'financial':
        return <BanknotesIcon className="w-6 h-6 text-yellow-600" />
      case 'compliance':
        return <ShieldCheckIcon className="w-6 h-6 text-red-600" />
      default:
        return <DocumentTextIcon className="w-6 h-6 text-gray-600" />
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
                onClick={loadReports}
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">Acesse e gerencie seus relatórios financeiros</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prontos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'ready').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gerando</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'generating').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ArrowDownTrayIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterType === 'credit' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('credit')}
            >
              Score
            </Button>
            <Button
              variant={filterType === 'payment' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('payment')}
            >
              Pagamentos
            </Button>
            <Button
              variant={filterType === 'financial' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('financial')}
            >
              Financeiro
            </Button>
            <Button
              variant={filterType === 'compliance' ? 'primary' : 'secondary'}
              onClick={() => setFilterType('compliance')}
            >
              Compliance
            </Button>
          </div>
        </div>

        {/* Lista de Relatórios */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getTypeIcon(report.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDate(report.createdAt)}
                      </div>
                      {report.fileSize && (
                        <span className="text-sm text-gray-500">
                          {report.fileSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {report.status === 'ready' && (
                    <>
                      <Button variant="secondary" size="sm">
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button size="sm">
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                  {report.status === 'generating' && (
                    <Button variant="secondary" size="sm" disabled>
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Gerando...
                    </Button>
                  )}
                  {report.status === 'error' && (
                    <Button variant="secondary" size="sm">
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Botão Gerar Novo Relatório */}
        <div className="mt-8 flex justify-center">
          <Button className="flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span>Gerar Novo Relatório</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
export const dynamic = "force-dynamic"
