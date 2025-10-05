import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalScore: number;
  averageScore: number;
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    users: number;
    scores: number;
    transactions: number;
  }>;
  riskLevels: Array<{
    level: string;
    count: number;
    color: string;
  }>;
  complianceStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  fraudDetection: Array<{
    type: string;
    count: number;
    severity: string;
  }>;
}

export const InstitutionDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedInstitution, setSelectedInstitution] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedInstitution]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Carregar dados reais da API
      const response = await fetch('/api/analytics/institution');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de analytics da instituição');
      }
      
      const data: AnalyticsData = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Institucional</h1>
          <p className="text-gray-600">Análise completa do sistema</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as instituições</option>
            <option value="bank1">Banco A</option>
            <option value="bank2">Banco B</option>
            <option value="fintech1">Fintech X</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              +5 pontos em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.1%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de aprovação LGPD/GDPR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detecção de Fraude</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🛡️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88</div>
            <p className="text-xs text-muted-foreground">
              Casos detectados este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="fraud">Fraude</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="scores" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Risk Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Níveis de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {analyticsData?.riskLevels.map((risk, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: risk.color }}
                    >
                      {risk.count.toLocaleString()}
                    </div>
                    <p className="text-sm font-medium">{risk.level}</p>
                    <p className="text-xs text-gray-500">
                      {((risk.count / analyticsData.totalUsers) * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData?.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="scores" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.complianceStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status.status === 'Aprovado' ? 'bg-green-500' :
                          status.status === 'Pendente' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{status.count.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{status.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fraud Detection */}
            <Card>
              <CardHeader>
                <CardTitle>Detecção de Fraude</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.fraudDetection.map((fraud, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{fraud.type}</div>
                        <div className="text-sm text-gray-500">{fraud.severity}</div>
                      </div>
                      <Badge variant={
                        fraud.severity === 'Alta' ? 'error' :
                        fraud.severity === 'Média' ? 'warning' : 'secondary'
                      }>
                        {fraud.count} casos
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fraud Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Fraude</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="transactions" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          📊 Exportar Relatório
        </Button>
        <Button variant="outline">
          🔔 Configurar Alertas
        </Button>
        <Button>
          📈 Análise Avançada
        </Button>
      </div>
    </div>
  );
};