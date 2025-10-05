import { Plugin, IAgentRuntime, Memory, State } from '@elizaos/core';

export interface ComplianceCheck {
  regulation: string;
  passed: boolean;
  details: any;
  timestamp: string;
  violations?: string[];
  recommendations?: string[];
}

export interface LGPDCompliance {
  hasLegalBasis: boolean;
  hasConsent: boolean;
  consentIsSpecific: boolean;
  allowsDataAccess: boolean;
  allowsDataCorrection: boolean;
  allowsDataDeletion: boolean;
  isEncrypted: boolean;
  hasAccessControl: boolean;
}

export interface GDPRCompliance {
  hasLawfulBasis: boolean;
  hasExplicitConsent: boolean;
  allowsDataPortability: boolean;
  hasRightToBeForgotten: boolean;
  isPrivacyByDesign: boolean;
  hasDataProtectionOfficer: boolean;
  hasDataBreachNotification: boolean;
}

export class CompliancePlugin implements Plugin {
  name = 'compliancePlugin';
  version = '1.0.0';
  description = 'Plugin para verificação de compliance LGPD, GDPR e regulamentações financeiras';

  async initialize(runtime: IAgentRuntime): Promise<void> {
    console.log('🔒 Compliance Plugin inicializado');
  }

  async checkLGPDCompliance(operation: any): Promise<ComplianceCheck> {
    const checks: LGPDCompliance = {
      // Art. 7º - Base legal
      hasLegalBasis: operation.consent?.explicit === true,
      
      // Art. 9º - Consentimento
      hasConsent: operation.consent?.timestamp !== null,
      consentIsSpecific: operation.consent?.purpose !== "generic",
      
      // Art. 18º - Direitos do titular
      allowsDataAccess: operation.permissions?.includes("read"),
      allowsDataCorrection: operation.permissions?.includes("update"),
      allowsDataDeletion: operation.permissions?.includes("delete"),
      
      // Art. 46 - Segurança
      isEncrypted: operation.data?.encrypted === true,
      hasAccessControl: operation.accessControl !== null
    };

    const passed = Object.values(checks).every(check => check === true);
    const violations = this.getLGPDViolations(checks);

    return {
      regulation: "LGPD",
      passed,
      details: checks,
      timestamp: new Date().toISOString(),
      violations,
      recommendations: this.getLGPDRecommendations(violations)
    };
  }

  async checkGDPRCompliance(operation: any): Promise<ComplianceCheck> {
    const checks: GDPRCompliance = {
      // Art. 6 - Lawful basis
      hasLawfulBasis: operation.lawfulBasis !== null,
      
      // Art. 7 - Consent
      hasExplicitConsent: operation.consent?.explicit === true,
      
      // Art. 20 - Data portability
      allowsDataPortability: operation.permissions?.includes("portability"),
      
      // Art. 17 - Right to be forgotten
      hasRightToBeForgotten: operation.permissions?.includes("forgotten"),
      
      // Art. 25 - Privacy by design
      isPrivacyByDesign: operation.privacyByDesign === true,
      
      // Art. 37 - Data Protection Officer
      hasDataProtectionOfficer: operation.dpo !== null,
      
      // Art. 33 - Data breach notification
      hasDataBreachNotification: operation.breachNotification === true
    };

    const passed = Object.values(checks).every(check => check === true);
    const violations = this.getGDPRViolations(checks);

    return {
      regulation: "GDPR",
      passed,
      details: checks,
      timestamp: new Date().toISOString(),
      violations,
      recommendations: this.getGDPRRecommendations(violations)
    };
  }

  async checkAMLCompliance(operation: any): Promise<ComplianceCheck> {
    const checks = {
      hasCustomerDueDiligence: operation.cdd !== null,
      hasTransactionMonitoring: operation.monitoring === true,
      hasSuspiciousActivityReporting: operation.sar !== null,
      hasRecordKeeping: operation.records !== null,
      hasRiskAssessment: operation.riskAssessment !== null
    };

    const passed = Object.values(checks).every(check => check === true);
    const violations = this.getAMLViolations(checks);

    return {
      regulation: "AML",
      passed,
      details: checks,
      timestamp: new Date().toISOString(),
      violations,
      recommendations: this.getAMLRecommendations(violations)
    };
  }

  async checkKYCCompliance(operation: any): Promise<ComplianceCheck> {
    const checks = {
      hasIdentityVerification: operation.identityVerified === true,
      hasAddressVerification: operation.addressVerified === true,
      hasDocumentVerification: operation.documentVerified === true,
      hasBiometricVerification: operation.biometricVerified === true,
      hasOngoingMonitoring: operation.ongoingMonitoring === true
    };

    const passed = Object.values(checks).every(check => check === true);
    const violations = this.getKYCViolations(checks);

    return {
      regulation: "KYC",
      passed,
      details: checks,
      timestamp: new Date().toISOString(),
      violations,
      recommendations: this.getKYCRecommendations(violations)
    };
  }

  async checkDataRetention(operation: any): Promise<ComplianceCheck> {
    const checks = {
      hasRetentionPolicy: operation.retentionPolicy !== null,
      hasRetentionPeriod: operation.retentionPeriod !== null,
      hasDataMinimization: operation.dataMinimization === true,
      hasPurposeLimitation: operation.purposeLimitation === true,
      hasAutomaticDeletion: operation.automaticDeletion === true
    };

    const passed = Object.values(checks).every(check => check === true);
    const violations = this.getDataRetentionViolations(checks);

    return {
      regulation: "DataRetention",
      passed,
      details: checks,
      timestamp: new Date().toISOString(),
      violations,
      recommendations: this.getDataRetentionRecommendations(violations)
    };
  }

  async checkBaselIIICompliance(operation: any): Promise<ComplianceCheck> {
    const checks = {
      hasCapitalAdequacy: operation.capitalAdequacy >= 8, // 8% minimum
      hasLeverageRatio: operation.leverageRatio <= 3, // 3% maximum
      hasLiquidityCoverage: operation.liquidityCoverage >= 100, // 100% minimum
      hasNetStableFunding: operation.netStableFunding >= 100, // 100% minimum
      hasRiskManagement: operation.riskManagement === true
    };

    const passed = Object.values(checks).every(check => check === true);
    const violations = this.getBaselIIIViolations(checks);

    return {
      regulation: "BaselIII",
      passed,
      details: checks,
      timestamp: new Date().toISOString(),
      violations,
      recommendations: this.getBaselIIIRecommendations(violations)
    };
  }

  async performComprehensiveCheck(operation: any): Promise<ComplianceCheck[]> {
    const checks = await Promise.all([
      this.checkLGPDCompliance(operation),
      this.checkGDPRCompliance(operation),
      this.checkAMLCompliance(operation),
      this.checkKYCCompliance(operation),
      this.checkDataRetention(operation),
      this.checkBaselIIICompliance(operation)
    ]);

    return checks;
  }

  private getLGPDViolations(checks: LGPDCompliance): string[] {
    const violations: string[] = [];
    
    if (!checks.hasLegalBasis) violations.push("Falta base legal para tratamento de dados");
    if (!checks.hasConsent) violations.push("Consentimento não obtido");
    if (!checks.consentIsSpecific) violations.push("Consentimento não específico");
    if (!checks.allowsDataAccess) violations.push("Direito de acesso não garantido");
    if (!checks.allowsDataCorrection) violations.push("Direito de correção não garantido");
    if (!checks.allowsDataDeletion) violations.push("Direito de exclusão não garantido");
    if (!checks.isEncrypted) violations.push("Dados não criptografados");
    if (!checks.hasAccessControl) violations.push("Controle de acesso não implementado");
    
    return violations;
  }

  private getGDPRViolations(checks: GDPRCompliance): string[] {
    const violations: string[] = [];
    
    if (!checks.hasLawfulBasis) violations.push("Falta base legal para processamento");
    if (!checks.hasExplicitConsent) violations.push("Consentimento não explícito");
    if (!checks.allowsDataPortability) violations.push("Portabilidade de dados não garantida");
    if (!checks.hasRightToBeForgotten) violations.push("Direito ao esquecimento não garantido");
    if (!checks.isPrivacyByDesign) violations.push("Privacidade por design não implementada");
    if (!checks.hasDataProtectionOfficer) violations.push("DPO não designado");
    if (!checks.hasDataBreachNotification) violations.push("Notificação de violação não implementada");
    
    return violations;
  }

  private getAMLViolations(checks: any): string[] {
    const violations: string[] = [];
    
    if (!checks.hasCustomerDueDiligence) violations.push("Due diligence do cliente não realizada");
    if (!checks.hasTransactionMonitoring) violations.push("Monitoramento de transações não implementado");
    if (!checks.hasSuspiciousActivityReporting) violations.push("Relatório de atividades suspeitas não implementado");
    if (!checks.hasRecordKeeping) violations.push("Manutenção de registros não implementada");
    if (!checks.hasRiskAssessment) violations.push("Avaliação de risco não realizada");
    
    return violations;
  }

  private getKYCViolations(checks: any): string[] {
    const violations: string[] = [];
    
    if (!checks.hasIdentityVerification) violations.push("Verificação de identidade não realizada");
    if (!checks.hasAddressVerification) violations.push("Verificação de endereço não realizada");
    if (!checks.hasDocumentVerification) violations.push("Verificação de documentos não realizada");
    if (!checks.hasBiometricVerification) violations.push("Verificação biométrica não realizada");
    if (!checks.hasOngoingMonitoring) violations.push("Monitoramento contínuo não implementado");
    
    return violations;
  }

  private getDataRetentionViolations(checks: any): string[] {
    const violations: string[] = [];
    
    if (!checks.hasRetentionPolicy) violations.push("Política de retenção não definida");
    if (!checks.hasRetentionPeriod) violations.push("Período de retenção não definido");
    if (!checks.hasDataMinimization) violations.push("Minimização de dados não implementada");
    if (!checks.hasPurposeLimitation) violations.push("Limitação de propósito não implementada");
    if (!checks.hasAutomaticDeletion) violations.push("Exclusão automática não implementada");
    
    return violations;
  }

  private getBaselIIIViolations(checks: any): string[] {
    const violations: string[] = [];
    
    if (!checks.hasCapitalAdequacy) violations.push("Adequação de capital insuficiente");
    if (!checks.hasLeverageRatio) violations.push("Relação de alavancagem excessiva");
    if (!checks.hasLiquidityCoverage) violations.push("Cobertura de liquidez insuficiente");
    if (!checks.hasNetStableFunding) violations.push("Financiamento estável líquido insuficiente");
    if (!checks.hasRiskManagement) violations.push("Gestão de risco não implementada");
    
    return violations;
  }

  private getLGPDRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.includes("Falta base legal para tratamento de dados")) {
      recommendations.push("Implementar sistema de consentimento explícito");
    }
    if (violations.includes("Dados não criptografados")) {
      recommendations.push("Implementar criptografia AES-256 para dados sensíveis");
    }
    if (violations.includes("Controle de acesso não implementado")) {
      recommendations.push("Implementar controle de acesso baseado em roles (RBAC)");
    }
    
    return recommendations;
  }

  private getGDPRRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.includes("Privacidade por design não implementada")) {
      recommendations.push("Implementar privacy by design em todos os sistemas");
    }
    if (violations.includes("DPO não designado")) {
      recommendations.push("Designar Data Protection Officer");
    }
    
    return recommendations;
  }

  private getAMLRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.includes("Due diligence do cliente não realizada")) {
      recommendations.push("Implementar processo de due diligence automatizado");
    }
    if (violations.includes("Monitoramento de transações não implementado")) {
      recommendations.push("Implementar sistema de monitoramento em tempo real");
    }
    
    return recommendations;
  }

  private getKYCRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.includes("Verificação de identidade não realizada")) {
      recommendations.push("Implementar verificação de identidade com documentos");
    }
    if (violations.includes("Verificação biométrica não realizada")) {
      recommendations.push("Implementar verificação biométrica para maior segurança");
    }
    
    return recommendations;
  }

  private getDataRetentionRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.includes("Política de retenção não definida")) {
      recommendations.push("Definir política de retenção baseada no tipo de dados");
    }
    if (violations.includes("Exclusão automática não implementada")) {
      recommendations.push("Implementar exclusão automática após período de retenção");
    }
    
    return recommendations;
  }

  private getBaselIIIRecommendations(violations: string[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.includes("Adequação de capital insuficiente")) {
      recommendations.push("Aumentar capital para atender requisitos mínimos");
    }
    if (violations.includes("Gestão de risco não implementada")) {
      recommendations.push("Implementar sistema de gestão de risco integrado");
    }
    
    return recommendations;
  }
}

export const compliancePlugin = new CompliancePlugin();
