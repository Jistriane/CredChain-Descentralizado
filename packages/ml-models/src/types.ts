export interface CreditScoreData {
  paymentHistory: number;
  creditUtilization: number;
  creditAge: number;
  creditMix: number;
  newCreditInquiries: number;
  income: number;
  debtToIncome: number;
  employmentLength: number;
  housingStatus: number;
  educationLevel: number;
  actualScore: number;
}

export interface CreditScorePrediction {
  score: number;
  confidence: number;
  explanation: string;
  factors: Array<{
    name: string;
    value: number;
    impact: string;
  }>;
  recommendations: string[];
}

export interface FraudData {
  transactionAmount: number;
  transactionFrequency: number;
  timeOfDay: number;
  dayOfWeek: number;
  merchantCategory: number;
  locationDistance: number;
  deviceType: number;
  ipAddress: number;
  userAgent: number;
  sessionDuration: number;
  loginAttempts: number;
  failedTransactions: number;
  chargebacks: number;
  creditUtilization: number;
  accountAge: number;
  isFraud: boolean;
}

export interface FraudPrediction {
  isFraud: boolean;
  probability: number;
  confidence: number;
  explanation: string;
  riskFactors: Array<{
    name: string;
    value: number;
    risk: string;
  }>;
  recommendations: string[];
}

export interface ModelConfig {
  inputFeatures: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export interface FraudModelConfig extends ModelConfig {
  threshold: number;
}

export interface RiskAssessmentData {
  creditScore: number;
  income: number;
  debtToIncome: number;
  employmentLength: number;
  housingStatus: number;
  educationLevel: number;
  age: number;
  maritalStatus: number;
  dependents: number;
  previousBankruptcies: number;
  previousForeclosures: number;
  previousRepossessions: number;
  publicRecords: number;
  inquiries: number;
  accounts: number;
}

export interface RiskAssessmentPrediction {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number;
  confidence: number;
  explanation: string;
  factors: Array<{
    name: string;
    value: number;
    impact: string;
  }>;
  recommendations: string[];
}

export interface BehavioralPatternData {
  userId: string;
  timestamp: number;
  action: string;
  device: string;
  location: string;
  sessionDuration: number;
  pageViews: number;
  clicks: number;
  scrolls: number;
  timeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  category: string;
  subcategory: string;
  tags: string[];
  metadata: any;
}

export interface BehavioralPatternPrediction {
  pattern: string;
  confidence: number;
  explanation: string;
  insights: string[];
  recommendations: string[];
}

export interface ComplianceData {
  userId: string;
  timestamp: number;
  operation: string;
  dataType: string;
  consent: boolean;
  purpose: string;
  retention: number;
  encryption: boolean;
  accessControl: boolean;
  auditLog: boolean;
  dataMinimization: boolean;
  accuracy: boolean;
  portability: boolean;
  deletion: boolean;
  notification: boolean;
  crossBorder: boolean;
  thirdParty: boolean;
  automatedDecision: boolean;
  profiling: boolean;
  specialCategories: boolean;
  children: boolean;
  vulnerable: boolean;
  biometric: boolean;
  location: boolean;
  behavioral: boolean;
  financial: boolean;
  health: boolean;
  political: boolean;
  religious: boolean;
  philosophical: boolean;
  tradeUnion: boolean;
  genetic: boolean;
  biometricData: boolean;
  healthData: boolean;
  criminalData: boolean;
  isCompliant: boolean;
}

export interface CompliancePrediction {
  isCompliant: boolean;
  probability: number;
  confidence: number;
  explanation: string;
  violations: string[];
  recommendations: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  mse?: number;
  mae?: number;
  r2?: number;
}

export interface ModelStatus {
  isInitialized: boolean;
  isTrained: boolean;
  config: any;
  lastTraining?: Date;
  lastEvaluation?: Date;
  metrics?: ModelMetrics;
}

export interface TrainingData {
  features: number[][];
  labels: number[];
  metadata: any;
}

export interface ValidationData {
  features: number[][];
  labels: number[];
  metadata: any;
}

export interface TestData {
  features: number[][];
  labels: number[];
  metadata: any;
}

export interface ModelConfig {
  inputFeatures: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  testSplit: number;
  randomSeed: number;
  earlyStopping: boolean;
  patience: number;
  minDelta: number;
  restoreBestWeights: boolean;
  verbose: boolean;
}

export interface FraudModelConfig extends ModelConfig {
  threshold: number;
  classWeight: { [key: number]: number };
  samplingStrategy: 'none' | 'oversample' | 'undersample' | 'smote';
}

export interface CreditScoreModelConfig extends ModelConfig {
  outputRange: [number, number];
  normalizationMethod: 'minmax' | 'standard' | 'robust';
  featureSelection: boolean;
  featureImportance: boolean;
}

export interface RiskAssessmentModelConfig extends ModelConfig {
  riskLevels: string[];
  riskThresholds: number[];
  weightFactors: { [key: string]: number };
}

export interface BehavioralPatternModelConfig extends ModelConfig {
  sequenceLength: number;
  embeddingSize: number;
  hiddenSize: number;
  numLayers: number;
  dropout: number;
  bidirectional: boolean;
}

export interface ComplianceModelConfig extends ModelConfig {
  regulations: string[];
  complianceRules: { [key: string]: any };
  violationThreshold: number;
  auditRequired: boolean;
}
