import { Redis } from 'redis';
import { Config } from '../config';
import { Logger } from '../utils/logger';
import axios from 'axios';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  metadata?: any;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export class NotificationAdapter {
  private config: Config;
  private logger: Logger;
  private redis: Redis | null = null;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor(config: Config) {
    this.config = config;
    this.logger = new Logger('NotificationAdapter');
  }

  /**
   * Conecta ao serviço de notificações
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando ao serviço de notificações...');

      // Conecta ao Redis para filas
      this.redis = new Redis({
        url: this.config.get('REDIS_URL'),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });

      // Carrega templates de notificação
      await this.loadTemplates();

      this.logger.info('✅ Serviço de notificações conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao serviço de notificações:', error);
      throw error;
    }
  }

  /**
   * Carrega templates de notificação
   */
  private async loadTemplates(): Promise<void> {
    const templates: NotificationTemplate[] = [
      {
        id: 'welcome',
        name: 'Bem-vindo ao CredChain',
        subject: 'Bem-vindo ao CredChain!',
        body: 'Olá {{name}}, bem-vindo ao CredChain! Seu score inicial é {{score}}.',
        variables: ['name', 'score'],
      },
      {
        id: 'score_update',
        name: 'Score Atualizado',
        subject: 'Seu score foi atualizado!',
        body: 'Seu score de crédito foi atualizado para {{score}}. {{message}}',
        variables: ['score', 'message'],
      },
      {
        id: 'payment_reminder',
        name: 'Lembrete de Pagamento',
        subject: 'Lembrete de Pagamento',
        body: 'Você tem um pagamento de R$ {{amount}} vencendo em {{dueDate}}.',
        variables: ['amount', 'dueDate'],
      },
      {
        id: 'fraud_alert',
        name: 'Alerta de Fraude',
        subject: 'Alerta de Segurança',
        body: 'Detectamos uma atividade suspeita em sua conta. {{details}}',
        variables: ['details'],
      },
      {
        id: 'compliance_alert',
        name: 'Alerta de Compliance',
        subject: 'Ação de Compliance Necessária',
        body: 'É necessário realizar uma ação de compliance: {{action}}',
        variables: ['action'],
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.logger.info(`✅ ${templates.length} templates de notificação carregados`);
  }

  /**
   * Envia notificação
   */
  async sendNotification(data: NotificationData): Promise<void> {
    try {
      this.logger.info(`Enviando notificação para ${data.userId}: ${data.title}`);

      // Adiciona à fila de notificações
      if (this.redis) {
        await this.redis.lpush('notifications:queue', JSON.stringify({
          ...data,
          timestamp: Date.now(),
          id: this.generateNotificationId(),
        }));
      }

      // Envia por cada canal
      for (const channel of data.channels) {
        await this.sendByChannel(data, channel);
      }

      this.logger.info(`✅ Notificação enviada com sucesso`);
    } catch (error) {
      this.logger.error('❌ Erro ao enviar notificação:', error);
      throw error;
    }
  }

  /**
   * Envia notificação por canal específico
   */
  private async sendByChannel(data: NotificationData, channel: string): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(data);
        break;
      case 'sms':
        await this.sendSMS(data);
        break;
      case 'push':
        await this.sendPush(data);
        break;
      case 'in_app':
        await this.sendInApp(data);
        break;
      default:
        this.logger.warn(`Canal de notificação não suportado: ${channel}`);
    }
  }

  /**
   * Envia email
   */
  private async sendEmail(data: NotificationData): Promise<void> {
    try {
      const emailService = this.config.get('EMAIL_SERVICE_URL');
      if (!emailService) {
        this.logger.warn('EMAIL_SERVICE_URL não configurado, pulando envio de email');
        return;
      }

      await axios.post(`${emailService}/send`, {
        to: data.userId,
        subject: data.title,
        body: data.message,
        type: data.type,
        priority: data.priority,
        metadata: data.metadata,
      });

      this.logger.info(`Email enviado para ${data.userId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar email:', error);
    }
  }

  /**
   * Envia SMS
   */
  private async sendSMS(data: NotificationData): Promise<void> {
    try {
      const smsService = this.config.get('SMS_SERVICE_URL');
      if (!smsService) {
        this.logger.warn('SMS_SERVICE_URL não configurado, pulando envio de SMS');
        return;
      }

      await axios.post(`${smsService}/send`, {
        to: data.userId,
        message: data.message,
        priority: data.priority,
      });

      this.logger.info(`SMS enviado para ${data.userId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar SMS:', error);
    }
  }

  /**
   * Envia push notification
   */
  private async sendPush(data: NotificationData): Promise<void> {
    try {
      const pushService = this.config.get('PUSH_SERVICE_URL');
      if (!pushService) {
        this.logger.warn('PUSH_SERVICE_URL não configurado, pulando envio de push');
        return;
      }

      await axios.post(`${pushService}/send`, {
        userId: data.userId,
        title: data.title,
        body: data.message,
        type: data.type,
        priority: data.priority,
        metadata: data.metadata,
      });

      this.logger.info(`Push notification enviado para ${data.userId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar push notification:', error);
    }
  }

  /**
   * Envia notificação in-app
   */
  private async sendInApp(data: NotificationData): Promise<void> {
    try {
      if (!this.redis) {
        this.logger.warn('Redis não conectado, pulando notificação in-app');
        return;
      }

      // Armazena notificação in-app no Redis
      await this.redis.hset(
        `notifications:in_app:${data.userId}`,
        Date.now().toString(),
        JSON.stringify({
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          metadata: data.metadata,
          read: false,
        })
      );

      this.logger.info(`Notificação in-app armazenada para ${data.userId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar notificação in-app:', error);
    }
  }

  /**
   * Obtém notificações in-app de um usuário
   */
  async getInAppNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      if (!this.redis) {
        return [];
      }

      const notifications = await this.redis.hgetall(`notifications:in_app:${userId}`);
      const result = Object.entries(notifications)
        .map(([timestamp, data]) => ({
          timestamp: parseInt(timestamp),
          ...JSON.parse(data),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

      return result;
    } catch (error) {
      this.logger.error('Erro ao obter notificações in-app:', error);
      return [];
    }
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(userId: string, timestamp: string): Promise<void> {
    try {
      if (!this.redis) {
        return;
      }

      const notification = await this.redis.hget(`notifications:in_app:${userId}`, timestamp);
      if (notification) {
        const data = JSON.parse(notification);
        data.read = true;
        await this.redis.hset(`notifications:in_app:${userId}`, timestamp, JSON.stringify(data));
      }
    } catch (error) {
      this.logger.error('Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Envia notificação usando template
   */
  async sendTemplateNotification(
    userId: string,
    templateId: string,
    variables: Record<string, any>,
    channels: ('email' | 'sms' | 'push' | 'in_app')[] = ['in_app']
  ): Promise<void> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template não encontrado: ${templateId}`);
      }

      // Substitui variáveis no template
      let subject = template.subject;
      let body = template.body;

      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      }

      // Envia notificação
      await this.sendNotification({
        userId,
        title: subject,
        message: body,
        type: 'info',
        priority: 'medium',
        channels,
        metadata: { templateId, variables },
      });
    } catch (error) {
      this.logger.error('Erro ao enviar notificação com template:', error);
      throw error;
    }
  }

  /**
   * Processa fila de notificações
   */
  async processNotificationQueue(): Promise<void> {
    try {
      if (!this.redis) {
        return;
      }

      const notification = await this.redis.rpop('notifications:queue');
      if (notification) {
        const data = JSON.parse(notification);
        await this.sendNotification(data);
      }
    } catch (error) {
      this.logger.error('Erro ao processar fila de notificações:', error);
    }
  }

  /**
   * Obtém estatísticas de notificações
   */
  async getNotificationStats(): Promise<any> {
    try {
      if (!this.redis) {
        return {
          queueSize: 0,
          totalSent: 0,
        };
      }

      const queueSize = await this.redis.llen('notifications:queue');
      const totalSent = await this.redis.get('notifications:total_sent') || '0';

      return {
        queueSize,
        totalSent: parseInt(totalSent),
      };
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas de notificações:', error);
      return {
        queueSize: 0,
        totalSent: 0,
      };
    }
  }

  /**
   * Gera ID único para notificação
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<any> {
    if (!this.redis) {
      return {
        connected: false,
        error: 'Redis não conectado',
      };
    }

    try {
      await this.redis.ping();
      return {
        connected: true,
        stats: await this.getNotificationStats(),
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Desconecta do serviço de notificações
   */
  async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
      }
      this.logger.info('✅ Desconectado do serviço de notificações');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar do serviço de notificações:', error);
      throw error;
    }
  }
}
