/**
 * Audit Logger - Sistema de auditoria
 * 
 * Registra todas as ações importantes do sistema para auditoria
 */

import { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { DatabaseAdapter } from '../adapters/database';

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  path: string;
  statusCode: number;
  requestBody?: any;
  responseBody?: any;
  metadata?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security';
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class AuditLogger {
  private logger: Logger;
  private dbAdapter: DatabaseAdapter;
  private isEnabled: boolean;

  constructor(dbAdapter: DatabaseAdapter, enabled: boolean = true) {
    this.dbAdapter = dbAdapter;
    this.logger = new Logger('AuditLogger');
    this.isEnabled = enabled;
  }

  /**
   * Registrar evento de auditoria
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const auditEvent: AuditEvent = {
        ...event,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      // Log no console
      this.logger.info('Audit Event', {
        action: auditEvent.action,
        resource: auditEvent.resource,
        userId: auditEvent.userId,
        severity: auditEvent.severity,
        category: auditEvent.category,
      });

      // Salvar no banco de dados
      await this.saveAuditEvent(auditEvent);

      // Log de segurança para eventos críticos
      if (auditEvent.severity === 'critical' || auditEvent.severity === 'high') {
        this.logger.warn('Security Event', {
          action: auditEvent.action,
          resource: auditEvent.resource,
          userId: auditEvent.userId,
          ipAddress: auditEvent.ipAddress,
          severity: auditEvent.severity,
        });
      }
    } catch (error) {
      this.logger.error('Erro ao registrar evento de auditoria:', error);
    }
  }

  /**
   * Registrar login
   */
  async logLogin(req: Request, res: Response, userId: string, userEmail: string, success: boolean): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action: success ? 'login_success' : 'login_failed',
      resource: 'authentication',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      severity: success ? 'low' : 'high',
      category: 'authentication',
      metadata: {
        success,
        loginTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Registrar logout
   */
  async logLogout(req: Request, res: Response, userId: string, userEmail: string): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action: 'logout',
      resource: 'authentication',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      severity: 'low',
      category: 'authentication',
    });
  }

  /**
   * Registrar acesso a dados
   */
  async logDataAccess(req: Request, res: Response, userId: string, resource: string, resourceId?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'data_access',
      resource,
      resourceId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      severity: 'low',
      category: 'data_access',
    });
  }

  /**
   * Registrar modificação de dados
   */
  async logDataModification(
    req: Request,
    res: Response,
    userId: string,
    resource: string,
    resourceId?: string,
    action: string = 'update'
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource,
      resourceId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      severity: 'medium',
      category: 'data_modification',
      requestBody: this.sanitizeRequestBody(req.body),
    });
  }

  /**
   * Registrar tentativa de acesso não autorizado
   */
  async logUnauthorizedAccess(req: Request, res: Response, userId?: string, resource?: string): Promise<void> {
    await this.logEvent({
      userId,
      action: 'unauthorized_access',
      resource: resource || 'unknown',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      severity: 'high',
      category: 'authorization',
      metadata: {
        attemptedAccess: req.path,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Registrar evento de segurança
   */
  async logSecurityEvent(
    req: Request,
    res: Response,
    action: string,
    resource: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: any
  ): Promise<void> {
    await this.logEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action,
      resource,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      severity,
      category: 'security',
      metadata,
    });
  }

  /**
   * Registrar evento do sistema
   */
  async logSystemEvent(
    action: string,
    resource: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: any
  ): Promise<void> {
    await this.logEvent({
      action,
      resource,
      ipAddress: 'system',
      userAgent: 'system',
      method: 'SYSTEM',
      path: '/system',
      statusCode: 200,
      severity,
      category: 'system',
      metadata,
    });
  }

  /**
   * Buscar eventos de auditoria
   */
  async getAuditEvents(filter: AuditFilter): Promise<AuditEvent[]> {
    try {
      // Implementar busca no banco de dados
      // Por enquanto, retornar array vazio
      return [];
    } catch (error) {
      this.logger.error('Erro ao buscar eventos de auditoria:', error);
      return [];
    }
  }

  /**
   * Gerar relatório de auditoria
   */
  async generateAuditReport(startDate: string, endDate: string): Promise<any> {
    try {
      const events = await this.getAuditEvents({
        startDate,
        endDate,
      });

      const report = {
        period: { startDate, endDate },
        totalEvents: events.length,
        eventsByCategory: this.groupEventsByCategory(events),
        eventsBySeverity: this.groupEventsBySeverity(events),
        eventsByAction: this.groupEventsByAction(events),
        topUsers: this.getTopUsers(events),
        securityEvents: events.filter(e => e.category === 'security'),
        criticalEvents: events.filter(e => e.severity === 'critical'),
      };

      return report;
    } catch (error) {
      this.logger.error('Erro ao gerar relatório de auditoria:', error);
      throw error;
    }
  }

  /**
   * Salvar evento de auditoria no banco
   */
  private async saveAuditEvent(event: AuditEvent): Promise<void> {
    try {
      // Implementar salvamento no banco de dados
      // await this.dbAdapter.saveAuditEvent(event);
    } catch (error) {
      this.logger.error('Erro ao salvar evento de auditoria:', error);
    }
  }

  /**
   * Sanitizar request body
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    
    // Remover campos sensíveis
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'cpf'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrupar eventos por categoria
   */
  private groupEventsByCategory(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Agrupar eventos por severidade
   */
  private groupEventsBySeverity(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Agrupar eventos por ação
   */
  private groupEventsByAction(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Obter top usuários
   */
  private getTopUsers(events: AuditEvent[]): Array<{ userId: string; count: number }> {
    const userCounts = events.reduce((acc, event) => {
      if (event.userId) {
        acc[event.userId] = (acc[event.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Habilitar/desabilitar auditoria
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Verificar se auditoria está habilitada
   */
  isAuditEnabled(): boolean {
    return this.isEnabled;
  }
}

/**
 * Middleware de auditoria
 */
export function auditMiddleware(auditLogger: AuditLogger) {
  return (req: Request, res: Response, next: Function) => {
    // Interceptar resposta
    const originalSend = res.send;
    res.send = function(data) {
      // Registrar evento de auditoria
      if (req.user) {
        auditLogger.logDataAccess(req, res, req.user.id, req.path);
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Factory para criar audit logger
 */
export class AuditLoggerFactory {
  private dbAdapter: DatabaseAdapter;

  constructor(dbAdapter: DatabaseAdapter) {
    this.dbAdapter = dbAdapter;
  }

  /**
   * Criar audit logger
   */
  createAuditLogger(enabled: boolean = true): AuditLogger {
    return new AuditLogger(this.dbAdapter, enabled);
  }
}
