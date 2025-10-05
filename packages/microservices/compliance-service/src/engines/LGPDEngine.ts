import { ComplianceCheck, ComplianceViolation, ComplianceRecommendation } from '../types';

export interface LGPDDataSubject {
  id: string;
  name: string;
  email: string;
  document: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  nationality?: string;
  consentGiven: boolean;
  consentDate?: Date;
  consentPurpose: string[];
  dataRetentionPeriod?: number;
  dataCategories: string[];
  processingBasis: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LGPDDataProcessing {
  id: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  thirdPartySharing: boolean;
  thirdParties: string[];
  crossBorderTransfer: boolean;
  transferCountries: string[];
  dpoContact: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LGPDConsent {
  id: string;
  dataSubjectId: string;
  purpose: string;
  dataCategories: string[];
  consentGiven: boolean;
  consentDate: Date;
  consentMethod: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  consentWithdrawal: boolean;
  withdrawalDate?: Date;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LGPDAuditLog {
  id: string;
  dataSubjectId: string;
  action: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  actor: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'blocked';
  details: any;
}

export class LGPDEngine {
  private dataSubjects: Map<string, LGPDDataSubject> = new Map();
  private dataProcessings: Map<string, LGPDDataProcessing> = new Map();
  private consents: Map<string, LGPDConsent> = new Map();
  private auditLogs: LGPDAuditLog[] = [];

  async checkDataProcessingCompliance(processing: LGPDDataProcessing): Promise<ComplianceCheck> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Art. 6º - Princípios
    const principlesCheck = await this.checkPrinciples(processing);
    violations.push(...principlesCheck.violations);
    recommendations.push(...principlesCheck.recommendations);

    // Art. 7º - Bases legais
    const legalBasisCheck = await this.checkLegalBasis(processing);
    violations.push(...legalBasisCheck.violations);
    recommendations.push(...legalBasisCheck.recommendations);

    // Art. 9º - Consentimento
    const consentCheck = await this.checkConsent(processing);
    violations.push(...consentCheck.violations);
    recommendations.push(...consentCheck.recommendations);

    // Art. 18º - Direitos do titular
    const rightsCheck = await this.checkDataSubjectRights(processing);
    violations.push(...rightsCheck.violations);
    recommendations.push(...rightsCheck.recommendations);

    // Art. 46 - Segurança
    const securityCheck = await this.checkSecurityMeasures(processing);
    violations.push(...securityCheck.violations);
    recommendations.push(...securityCheck.recommendations);

    // Art. 48 - Transferência internacional
    const transferCheck = await this.checkInternationalTransfer(processing);
    violations.push(...transferCheck.violations);
    recommendations.push(...transferCheck.recommendations);

    const passed = violations.length === 0;

    return {
      regulation: 'LGPD',
      passed,
      violations,
      recommendations,
      timestamp: new Date().toISOString(),
      details: {
        processing,
        violationCount: violations.length,
        recommendationCount: recommendations.length
      }
    };
  }

  async checkDataSubjectRights(dataSubjectId: string): Promise<ComplianceCheck> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) {
      violations.push({
        article: 'Art. 18º',
        violation: 'Titular não encontrado',
        severity: 'high',
        description: 'O titular dos dados não foi encontrado no sistema'
      });
    } else {
      // Verificar se os direitos estão implementados
      const rightsCheck = await this.checkImplementedRights(dataSubject);
      violations.push(...rightsCheck.violations);
      recommendations.push(...rightsCheck.recommendations);
    }

    const passed = violations.length === 0;

    return {
      regulation: 'LGPD',
      passed,
      violations,
      recommendations,
      timestamp: new Date().toISOString(),
      details: {
        dataSubjectId,
        violationCount: violations.length,
        recommendationCount: recommendations.length
      }
    };
  }

  async registerDataSubject(dataSubject: Omit<LGPDDataSubject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newDataSubject: LGPDDataSubject = {
      ...dataSubject,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.dataSubjects.set(id, newDataSubject);
    
    await this.logAuditEvent({
      dataSubjectId: id,
      action: 'register_data_subject',
      purpose: 'data_registration',
      legalBasis: 'consent',
      dataCategories: dataSubject.dataCategories,
      actor: 'system',
      timestamp: now,
      ipAddress: 'system',
      userAgent: 'system',
      result: 'success',
      details: { dataSubject: newDataSubject }
    });

    return id;
  }

  async registerDataProcessing(processing: Omit<LGPDDataProcessing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newProcessing: LGPDDataProcessing = {
      ...processing,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.dataProcessings.set(id, newProcessing);
    
    await this.logAuditEvent({
      dataSubjectId: processing.dataSubjects[0] || 'system',
      action: 'register_data_processing',
      purpose: processing.purpose,
      legalBasis: processing.legalBasis,
      dataCategories: processing.dataCategories,
      actor: 'system',
      timestamp: now,
      ipAddress: 'system',
      userAgent: 'system',
      result: 'success',
      details: { processing: newProcessing }
    });

    return id;
  }

  async registerConsent(consent: Omit<LGPDConsent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newConsent: LGPDConsent = {
      ...consent,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.consents.set(id, newConsent);
    
    await this.logAuditEvent({
      dataSubjectId: consent.dataSubjectId,
      action: 'register_consent',
      purpose: consent.purpose,
      legalBasis: 'consent',
      dataCategories: consent.dataCategories,
      actor: 'data_subject',
      timestamp: now,
      ipAddress: consent.ipAddress,
      userAgent: consent.userAgent,
      result: 'success',
      details: { consent: newConsent }
    });

    return id;
  }

  async withdrawConsent(consentId: string, dataSubjectId: string): Promise<void> {
    const consent = this.consents.get(consentId);
    if (!consent) {
      throw new Error('Consentimento não encontrado');
    }

    consent.consentWithdrawal = true;
    consent.withdrawalDate = new Date();
    consent.updatedAt = new Date();

    this.consents.set(consentId, consent);
    
    await this.logAuditEvent({
      dataSubjectId,
      action: 'withdraw_consent',
      purpose: consent.purpose,
      legalBasis: 'consent',
      dataCategories: consent.dataCategories,
      actor: 'data_subject',
      timestamp: new Date(),
      ipAddress: 'system',
      userAgent: 'system',
      result: 'success',
      details: { consentId, withdrawalDate: consent.withdrawalDate }
    });
  }

  async getDataSubject(dataSubjectId: string): Promise<LGPDDataSubject | null> {
    return this.dataSubjects.get(dataSubjectId) || null;
  }

  async getDataProcessing(processingId: string): Promise<LGPDDataProcessing | null> {
    return this.dataProcessings.get(processingId) || null;
  }

  async getConsent(consentId: string): Promise<LGPDConsent | null> {
    return this.consents.get(consentId) || null;
  }

  async getDataSubjectConsents(dataSubjectId: string): Promise<LGPDConsent[]> {
    return Array.from(this.consents.values()).filter(c => c.dataSubjectId === dataSubjectId);
  }

  async getAuditLogs(dataSubjectId?: string, fromDate?: Date, toDate?: Date): Promise<LGPDAuditLog[]> {
    let logs = this.auditLogs;

    if (dataSubjectId) {
      logs = logs.filter(log => log.dataSubjectId === dataSubjectId);
    }

    if (fromDate) {
      logs = logs.filter(log => log.timestamp >= fromDate);
    }

    if (toDate) {
      logs = logs.filter(log => log.timestamp <= toDate);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async generateDataPortabilityReport(dataSubjectId: string): Promise<any> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) {
      throw new Error('Titular não encontrado');
    }

    const consents = await this.getDataSubjectConsents(dataSubjectId);
    const auditLogs = await this.getAuditLogs(dataSubjectId);

    return {
      dataSubject: {
        id: dataSubject.id,
        name: dataSubject.name,
        email: dataSubject.email,
        document: dataSubject.document,
        createdAt: dataSubject.createdAt
      },
      consents: consents.map(consent => ({
        id: consent.id,
        purpose: consent.purpose,
        dataCategories: consent.dataCategories,
        consentGiven: consent.consentGiven,
        consentDate: consent.consentDate,
        consentMethod: consent.consentMethod,
        consentWithdrawal: consent.consentWithdrawal,
        withdrawalDate: consent.withdrawalDate
      })),
      auditLogs: auditLogs.map(log => ({
        action: log.action,
        purpose: log.purpose,
        legalBasis: log.legalBasis,
        dataCategories: log.dataCategories,
        actor: log.actor,
        timestamp: log.timestamp,
        result: log.result
      })),
      generatedAt: new Date().toISOString(),
      format: 'JSON',
      version: '1.0'
    };
  }

  async deleteDataSubject(dataSubjectId: string): Promise<void> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) {
      throw new Error('Titular não encontrado');
    }

    // Verificar se há processamentos ativos
    const activeProcessings = Array.from(this.dataProcessings.values())
      .filter(p => p.dataSubjects.includes(dataSubjectId));

    if (activeProcessings.length > 0) {
      throw new Error('Não é possível excluir titular com processamentos ativos');
    }

    // Remover dados
    this.dataSubjects.delete(dataSubjectId);
    
    // Remover consentimentos
    const consents = await this.getDataSubjectConsents(dataSubjectId);
    consents.forEach(consent => {
      this.consents.delete(consent.id);
    });

    await this.logAuditEvent({
      dataSubjectId,
      action: 'delete_data_subject',
      purpose: 'data_deletion',
      legalBasis: 'consent',
      dataCategories: dataSubject.dataCategories,
      actor: 'data_subject',
      timestamp: new Date(),
      ipAddress: 'system',
      userAgent: 'system',
      result: 'success',
      details: { dataSubjectId }
    });
  }

  private async checkPrinciples(processing: LGPDDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Finalidade
    if (!processing.purpose || processing.purpose.trim() === '') {
      violations.push({
        article: 'Art. 6º, I',
        violation: 'Falta especificação da finalidade',
        severity: 'high',
        description: 'A finalidade do tratamento deve ser especificada'
      });
    }

    // Adequação
    if (processing.dataCategories.length === 0) {
      violations.push({
        article: 'Art. 6º, II',
        violation: 'Falta especificação das categorias de dados',
        severity: 'high',
        description: 'As categorias de dados devem ser especificadas'
      });
    }

    // Necessidade
    if (processing.dataSubjects.length === 0) {
      violations.push({
        article: 'Art. 6º, III',
        violation: 'Falta especificação dos titulares',
        severity: 'high',
        description: 'Os titulares dos dados devem ser especificados'
      });
    }

    // Transparência
    if (!processing.dpoContact) {
      violations.push({
        article: 'Art. 6º, IV',
        violation: 'Falta contato do DPO',
        severity: 'medium',
        description: 'O contato do DPO deve ser especificado'
      });
    }

    return { violations, recommendations };
  }

  private async checkLegalBasis(processing: LGPDDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    const validBasis = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests'];
    
    if (!validBasis.includes(processing.legalBasis)) {
      violations.push({
        article: 'Art. 7º',
        violation: 'Base legal inválida',
        severity: 'high',
        description: 'A base legal deve ser uma das previstas no Art. 7º da LGPD'
      });
    }

    if (processing.legalBasis === 'consent') {
      const consents = Array.from(this.consents.values())
        .filter(c => c.dataSubjectId === processing.dataSubjects[0]);
      
      if (consents.length === 0) {
        violations.push({
          article: 'Art. 7º, I',
          violation: 'Falta consentimento',
          severity: 'high',
          description: 'Para base legal em consentimento, é necessário obter o consentimento do titular'
        });
      }
    }

    return { violations, recommendations };
  }

  private async checkConsent(processing: LGPDDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    if (processing.legalBasis === 'consent') {
      const consents = Array.from(this.consents.values())
        .filter(c => c.dataSubjectId === processing.dataSubjects[0]);

      if (consents.length === 0) {
        violations.push({
          article: 'Art. 9º',
          violation: 'Falta consentimento',
          severity: 'high',
          description: 'É necessário obter o consentimento do titular'
        });
      } else {
        const validConsent = consents.find(c => 
          c.consentGiven && 
          !c.consentWithdrawal && 
          c.purpose === processing.purpose
        );

        if (!validConsent) {
          violations.push({
            article: 'Art. 9º',
            violation: 'Consentimento inválido ou retirado',
            severity: 'high',
            description: 'O consentimento deve ser válido e não retirado'
          });
        }
      }
    }

    return { violations, recommendations };
  }

  private async checkDataSubjectRights(processing: LGPDDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Verificar se os direitos estão implementados
    const rights = ['access', 'correction', 'deletion', 'portability', 'information'];
    
    rights.forEach(right => {
      if (!processing.securityMeasures.includes(`right_${right}`)) {
        recommendations.push({
          article: 'Art. 18º',
          recommendation: `Implementar direito de ${right}`,
          priority: 'high',
          description: `O direito de ${right} deve ser implementado`
        });
      }
    });

    return { violations, recommendations };
  }

  private async checkSecurityMeasures(processing: LGPDDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    const requiredMeasures = ['encryption', 'access_control', 'audit_logging', 'backup', 'anonymization'];
    
    requiredMeasures.forEach(measure => {
      if (!processing.securityMeasures.includes(measure)) {
        violations.push({
          article: 'Art. 46',
          violation: `Falta medida de segurança: ${measure}`,
          severity: 'high',
          description: `A medida de segurança ${measure} deve ser implementada`
        });
      }
    });

    return { violations, recommendations };
  }

  private async checkInternationalTransfer(processing: LGPDDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    if (processing.crossBorderTransfer) {
      if (processing.transferCountries.length === 0) {
        violations.push({
          article: 'Art. 48',
          violation: 'Falta especificação dos países de transferência',
          severity: 'high',
          description: 'Os países de transferência devem ser especificados'
        });
      }

      // Verificar se os países têm adequação de proteção
      const adequateCountries = ['EU', 'UK', 'Switzerland', 'Canada', 'New Zealand'];
      const inadequateCountries = processing.transferCountries.filter(country => 
        !adequateCountries.includes(country)
      );

      if (inadequateCountries.length > 0) {
        violations.push({
          article: 'Art. 48',
          violation: 'Transferência para países sem adequação',
          severity: 'high',
          description: 'A transferência para países sem adequação requer medidas adicionais'
        });
      }
    }

    return { violations, recommendations };
  }

  private async checkImplementedRights(dataSubject: LGPDDataSubject): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Verificar se os direitos estão implementados
    const rights = ['access', 'correction', 'deletion', 'portability', 'information'];
    
    rights.forEach(right => {
      recommendations.push({
        article: 'Art. 18º',
        recommendation: `Implementar direito de ${right}`,
        priority: 'high',
        description: `O direito de ${right} deve ser implementado para o titular`
      });
    });

    return { violations, recommendations };
  }

  private async logAuditEvent(event: Omit<LGPDAuditLog, 'id'>): Promise<void> {
    const id = this.generateId();
    const auditLog: LGPDAuditLog = {
      ...event,
      id
    };

    this.auditLogs.push(auditLog);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const lgpdEngine = new LGPDEngine();
