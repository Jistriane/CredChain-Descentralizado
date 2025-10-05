import { ComplianceCheck, ComplianceViolation, ComplianceRecommendation } from '../types';

export interface GDPRDataSubject {
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

export interface GDPRDataProcessing {
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

export interface GDPRConsent {
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

export interface GDPRAuditLog {
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

export class GDPREngine {
  private dataSubjects: Map<string, GDPRDataSubject> = new Map();
  private dataProcessings: Map<string, GDPRDataProcessing> = new Map();
  private consents: Map<string, GDPRConsent> = new Map();
  private auditLogs: GDPRAuditLog[] = [];

  async checkDataProcessingCompliance(processing: GDPRDataProcessing): Promise<ComplianceCheck> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Art. 5 - Principles
    const principlesCheck = await this.checkPrinciples(processing);
    violations.push(...principlesCheck.violations);
    recommendations.push(...principlesCheck.recommendations);

    // Art. 6 - Lawful basis
    const legalBasisCheck = await this.checkLegalBasis(processing);
    violations.push(...legalBasisCheck.violations);
    recommendations.push(...legalBasisCheck.recommendations);

    // Art. 7 - Consent
    const consentCheck = await this.checkConsent(processing);
    violations.push(...consentCheck.violations);
    recommendations.push(...consentCheck.recommendations);

    // Art. 17 - Right to be forgotten
    const rightToBeForgottenCheck = await this.checkRightToBeForgotten(processing);
    violations.push(...rightToBeForgottenCheck.violations);
    recommendations.push(...rightToBeForgottenCheck.recommendations);

    // Art. 20 - Data portability
    const dataPortabilityCheck = await this.checkDataPortability(processing);
    violations.push(...dataPortabilityCheck.violations);
    recommendations.push(...dataPortabilityCheck.recommendations);

    // Art. 25 - Privacy by design
    const privacyByDesignCheck = await this.checkPrivacyByDesign(processing);
    violations.push(...privacyByDesignCheck.violations);
    recommendations.push(...privacyByDesignCheck.recommendations);

    // Art. 32 - Security
    const securityCheck = await this.checkSecurityMeasures(processing);
    violations.push(...securityCheck.violations);
    recommendations.push(...securityCheck.recommendations);

    // Art. 44-49 - International transfers
    const transferCheck = await this.checkInternationalTransfer(processing);
    violations.push(...transferCheck.violations);
    recommendations.push(...transferCheck.recommendations);

    const passed = violations.length === 0;

    return {
      regulation: 'GDPR',
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
        article: 'Art. 15',
        violation: 'Data subject not found',
        severity: 'high',
        description: 'The data subject was not found in the system'
      });
    } else {
      // Check if rights are implemented
      const rightsCheck = await this.checkImplementedRights(dataSubject);
      violations.push(...rightsCheck.violations);
      recommendations.push(...rightsCheck.recommendations);
    }

    const passed = violations.length === 0;

    return {
      regulation: 'GDPR',
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

  async registerDataSubject(dataSubject: Omit<GDPRDataSubject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newDataSubject: GDPRDataSubject = {
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

  async registerDataProcessing(processing: Omit<GDPRDataProcessing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newProcessing: GDPRDataProcessing = {
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

  async registerConsent(consent: Omit<GDPRConsent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const newConsent: GDPRConsent = {
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
      throw new Error('Consent not found');
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

  async getDataSubject(dataSubjectId: string): Promise<GDPRDataSubject | null> {
    return this.dataSubjects.get(dataSubjectId) || null;
  }

  async getDataProcessing(processingId: string): Promise<GDPRDataProcessing | null> {
    return this.dataProcessings.get(processingId) || null;
  }

  async getConsent(consentId: string): Promise<GDPRConsent | null> {
    return this.consents.get(consentId) || null;
  }

  async getDataSubjectConsents(dataSubjectId: string): Promise<GDPRConsent[]> {
    return Array.from(this.consents.values()).filter(c => c.dataSubjectId === dataSubjectId);
  }

  async getAuditLogs(dataSubjectId?: string, fromDate?: Date, toDate?: Date): Promise<GDPRAuditLog[]> {
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
      throw new Error('Data subject not found');
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
      throw new Error('Data subject not found');
    }

    // Check for active processings
    const activeProcessings = Array.from(this.dataProcessings.values())
      .filter(p => p.dataSubjects.includes(dataSubjectId));

    if (activeProcessings.length > 0) {
      throw new Error('Cannot delete data subject with active processings');
    }

    // Remove data
    this.dataSubjects.delete(dataSubjectId);
    
    // Remove consents
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

  private async checkPrinciples(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Lawfulness, fairness and transparency
    if (!processing.purpose || processing.purpose.trim() === '') {
      violations.push({
        article: 'Art. 5(1)(a)',
        violation: 'Purpose not specified',
        severity: 'high',
        description: 'The purpose of processing must be specified'
      });
    }

    // Purpose limitation
    if (processing.dataCategories.length === 0) {
      violations.push({
        article: 'Art. 5(1)(b)',
        violation: 'Data categories not specified',
        severity: 'high',
        description: 'Data categories must be specified'
      });
    }

    // Data minimisation
    if (processing.dataSubjects.length === 0) {
      violations.push({
        article: 'Art. 5(1)(c)',
        violation: 'Data subjects not specified',
        severity: 'high',
        description: 'Data subjects must be specified'
      });
    }

    // Accuracy
    if (!processing.dpoContact) {
      violations.push({
        article: 'Art. 5(1)(d)',
        violation: 'DPO contact not specified',
        severity: 'medium',
        description: 'DPO contact must be specified'
      });
    }

    return { violations, recommendations };
  }

  private async checkLegalBasis(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    const validBasis = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests'];
    
    if (!validBasis.includes(processing.legalBasis)) {
      violations.push({
        article: 'Art. 6',
        violation: 'Invalid legal basis',
        severity: 'high',
        description: 'Legal basis must be one of those specified in Art. 6 GDPR'
      });
    }

    if (processing.legalBasis === 'consent') {
      const consents = Array.from(this.consents.values())
        .filter(c => c.dataSubjectId === processing.dataSubjects[0]);
      
      if (consents.length === 0) {
        violations.push({
          article: 'Art. 6(1)(a)',
          violation: 'Consent required',
          severity: 'high',
          description: 'For consent-based processing, explicit consent is required'
        });
      }
    }

    return { violations, recommendations };
  }

  private async checkConsent(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    if (processing.legalBasis === 'consent') {
      const consents = Array.from(this.consents.values())
        .filter(c => c.dataSubjectId === processing.dataSubjects[0]);

      if (consents.length === 0) {
        violations.push({
          article: 'Art. 7',
          violation: 'Consent required',
          severity: 'high',
          description: 'Explicit consent is required for consent-based processing'
        });
      } else {
        const validConsent = consents.find(c => 
          c.consentGiven && 
          !c.consentWithdrawal && 
          c.purpose === processing.purpose
        );

        if (!validConsent) {
          violations.push({
            article: 'Art. 7',
            violation: 'Invalid or withdrawn consent',
            severity: 'high',
            description: 'Consent must be valid and not withdrawn'
          });
        }
      }
    }

    return { violations, recommendations };
  }

  private async checkRightToBeForgotten(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Check if right to be forgotten is implemented
    if (!processing.securityMeasures.includes('right_to_be_forgotten')) {
      recommendations.push({
        article: 'Art. 17',
        recommendation: 'Implement right to be forgotten',
        priority: 'high',
        description: 'The right to be forgotten must be implemented'
      });
    }

    return { violations, recommendations };
  }

  private async checkDataPortability(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Check if data portability is implemented
    if (!processing.securityMeasures.includes('data_portability')) {
      recommendations.push({
        article: 'Art. 20',
        recommendation: 'Implement data portability',
        priority: 'high',
        description: 'Data portability must be implemented'
      });
    }

    return { violations, recommendations };
  }

  private async checkPrivacyByDesign(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Check if privacy by design is implemented
    if (!processing.securityMeasures.includes('privacy_by_design')) {
      violations.push({
        article: 'Art. 25',
        violation: 'Privacy by design not implemented',
        severity: 'high',
        description: 'Privacy by design must be implemented'
      });
    }

    return { violations, recommendations };
  }

  private async checkSecurityMeasures(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    const requiredMeasures = ['encryption', 'access_control', 'audit_logging', 'backup', 'anonymization'];
    
    requiredMeasures.forEach(measure => {
      if (!processing.securityMeasures.includes(measure)) {
        violations.push({
          article: 'Art. 32',
          violation: `Missing security measure: ${measure}`,
          severity: 'high',
          description: `Security measure ${measure} must be implemented`
        });
      }
    });

    return { violations, recommendations };
  }

  private async checkInternationalTransfer(processing: GDPRDataProcessing): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    if (processing.crossBorderTransfer) {
      if (processing.transferCountries.length === 0) {
        violations.push({
          article: 'Art. 44-49',
          violation: 'Transfer countries not specified',
          severity: 'high',
          description: 'Transfer countries must be specified'
        });
      }

      // Check if countries have adequate protection
      const adequateCountries = ['EU', 'UK', 'Switzerland', 'Canada', 'New Zealand'];
      const inadequateCountries = processing.transferCountries.filter(country => 
        !adequateCountries.includes(country)
      );

      if (inadequateCountries.length > 0) {
        violations.push({
          article: 'Art. 44-49',
          violation: 'Transfer to inadequate countries',
          severity: 'high',
          description: 'Transfer to countries without adequate protection requires additional measures'
        });
      }
    }

    return { violations, recommendations };
  }

  private async checkImplementedRights(dataSubject: GDPRDataSubject): Promise<{ violations: ComplianceViolation[], recommendations: ComplianceRecommendation[] }> {
    const violations: ComplianceViolation[] = [];
    const recommendations: ComplianceRecommendation[] = [];

    // Check if rights are implemented
    const rights = ['access', 'rectification', 'erasure', 'portability', 'objection'];
    
    rights.forEach(right => {
      recommendations.push({
        article: 'Art. 15-22',
        recommendation: `Implement ${right} right`,
        priority: 'high',
        description: `The ${right} right must be implemented for the data subject`
      });
    });

    return { violations, recommendations };
  }

  private async logAuditEvent(event: Omit<GDPRAuditLog, 'id'>): Promise<void> {
    const id = this.generateId();
    const auditLog: GDPRAuditLog = {
      ...event,
      id
    };

    this.auditLogs.push(auditLog);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const gdprEngine = new GDPREngine();
