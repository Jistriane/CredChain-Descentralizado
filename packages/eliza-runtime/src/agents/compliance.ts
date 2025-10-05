/**
 * Compliance Agent - Agente de Compliance (Regulatory Guardian)
 * 
 * Implementa verificações de conformidade com LGPD, GDPR e Basel III
 */

import { Character, Action, ModelProviderName } from "@elizaos/core";

/**
 * Agente de Compliance (Regulatory Guardian)
 */
export const complianceAgent: Character = {
  name: "Compliance Guardian",
  username: "compliance_ai",
  modelProvider: ModelProviderName.ANTHROPIC,
  
  bio: [
    "Garanto que todas as operações estejam em conformidade com LGPD, GDPR e regulações financeiras",
    "Monitoro 24/7 para detectar qualquer violação de privacidade ou uso indevido de dados",
    "Sou o guardião da confiança no CredChain"
  ],
  
  knowledge: [
    // LGPD (Brasil)
    "Art. 6º - Princípios: finalidade, adequação, necessidade, transparência",
    "Art. 7º - Bases legais para tratamento de dados",
    "Art. 18º - Direitos do titular (acesso, correção, exclusão)",
    "Art. 46 - Segurança e sigilo dos dados",
    "Art. 48 - Relatório de impacto à proteção de dados",
    
    // GDPR (Europa)
    "Right to be forgotten (Art. 17)",
    "Data portability (Art. 20)",
    "Privacy by design (Art. 25)",
    "Data Protection Impact Assessment (Art. 35)",
    "Consent management (Art. 6 e 7)",
    
    // Regulações Financeiras
    "Basel III - Capital requirements",
    "PSD2 - Payment Services Directive",
    "Open Banking regulations",
    "AML/CFT - Anti-Money Laundering",
    "KYC - Know Your Customer"
  ],
  
  style: {
    all: [
      "Seja rigoroso e preciso nas verificações",
      "Explique claramente os requisitos de compliance",
      "Use linguagem técnica quando necessário",
      "Mantenha tom profissional e autoritativo"
    ]
  },
  
  adjectives: ["rigoroso", "preciso", "confiável", "vigilante", "transparente"]
};

/**
 * Ação de Verificação de Compliance
 * Implementa o COMPLIANCE_CHECK conforme especificado na documentação
 */
export const complianceCheckAction: Action = {
  name: "COMPLIANCE_CHECK",
  similes: ["verificar compliance", "checar conformidade", "validar regulamentação", "auditar compliance"],
  description: "Verifica conformidade regulatória de operações",
  
  validate: async (runtime: any, message: any) => {
    // Sempre válido para verificações de compliance
    return true;
  },
  
  handler: async (runtime: any, message: any, state: any, options: any, callback: any) => {
    try {
      const operation = message.content.operation || message.content;
      
      // Checklist de compliance
      const checks = {
        lgpd: await checkLGPDCompliance(operation, runtime),
        gdpr: await checkGDPRCompliance(operation, runtime),
        aml: await checkAMLCompliance(operation, runtime), // Anti-Money Laundering
        kyc: await checkKYCCompliance(operation, runtime), // Know Your Customer
        dataRetention: await checkDataRetention(operation, runtime)
      };
      
      const isCompliant = Object.values(checks).every(check => check.passed);
      
      if (!isCompliant) {
        // Bloquear operação e notificar
        await blockOperation(operation.id, runtime);
        await notifyComplianceTeam(checks, runtime);
        
        callback({
          text: "⚠️ **Operação bloqueada por não conformidade regulatória**\n\n" +
                generateComplianceReport(checks),
          metadata: { 
            checks, 
            blocked: true,
            complianceScore: calculateComplianceScore(checks)
          }
        });
      } else {
        callback({
          text: "✅ **Operação aprovada - Todos os requisitos de compliance atendidos**\n\n" +
                generateComplianceReport(checks),
          metadata: { 
            checks, 
            approved: true,
            complianceScore: calculateComplianceScore(checks)
          }
        });
      }
      
      return isCompliant;
    } catch (error) {
      console.error('Erro na verificação de compliance:', error);
      callback({
        text: "❌ Erro na verificação de compliance. Operação bloqueada por segurança.",
        metadata: { error: true, blocked: true }
      });
      return false;
    }
  },
  
  examples: [
    [
      { 
        user: "{{user1}}", 
        content: { text: "Verificar compliance da operação de score" } 
      },
      { 
        user: "{{agent}}", 
        content: { 
          text: "✅ **Verificação de Compliance Completa**\n\n" +
                "🔒 **LGPD**: Conforme - Consentimento explícito obtido\n" +
                "🌍 **GDPR**: Conforme - Base legal adequada\n" +
                "🏦 **AML**: Conforme - Sem indicadores de lavagem\n" +
                "👤 **KYC**: Conforme - Identidade verificada\n" +
                "📊 **Data Retention**: Conforme - Política aplicada\n\n" +
                "🎯 **Score de Compliance**: 100%\n" +
                "✅ **Operação aprovada para execução**" 
        } 
      }
    ]
  ]
};

/**
 * Verificação LGPD (Lei Geral de Proteção de Dados - Brasil)
 */
async function checkLGPDCompliance(operation: any, runtime: any): Promise<ComplianceCheck> {
  const checks = {
    // Art. 7º - Base legal
    hasLegalBasis: operation.consent?.explicit === true,
    
    // Art. 9º - Consentimento
    hasConsent: operation.consent?.timestamp !== null,
    consentIsSpecific: operation.consent?.purpose !== "generic",
    consentIsInformed: operation.consent?.information_provided === true,
    
    // Art. 18º - Direitos do titular
    allowsDataAccess: operation.permissions?.includes("read"),
    allowsDataCorrection: operation.permissions?.includes("update"),
    allowsDataDeletion: operation.permissions?.includes("delete"),
    allowsDataPortability: operation.permissions?.includes("export"),
    
    // Art. 46 - Segurança
    isEncrypted: operation.data?.encrypted === true,
    hasAccessControl: operation.accessControl !== null,
    hasAuditLog: operation.auditLog === true,
    
    // Art. 48 - Relatório de impacto
    hasImpactAssessment: operation.impactAssessment !== null,
    
    // Princípios fundamentais
    hasPurpose: operation.purpose !== null,
    isAdequate: operation.adequacy === true,
    isNecessary: operation.necessity === true,
    isTransparent: operation.transparency === true
  };
  
  const passed = Object.values(checks).every(check => check === true);
  
  return {
    regulation: "LGPD",
    passed,
    details: checks,
    timestamp: new Date().toISOString(),
    score: calculateRegulationScore(checks)
  };
}

/**
 * Verificação GDPR (General Data Protection Regulation - Europa)
 */
async function checkGDPRCompliance(operation: any, runtime: any): Promise<ComplianceCheck> {
  const checks = {
    // Art. 6 - Lawfulness of processing
    hasLegalBasis: operation.legalBasis !== null,
    consentIsValid: operation.consent?.valid === true,
    
    // Art. 17 - Right to erasure
    supportsRightToBeForgotten: operation.rights?.erasure === true,
    
    // Art. 20 - Right to data portability
    supportsDataPortability: operation.rights?.portability === true,
    
    // Art. 25 - Data protection by design
    privacyByDesign: operation.privacyByDesign === true,
    
    // Art. 35 - Data Protection Impact Assessment
    hasDPIA: operation.dpia !== null,
    
    // Art. 32 - Security of processing
    hasTechnicalMeasures: operation.security?.technical === true,
    hasOrganizationalMeasures: operation.security?.organizational === true,
    
    // Art. 33 - Breach notification
    hasBreachNotification: operation.breachNotification === true,
    
    // Art. 30 - Records of processing
    hasProcessingRecords: operation.processingRecords === true
  };
  
  const passed = Object.values(checks).every(check => check === true);
  
  return {
    regulation: "GDPR",
    passed,
    details: checks,
    timestamp: new Date().toISOString(),
    score: calculateRegulationScore(checks)
  };
}

/**
 * Verificação AML (Anti-Money Laundering)
 */
async function checkAMLCompliance(operation: any, runtime: any): Promise<ComplianceCheck> {
  const checks = {
    // Customer Due Diligence
    hasCustomerIdentification: operation.customer?.identified === true,
    hasRiskAssessment: operation.riskAssessment !== null,
    
    // Transaction Monitoring
    isTransactionMonitored: operation.monitoring === true,
    hasSuspiciousActivityCheck: operation.suspiciousActivityCheck === true,
    
    // Record Keeping
    hasTransactionRecords: operation.records?.transactions === true,
    hasCustomerRecords: operation.records?.customer === true,
    
    // Reporting
    hasSuspiciousTransactionReporting: operation.reporting?.suspicious === true,
    hasThresholdReporting: operation.reporting?.threshold === true,
    
    // Sanctions Screening
    hasSanctionsScreening: operation.sanctionsScreening === true,
    hasPEPsScreening: operation.pepsScreening === true,
    
    // Training
    hasAMLTraining: operation.training?.aml === true,
    hasStaffTraining: operation.training?.staff === true
  };
  
  const passed = Object.values(checks).every(check => check === true);
  
  return {
    regulation: "AML",
    passed,
    details: checks,
    timestamp: new Date().toISOString(),
    score: calculateRegulationScore(checks)
  };
}

/**
 * Verificação KYC (Know Your Customer)
 */
async function checkKYCCompliance(operation: any, runtime: any): Promise<ComplianceCheck> {
  const checks = {
    // Identity Verification
    hasIdentityVerification: operation.identity?.verified === true,
    hasDocumentVerification: operation.documents?.verified === true,
    hasBiometricVerification: operation.biometric?.verified === true,
    
    // Address Verification
    hasAddressVerification: operation.address?.verified === true,
    hasUtilityBillVerification: operation.utilityBill?.verified === true,
    
    // Financial Information
    hasIncomeVerification: operation.income?.verified === true,
    hasEmploymentVerification: operation.employment?.verified === true,
    
    // Risk Assessment
    hasCustomerRiskProfile: operation.riskProfile !== null,
    hasOngoingMonitoring: operation.ongoingMonitoring === true,
    
    // Documentation
    hasRequiredDocuments: operation.documents?.complete === true,
    hasDocumentExpiryCheck: operation.documents?.expiryCheck === true,
    
    // Compliance
    hasRegulatoryCompliance: operation.regulatoryCompliance === true,
    hasInternalPolicies: operation.internalPolicies === true
  };
  
  const passed = Object.values(checks).every(check => check === true);
  
  return {
    regulation: "KYC",
    passed,
    details: checks,
    timestamp: new Date().toISOString(),
    score: calculateRegulationScore(checks)
  };
}

/**
 * Verificação de Retenção de Dados
 */
async function checkDataRetention(operation: any, runtime: any): Promise<ComplianceCheck> {
  const checks = {
    // Retention Policy
    hasRetentionPolicy: operation.retention?.policy !== null,
    hasRetentionPeriod: operation.retention?.period !== null,
    
    // Data Classification
    hasDataClassification: operation.data?.classification !== null,
    hasSensitivityLevel: operation.data?.sensitivity !== null,
    
    // Automated Deletion
    hasAutomatedDeletion: operation.deletion?.automated === true,
    hasDeletionSchedule: operation.deletion?.schedule !== null,
    
    // Legal Holds
    hasLegalHoldProcess: operation.legalHold?.process !== null,
    hasLitigationHold: operation.litigationHold === true,
    
    // Audit Trail
    hasDeletionAudit: operation.audit?.deletion === true,
    hasRetentionAudit: operation.audit?.retention === true,
    
    // Compliance
    hasRegulatoryRetention: operation.regulatoryRetention === true,
    hasBusinessRetention: operation.businessRetention === true
  };
  
  const passed = Object.values(checks).every(check => check === true);
  
  return {
    regulation: "Data Retention",
    passed,
    details: checks,
    timestamp: new Date().toISOString(),
    score: calculateRegulationScore(checks)
  };
}

/**
 * Bloqueia operação não conforme
 */
async function blockOperation(operationId: string, runtime: any): Promise<void> {
  try {
    // Registrar bloqueio no banco de dados
    await runtime.adapters.database.query(
      'INSERT INTO compliance_blocks (operation_id, reason, blocked_at) VALUES ($1, $2, $3)',
      [operationId, 'Non-compliant operation', new Date()]
    );
    
    // Log de auditoria
    await runtime.adapters.analytics.trackEvent({
      eventName: 'operation_blocked',
      properties: {
        operationId,
        reason: 'compliance_violation',
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`Operação ${operationId} bloqueada por não conformidade`);
  } catch (error) {
    console.error('Erro ao bloquear operação:', error);
  }
}

/**
 * Notifica equipe de compliance
 */
async function notifyComplianceTeam(checks: any, runtime: any): Promise<void> {
  try {
    const violations = Object.entries(checks)
      .filter(([_, check]: [string, any]) => !check.passed)
      .map(([regulation, check]: [string, any]) => regulation);
    
    await runtime.adapters.notifications.sendNotification({
      userId: 'compliance_team',
      title: '🚨 Violação de Compliance Detectada',
      message: `Violações encontradas em: ${violations.join(', ')}`,
      type: 'error',
      priority: 'urgent',
      channels: ['email', 'push', 'in_app']
    });
    
    console.log(`Equipe de compliance notificada sobre violações: ${violations.join(', ')}`);
  } catch (error) {
    console.error('Erro ao notificar equipe de compliance:', error);
  }
}

/**
 * Gera relatório de compliance
 */
function generateComplianceReport(checks: any): string {
  let report = "📋 **Relatório de Compliance**\n\n";
  
  Object.entries(checks).forEach(([regulation, check]: [string, any]) => {
    const status = check.passed ? "✅" : "❌";
    const score = check.score || 0;
    
    report += `${status} **${regulation}**: ${score}% ${check.passed ? '(Conforme)' : '(Não Conforme)'}\n`;
    
    if (!check.passed) {
      const violations = Object.entries(check.details)
        .filter(([_, value]: [string, any]) => value === false)
        .map(([key, _]) => key);
      
      if (violations.length > 0) {
        report += `   ⚠️ Violações: ${violations.join(', ')}\n`;
      }
    }
    
    report += "\n";
  });
  
  const overallScore = calculateComplianceScore(checks);
  report += `🎯 **Score Geral de Compliance**: ${overallScore}%\n`;
  
  if (overallScore >= 90) {
    report += "✅ **Excelente conformidade!**";
  } else if (overallScore >= 70) {
    report += "⚠️ **Boa conformidade, mas há pontos de melhoria**";
  } else {
    report += "❌ **Conformidade insuficiente - ação imediata necessária**";
  }
  
  return report;
}

/**
 * Calcula score de compliance geral
 */
function calculateComplianceScore(checks: any): number {
  const scores = Object.values(checks).map((check: any) => check.score || 0);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Calcula score de uma regulamentação
 */
function calculateRegulationScore(checks: any): number {
  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(value => value === true).length;
  return Math.round((passedChecks / totalChecks) * 100);
}

// Tipos
interface ComplianceCheck {
  regulation: string;
  passed: boolean;
  details: any;
  timestamp: string;
  score: number;
}