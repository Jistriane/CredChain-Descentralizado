'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalTransactions: number;
    totalVolume: number;
    averageScore: number;
    growthRate: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  transactionTrends: Array<{
    date: string;
    transactions: number;
    volume: number;
    averageAmount: number;
  }>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
  }>;
  paymentStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  riskAnalysis: Array<{
    category: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }>;
  topPerformers: Array<{
    userId: string;
    name: string;
    score: number;
    improvement: number;
    transactions: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  success: '#10B981',
  gray: '#6B7280',
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 12543,
          totalTransactions: 89432,
          totalVolume: 12500000,
          averageScore: 720,
          growthRate: 12.5,
          riskLevel: 'low',
        },
        scoreDistribution: [
          { range: '0-300', count: 234, percentage: 1.9 },
          { range: '301-500', count: 1256, percentage: 10.0 },
          { range: '501-700', count: 3456, percentage: 27.5 },
          { range: '701-850', count: 4567, percentage: 36.4 },
          { range: '851-1000', count: 3030, percentage: 24.2 },
        ],
        transactionTrends: [
          { date: '2024-01-01', transactions: 1200, volume: 150000, averageAmount: 125 },
          { date: '2024-01-02', transactions: 1350, volume: 168000, averageAmount: 124 },
          { date: '2024-01-03', transactions: 1100, volume: 140000, averageAmount: 127 },
          { date: '2024-01-04', transactions: 1450, volume: 180000, averageAmount: 124 },
          { date: '2024-01-05', transactions: 1600, volume: 200000, averageAmount: 125 },
          { date: '2024-01-06', transactions: 1300, volume: 165000, averageAmount: 127 },
          { date: '2024-01-07', transactions: 1400, volume: 175000, averageAmount: 125 },
        ],
        userGrowth: [
          { date: '2024-01-01', newUsers: 45, activeUsers: 1200, totalUsers: 12000 },
          { date: '2024-01-02', newUsers: 52, activeUsers: 1250, totalUsers: 12052 },
          { date: '2024-01-03', newUsers: 38, activeUsers: 1280, totalUsers: 12090 },
          { date: '2024-01-04', newUsers: 61, activeUsers: 1320, totalUsers: 12151 },
          { date: '2024-01-05', newUsers: 48, activeUsers: 1350, totalUsers: 12199 },
          { date: '2024-01-06', newUsers: 55, activeUsers: 1380, totalUsers: 12254 },
          { date: '2024-01-07', newUsers: 42, activeUsers: 1400, totalUsers: 12296 },
        ],
        paymentStatus: [
          { status: 'Paid', count: 45678, percentage: 51.1, color: COLORS.success },
          { status: 'Pending', count: 23456, percentage: 26.2, color: COLORS.warning },
          { status: 'Late', count: 12345, percentage: 13.8, color: COLORS.danger },
          { status: 'Defaulted', count: 7953, percentage: 8.9, color: COLORS.danger },
        ],
        riskAnalysis: [
          { category: 'Credit Score', low: 45, medium: 30, high: 20, critical: 5 },
          { category: 'Payment History', low: 60, medium: 25, high: 12, critical: 3 },
          { category: 'Transaction Patterns', low: 50, medium: 35, high: 13, critical: 2 },
          { category: 'Identity Verification', low: 70, medium: 20, high: 8, critical: 2 },
        ],
        topPerformers: [
          { userId: 'user_001', name: 'João Silva', score: 950, improvement: 25, transactions: 45 },
          { userId: 'user_002', name: 'Maria Santos', score: 920, improvement: 18, transactions: 38 },
          { userId: 'user_003', name: 'Pedro Costa', score: 890, improvement: 22, transactions: 42 },
          { userId: 'user_004', name: 'Ana Oliveira', score: 875, improvement: 15, transactions: 35 },
          { userId: 'user_005', name: 'Carlos Lima', score: 860, improvement: 20, transactions: 40 },
        ],
        alerts: [
          {
            id: 'alert_001',
            type: 'warning',
            title: 'Alto Volume de Transações',
            message: 'Detectado aumento de 150% no volume de transações nas últimas 24h',
            timestamp: '2024-01-07T10:30:00Z',
            severity: 'medium',
          },
          {
            id: 'alert_002',
            type: 'error',
            title: 'Falha na Integração',
            message: 'Erro na integração com o sistema de pagamentos PIX',
            timestamp: '2024-01-07T09:15:00Z',
            severity: 'high',
          },
          {
            id: 'alert_003',
            type: 'info',
            title: 'Nova Atualização',
            message: 'Sistema atualizado para versão 2.1.0',
            timestamp: '2024-01-07T08:00:00Z',
            severity: 'low',
          },
        ],
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'high': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dados</h1>
          <button
            onClick={loadAnalyticsData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Analytics</h1>
          <p className="text-gray-600">Visão geral do sistema CredChain</p>
          
          {/* Filtros */}
          <div className="flex items-center space-x-4 mt-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedChart('overview')}
                className={`px-4 py-2 rounded-lg ${
                  selectedChart === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setSelectedChart('trends')}
                className={`px-4 py-2 rounded-lg ${
                  selectedChart === 'trends' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Tendências
              </button>
              <button
                onClick={() => setSelectedChart('risk')}
                className={`px-4 py-2 rounded-lg ${
                  selectedChart === 'risk' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Análise de Risco
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalUsers)}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{data.overview.growthRate}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transações</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalTransactions)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8.2%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.overview.totalVolume)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15.3%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Médio</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.averageScore}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-600">Nível de Risco: </span>
              <span className={`text-sm font-medium ml-1 ${
                data.overview.riskLevel === 'low' ? 'text-green-600' : 
                data.overview.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {data.overview.riskLevel === 'low' ? 'Baixo' : 
                 data.overview.riskLevel === 'medium' ? 'Médio' : 'Alto'}
              </span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribuição de Scores */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status de Pagamentos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Pagamentos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.paymentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tendências */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tendência de Transações */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência de Transações</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.transactionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="transactions" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} />
                <Area type="monotone" dataKey="volume" stackId="2" stroke={COLORS.secondary} fill={COLORS.secondary} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Crescimento de Usuários */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crescimento de Usuários</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" stroke={COLORS.primary} name="Novos Usuários" />
                <Line type="monotone" dataKey="activeUsers" stroke={COLORS.secondary} name="Usuários Ativos" />
                <Line type="monotone" dataKey="totalUsers" stroke={COLORS.warning} name="Total de Usuários" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Análise de Risco */}
        {selectedChart === 'risk' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Risco por Categoria</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.riskAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" stackId="a" fill={COLORS.success} name="Baixo" />
                <Bar dataKey="medium" stackId="a" fill={COLORS.warning} name="Médio" />
                <Bar dataKey="high" stackId="a" fill={COLORS.danger} name="Alto" />
                <Bar dataKey="critical" stackId="a" fill="#7C2D12" name="Crítico" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Melhoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topPerformers.map((performer, index) => (
                  <tr key={performer.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium">{index + 1}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                          <div className="text-sm text-gray-500">{performer.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{performer.score}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600">+{performer.improvement}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{performer.transactions}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas do Sistema</h3>
          <div className="space-y-4">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.severity === 'low' ? 'bg-green-100 text-green-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.severity === 'low' ? 'Baixo' :
                       alert.severity === 'medium' ? 'Médio' :
                       alert.severity === 'high' ? 'Alto' : 'Crítico'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}