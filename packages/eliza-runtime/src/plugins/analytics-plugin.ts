import { Plugin, IAgentRuntime, Memory, State } from '@elizaos/core';

export interface AnalyticsEvent {
  eventName: string;
  userId: string;
  properties: any;
  timestamp: Date;
  sessionId?: string;
  deviceId?: string;
  platform?: string;
}

export interface CreditScoreAnalytics {
  userId: string;
  score: number;
  factors: any;
  calculatedAt: Date;
  modelVersion: string;
  confidence: number;
  dataSources: string[];
}

export interface PaymentAnalytics {
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  timestamp: Date;
  processingTime: number;
  fees: number;
}

export interface FraudAnalytics {
  userId: string;
  riskScore: number;
  indicators: string[];
  confidence: number;
  detectedAt: Date;
  modelVersion: string;
  falsePositive: boolean;
}

export interface UserBehaviorAnalytics {
  userId: string;
  sessionDuration: number;
  pageViews: number;
  actions: string[];
  deviceType: string;
  location: string;
  timestamp: Date;
}

export class AnalyticsPlugin implements Plugin {
  name = 'analyticsPlugin';
  version = '1.0.0';
  description = 'Plugin para análise de dados e métricas do CredChain';

  private events: AnalyticsEvent[] = [];
  private creditScores: CreditScoreAnalytics[] = [];
  private payments: PaymentAnalytics[] = [];
  private fraudEvents: FraudAnalytics[] = [];
  private userBehavior: UserBehaviorAnalytics[] = [];

  async initialize(runtime: IAgentRuntime): Promise<void> {
    console.log('📊 Analytics Plugin inicializado');
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    this.events.push(event);
    console.log(`📈 Evento rastreado: ${event.eventName} para usuário ${event.userId}`);
  }

  async trackCreditScore(analytics: CreditScoreAnalytics): Promise<void> {
    this.creditScores.push(analytics);
    console.log(`📊 Score de crédito rastreado: ${analytics.score} para usuário ${analytics.userId}`);
  }

  async trackPayment(analytics: PaymentAnalytics): Promise<void> {
    this.payments.push(analytics);
    console.log(`💳 Pagamento rastreado: ${analytics.amount} ${analytics.currency} para usuário ${analytics.userId}`);
  }

  async trackFraud(fraud: FraudAnalytics): Promise<void> {
    this.fraudEvents.push(fraud);
    console.log(`🚨 Fraude detectada: risco ${fraud.riskScore} para usuário ${fraud.userId}`);
  }

  async trackUserBehavior(behavior: UserBehaviorAnalytics): Promise<void> {
    this.userBehavior.push(behavior);
    console.log(`👤 Comportamento rastreado: ${behavior.actions.length} ações para usuário ${behavior.userId}`);
  }

  async getCreditScoreTrends(userId: string, period: string = '30d'): Promise<any> {
    const periodMs = this.getPeriodMs(period);
    const cutoffDate = new Date(Date.now() - periodMs);
    
    const userScores = this.creditScores.filter(score => 
      score.userId === userId && score.calculatedAt >= cutoffDate
    );

    return {
      userId,
      period,
      scores: userScores,
      averageScore: this.calculateAverageScore(userScores),
      trend: this.calculateTrend(userScores),
      volatility: this.calculateVolatility(userScores)
    };
  }

  async getPaymentPatterns(userId: string, period: string = '30d'): Promise<any> {
    const periodMs = this.getPeriodMs(period);
    const cutoffDate = new Date(Date.now() - periodMs);
    
    const userPayments = this.payments.filter(payment => 
      payment.userId === userId && payment.timestamp >= cutoffDate
    );

    return {
      userId,
      period,
      payments: userPayments,
      totalAmount: this.calculateTotalAmount(userPayments),
      averageAmount: this.calculateAverageAmount(userPayments),
      paymentMethods: this.getPaymentMethodDistribution(userPayments),
      successRate: this.calculateSuccessRate(userPayments)
    };
  }

  async getFraudRiskAssessment(userId: string): Promise<any> {
    const userFraudEvents = this.fraudEvents.filter(fraud => fraud.userId === userId);
    
    return {
      userId,
      totalEvents: userFraudEvents.length,
      averageRiskScore: this.calculateAverageRiskScore(userFraudEvents),
      highRiskEvents: userFraudEvents.filter(fraud => fraud.riskScore > 80).length,
      falsePositiveRate: this.calculateFalsePositiveRate(userFraudEvents),
      topIndicators: this.getTopFraudIndicators(userFraudEvents)
    };
  }

  async getUserBehaviorInsights(userId: string, period: string = '30d'): Promise<any> {
    const periodMs = this.getPeriodMs(period);
    const cutoffDate = new Date(Date.now() - periodMs);
    
    const userBehavior = this.userBehavior.filter(behavior => 
      behavior.userId === userId && behavior.timestamp >= cutoffDate
    );

    return {
      userId,
      period,
      sessions: userBehavior.length,
      averageSessionDuration: this.calculateAverageSessionDuration(userBehavior),
      totalPageViews: this.calculateTotalPageViews(userBehavior),
      mostUsedDevice: this.getMostUsedDevice(userBehavior),
      topActions: this.getTopActions(userBehavior),
      engagementScore: this.calculateEngagementScore(userBehavior)
    };
  }

  async getSystemMetrics(): Promise<any> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      totalUsers: new Set(this.events.map(e => e.userId)).size,
      totalEvents: this.events.length,
      eventsLast24h: this.events.filter(e => e.timestamp >= last24h).length,
      totalCreditScores: this.creditScores.length,
      totalPayments: this.payments.length,
      totalFraudEvents: this.fraudEvents.length,
      averageCreditScore: this.calculateAverageScore(this.creditScores),
      paymentSuccessRate: this.calculateSuccessRate(this.payments),
      fraudDetectionRate: this.calculateFraudDetectionRate()
    };
  }

  async getCreditScoreDistribution(): Promise<any> {
    const scoreRanges = {
      '0-300': 0,
      '301-500': 0,
      '501-700': 0,
      '701-850': 0,
      '851-1000': 0
    };

    this.creditScores.forEach(score => {
      if (score.score >= 0 && score.score <= 300) scoreRanges['0-300']++;
      else if (score.score >= 301 && score.score <= 500) scoreRanges['301-500']++;
      else if (score.score >= 501 && score.score <= 700) scoreRanges['501-700']++;
      else if (score.score >= 701 && score.score <= 850) scoreRanges['701-850']++;
      else if (score.score >= 851 && score.score <= 1000) scoreRanges['851-1000']++;
    });

    return scoreRanges;
  }

  async getPaymentMethodDistribution(): Promise<any> {
    const methods: { [key: string]: number } = {};
    
    this.payments.forEach(payment => {
      methods[payment.method] = (methods[payment.method] || 0) + 1;
    });

    return methods;
  }

  async getFraudIndicatorsDistribution(): Promise<any> {
    const indicators: { [key: string]: number } = {};
    
    this.fraudEvents.forEach(fraud => {
      fraud.indicators.forEach(indicator => {
        indicators[indicator] = (indicators[indicator] || 0) + 1;
      });
    });

    return indicators;
  }

  async generateReport(reportType: string, parameters: any): Promise<any> {
    switch (reportType) {
      case 'credit-score-trends':
        return await this.getCreditScoreTrends(parameters.userId, parameters.period);
      
      case 'payment-patterns':
        return await this.getPaymentPatterns(parameters.userId, parameters.period);
      
      case 'fraud-risk-assessment':
        return await this.getFraudRiskAssessment(parameters.userId);
      
      case 'user-behavior-insights':
        return await this.getUserBehaviorInsights(parameters.userId, parameters.period);
      
      case 'system-metrics':
        return await this.getSystemMetrics();
      
      case 'credit-score-distribution':
        return await this.getCreditScoreDistribution();
      
      case 'payment-method-distribution':
        return await this.getPaymentMethodDistribution();
      
      case 'fraud-indicators-distribution':
        return await this.getFraudIndicatorsDistribution();
      
      default:
        throw new Error(`Tipo de relatório não suportado: ${reportType}`);
    }
  }

  private getPeriodMs(period: string): number {
    const periods: { [key: string]: number } = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    
    return periods[period] || periods['30d'];
  }

  private calculateAverageScore(scores: CreditScoreAnalytics[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  }

  private calculateTrend(scores: CreditScoreAnalytics[]): string {
    if (scores.length < 2) return 'insufficient_data';
    
    const firstScore = scores[0].score;
    const lastScore = scores[scores.length - 1].score;
    
    if (lastScore > firstScore) return 'increasing';
    if (lastScore < firstScore) return 'decreasing';
    return 'stable';
  }

  private calculateVolatility(scores: CreditScoreAnalytics[]): number {
    if (scores.length < 2) return 0;
    
    const average = this.calculateAverageScore(scores);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score.score - average, 2), 0) / scores.length;
    return Math.sqrt(variance);
  }

  private calculateTotalAmount(payments: PaymentAnalytics[]): number {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  private calculateAverageAmount(payments: PaymentAnalytics[]): number {
    if (payments.length === 0) return 0;
    return this.calculateTotalAmount(payments) / payments.length;
  }

  private getPaymentMethodDistribution(payments: PaymentAnalytics[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    payments.forEach(payment => {
      distribution[payment.method] = (distribution[payment.method] || 0) + 1;
    });
    return distribution;
  }

  private calculateSuccessRate(payments: PaymentAnalytics[]): number {
    if (payments.length === 0) return 0;
    const successful = payments.filter(payment => payment.status === 'completed').length;
    return (successful / payments.length) * 100;
  }

  private calculateAverageRiskScore(fraudEvents: FraudAnalytics[]): number {
    if (fraudEvents.length === 0) return 0;
    return fraudEvents.reduce((sum, fraud) => sum + fraud.riskScore, 0) / fraudEvents.length;
  }

  private calculateFalsePositiveRate(fraudEvents: FraudAnalytics[]): number {
    if (fraudEvents.length === 0) return 0;
    const falsePositives = fraudEvents.filter(fraud => fraud.falsePositive).length;
    return (falsePositives / fraudEvents.length) * 100;
  }

  private getTopFraudIndicators(fraudEvents: FraudAnalytics[]): string[] {
    const indicators: { [key: string]: number } = {};
    fraudEvents.forEach(fraud => {
      fraud.indicators.forEach(indicator => {
        indicators[indicator] = (indicators[indicator] || 0) + 1;
      });
    });
    
    return Object.entries(indicators)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([indicator]) => indicator);
  }

  private calculateAverageSessionDuration(behavior: UserBehaviorAnalytics[]): number {
    if (behavior.length === 0) return 0;
    return behavior.reduce((sum, b) => sum + b.sessionDuration, 0) / behavior.length;
  }

  private calculateTotalPageViews(behavior: UserBehaviorAnalytics[]): number {
    return behavior.reduce((sum, b) => sum + b.pageViews, 0);
  }

  private getMostUsedDevice(behavior: UserBehaviorAnalytics[]): string {
    const devices: { [key: string]: number } = {};
    behavior.forEach(b => {
      devices[b.deviceType] = (devices[b.deviceType] || 0) + 1;
    });
    
    return Object.entries(devices)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  }

  private getTopActions(behavior: UserBehaviorAnalytics[]): string[] {
    const actions: { [key: string]: number } = {};
    behavior.forEach(b => {
      b.actions.forEach(action => {
        actions[action] = (actions[action] || 0) + 1;
      });
    });
    
    return Object.entries(actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);
  }

  private calculateEngagementScore(behavior: UserBehaviorAnalytics[]): number {
    if (behavior.length === 0) return 0;
    
    const totalSessions = behavior.length;
    const totalDuration = behavior.reduce((sum, b) => sum + b.sessionDuration, 0);
    const totalActions = behavior.reduce((sum, b) => sum + b.actions.length, 0);
    
    // Fórmula simples de engajamento
    return (totalDuration / totalSessions) * (totalActions / totalSessions);
  }

  private calculateFraudDetectionRate(): number {
    if (this.fraudEvents.length === 0) return 0;
    const detected = this.fraudEvents.filter(fraud => !fraud.falsePositive).length;
    return (detected / this.fraudEvents.length) * 100;
  }
}

export const analyticsPlugin = new AnalyticsPlugin();
