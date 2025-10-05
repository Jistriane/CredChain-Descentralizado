import { Plugin, IAgentRuntime, Memory, State } from '@elizaos/core';

export interface Notification {
  id: string;
  userId: string;
  type: 'score_update' | 'payment_reminder' | 'fraud_alert' | 'compliance_warning' | 'system_maintenance';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: 'in_app' | 'email' | 'sms' | 'push' | 'webhook';
  data?: any;
  scheduledAt?: Date;
  expiresAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
  channels: string[];
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  scoreUpdates: boolean;
  paymentReminders: boolean;
  fraudAlerts: boolean;
  complianceWarnings: boolean;
  systemMaintenance: boolean;
}

export class NotificationPlugin implements Plugin {
  name = 'notificationPlugin';
  version = '1.0.0';
  description = 'Plugin para gerenciamento de notificações do CredChain';

  private notifications: Notification[] = [];
  private templates: NotificationTemplate[] = [];
  private preferences: NotificationPreferences[] = [];

  async initialize(runtime: IAgentRuntime): Promise<void> {
    console.log('🔔 Notification Plugin inicializado');
    await this.loadTemplates();
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      status: 'pending'
    };

    this.notifications.push(newNotification);
    
    // Processar notificação
    await this.processNotification(newNotification);
    
    console.log(`📤 Notificação enviada: ${newNotification.type} para usuário ${newNotification.userId}`);
    return id;
  }

  async sendScoreUpdateNotification(userId: string, score: number, previousScore: number): Promise<string> {
    const change = score - previousScore;
    const changeText = change > 0 ? `+${change}` : change.toString();
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    
    return await this.sendNotification({
      userId,
      type: 'score_update',
      title: 'Seu score de crédito foi atualizado!',
      message: `${emoji} Seu score de crédito foi atualizado para ${score} pontos (${changeText}). ${this.getScoreMessage(score)}`,
      priority: 'high',
      channel: 'in_app',
      data: { score, previousScore, change }
    });
  }

  async sendPaymentReminderNotification(userId: string, amount: number, dueDate: Date, paymentId: string): Promise<string> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return await this.sendNotification({
      userId,
      type: 'payment_reminder',
      title: 'Lembrete de pagamento',
      message: `Você tem um pagamento de R$ ${amount.toFixed(2)} vencendo em ${daysUntilDue} dias.`,
      priority: daysUntilDue <= 2 ? 'urgent' : 'normal',
      channel: 'in_app',
      data: { amount, dueDate, paymentId, daysUntilDue }
    });
  }

  async sendFraudAlertNotification(userId: string, riskScore: number, indicators: string[]): Promise<string> {
    return await this.sendNotification({
      userId,
      type: 'fraud_alert',
      title: 'Alerta de segurança',
      message: `Detectamos atividade suspeita em sua conta. Nível de risco: ${riskScore}%. Verifique suas transações recentes.`,
      priority: 'urgent',
      channel: 'in_app',
      data: { riskScore, indicators }
    });
  }

  async sendComplianceWarningNotification(userId: string, regulation: string, violation: string): Promise<string> {
    return await this.sendNotification({
      userId,
      type: 'compliance_warning',
      title: 'Aviso de conformidade',
      message: `Atenção: Violação de ${regulation} detectada: ${violation}. Entre em contato conosco para mais informações.`,
      priority: 'high',
      channel: 'in_app',
      data: { regulation, violation }
    });
  }

  async sendSystemMaintenanceNotification(userId: string, maintenanceDate: Date, duration: string): Promise<string> {
    return await this.sendNotification({
      userId,
      type: 'system_maintenance',
      title: 'Manutenção programada',
      message: `O sistema passará por uma manutenção programada em ${maintenanceDate.toLocaleDateString('pt-BR')} por ${duration}.`,
      priority: 'normal',
      channel: 'in_app',
      data: { maintenanceDate, duration }
    });
  }

  async getNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => 
      n.userId === userId && n.status !== 'read'
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = 'read';
      notification.readAt = new Date();
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === userId && n.status !== 'read')
      .forEach(n => {
        n.status = 'read';
        n.readAt = new Date();
      });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    return this.preferences.find(p => p.userId === userId) || null;
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const existing = this.preferences.find(p => p.userId === userId);
    if (existing) {
      Object.assign(existing, preferences);
    } else {
      this.preferences.push({
        userId,
        email: true,
        sms: true,
        push: true,
        inApp: true,
        scoreUpdates: true,
        paymentReminders: true,
        fraudAlerts: true,
        complianceWarnings: true,
        systemMaintenance: true,
        ...preferences
      });
    }
  }

  async sendBulkNotification(userIds: string[], notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'status'>): Promise<string[]> {
    const ids: string[] = [];
    
    for (const userId of userIds) {
      const id = await this.sendNotification({
        ...notification,
        userId
      });
      ids.push(id);
    }
    
    return ids;
  }

  async scheduleNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>, scheduledAt: Date): Promise<string> {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      status: 'pending',
      scheduledAt
    };

    this.notifications.push(newNotification);
    
    // Agendar processamento
    setTimeout(async () => {
      await this.processNotification(newNotification);
    }, scheduledAt.getTime() - Date.now());
    
    return id;
  }

  async getNotificationStats(userId: string): Promise<any> {
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    
    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => n.status !== 'read').length,
      byType: this.getNotificationsByType(userNotifications),
      byPriority: this.getNotificationsByPriority(userNotifications),
      byChannel: this.getNotificationsByChannel(userNotifications)
    };
  }

  async getSystemNotificationStats(): Promise<any> {
    return {
      total: this.notifications.length,
      pending: this.notifications.filter(n => n.status === 'pending').length,
      sent: this.notifications.filter(n => n.status === 'sent').length,
      delivered: this.notifications.filter(n => n.status === 'delivered').length,
      failed: this.notifications.filter(n => n.status === 'failed').length,
      byType: this.getNotificationsByType(this.notifications),
      byPriority: this.getNotificationsByPriority(this.notifications),
      byChannel: this.getNotificationsByChannel(this.notifications)
    };
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      // Verificar preferências do usuário
      const preferences = await this.getNotificationPreferences(notification.userId);
      if (preferences && !this.shouldSendNotification(notification, preferences)) {
        notification.status = 'failed';
        return;
      }

      // Enviar notificação baseada no canal
      switch (notification.channel) {
        case 'in_app':
          await this.sendInAppNotification(notification);
          break;
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'sms':
          await this.sendSMSNotification(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'webhook':
          await this.sendWebhookNotification(notification);
          break;
      }

      notification.status = 'sent';
      notification.sentAt = new Date();
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      notification.status = 'failed';
    }
  }

  private shouldSendNotification(notification: Notification, preferences: NotificationPreferences): boolean {
    switch (notification.type) {
      case 'score_update':
        return preferences.scoreUpdates;
      case 'payment_reminder':
        return preferences.paymentReminders;
      case 'fraud_alert':
        return preferences.fraudAlerts;
      case 'compliance_warning':
        return preferences.complianceWarnings;
      case 'system_maintenance':
        return preferences.systemMaintenance;
      default:
        return true;
    }
  }

  private async sendInAppNotification(notification: Notification): Promise<void> {
    // Implementar envio de notificação in-app
    console.log(`📱 Notificação in-app enviada: ${notification.title}`);
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Implementar envio de email
    console.log(`📧 Email enviado: ${notification.title}`);
  }

  private async sendSMSNotification(notification: Notification): Promise<void> {
    // Implementar envio de SMS
    console.log(`📱 SMS enviado: ${notification.title}`);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Implementar envio de push notification
    console.log(`🔔 Push notification enviado: ${notification.title}`);
  }

  private async sendWebhookNotification(notification: Notification): Promise<void> {
    // Implementar envio de webhook
    console.log(`🔗 Webhook enviado: ${notification.title}`);
  }

  private async loadTemplates(): Promise<void> {
    this.templates = [
      {
        id: 'score-update',
        name: 'Score Update',
        type: 'score_update',
        subject: 'Seu score de crédito foi atualizado!',
        body: 'Seu score de crédito foi atualizado para {{score}} pontos ({{change}}). {{message}}',
        variables: ['score', 'change', 'message'],
        channels: ['in_app', 'email']
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        type: 'payment_reminder',
        subject: 'Lembrete de pagamento',
        body: 'Você tem um pagamento de R$ {{amount}} vencendo em {{days}} dias.',
        variables: ['amount', 'days'],
        channels: ['in_app', 'email', 'sms']
      },
      {
        id: 'fraud-alert',
        name: 'Fraud Alert',
        type: 'fraud_alert',
        subject: 'Alerta de segurança',
        body: 'Detectamos atividade suspeita em sua conta. Nível de risco: {{riskScore}}%.',
        variables: ['riskScore', 'indicators'],
        channels: ['in_app', 'email', 'sms', 'push']
      }
    ];
  }

  private getScoreMessage(score: number): string {
    if (score >= 850) return 'Excelente! Continue assim! 🎯';
    if (score >= 750) return 'Muito bom! Você está no caminho certo! 👍';
    if (score >= 650) return 'Bom! Há espaço para melhorar. 💪';
    if (score >= 550) return 'Regular. Foque em pagar em dia. 📅';
    return 'Baixo. Vamos trabalhar juntos para melhorar! 🤝';
  }

  private getNotificationsByType(notifications: Notification[]): { [key: string]: number } {
    const types: { [key: string]: number } = {};
    notifications.forEach(n => {
      types[n.type] = (types[n.type] || 0) + 1;
    });
    return types;
  }

  private getNotificationsByPriority(notifications: Notification[]): { [key: string]: number } {
    const priorities: { [key: string]: number } = {};
    notifications.forEach(n => {
      priorities[n.priority] = (priorities[n.priority] || 0) + 1;
    });
    return priorities;
  }

  private getNotificationsByChannel(notifications: Notification[]): { [key: string]: number } {
    const channels: { [key: string]: number } = {};
    notifications.forEach(n => {
      channels[n.channel] = (channels[n.channel] || 0) + 1;
    });
    return channels;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const notificationPlugin = new NotificationPlugin();
