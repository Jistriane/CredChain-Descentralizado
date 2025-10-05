/**
 * Credit Score Model Trainer
 * 
 * Script para treinar o modelo de credit scoring usando TensorFlow.js
 */

import * as tf from '@tensorflow/tfjs-node';
import { Logger } from '../utils/logger';
import { DatabaseAdapter } from '../adapters/database';

export interface TrainingData {
  features: number[][];
  labels: number[];
  userIds: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  testSplit: number;
  features: string[];
  targetColumn: string;
}

export class CreditScoreTrainer {
  private logger: Logger;
  private dbAdapter: DatabaseAdapter;
  private model: tf.LayersModel | null = null;

  constructor() {
    this.logger = new Logger('CreditScoreTrainer');
    this.dbAdapter = new DatabaseAdapter();
  }

  /**
   * Preparar dados de treinamento
   */
  async prepareTrainingData(config: TrainingConfig): Promise<TrainingData> {
    this.logger.info('Preparando dados de treinamento...');

    try {
      // Buscar dados históricos de pagamentos
      const payments = await this.dbAdapter.getPaymentHistory();
      
      // Buscar dados de usuários
      const users = await this.dbAdapter.getUsers();
      
      // Buscar scores existentes
      const scores = await this.dbAdapter.getCreditScores();

      const features: number[][] = [];
      const labels: number[] = [];
      const userIds: string[] = [];

      for (const user of users) {
        const userPayments = payments.filter(p => p.userId === user.id);
        const userScore = scores.find(s => s.userId === user.id);
        
        if (userPayments.length >= 3 && userScore) {
          // Extrair features
          const featureVector = this.extractFeatures(user, userPayments, config.features);
          features.push(featureVector);
          labels.push(userScore.score);
          userIds.push(user.id);
        }
      }

      this.logger.info(`Dados preparados: ${features.length} amostras, ${features[0]?.length || 0} features`);
      
      return { features, labels, userIds };
    } catch (error) {
      this.logger.error('Erro ao preparar dados de treinamento:', error);
      throw error;
    }
  }

  /**
   * Extrair features de um usuário
   */
  private extractFeatures(user: any, payments: any[], featureNames: string[]): number[] {
    const features: number[] = [];

    for (const featureName of featureNames) {
      switch (featureName) {
        case 'payment_history_score':
          features.push(this.calculatePaymentHistoryScore(payments));
          break;
        case 'credit_utilization':
          features.push(this.calculateCreditUtilization(payments));
          break;
        case 'credit_age_months':
          features.push(this.calculateCreditAge(payments));
          break;
        case 'payment_frequency':
          features.push(this.calculatePaymentFrequency(payments));
          break;
        case 'amount_variance':
          features.push(this.calculateAmountVariance(payments));
          break;
        case 'late_payment_ratio':
          features.push(this.calculateLatePaymentRatio(payments));
          break;
        case 'account_diversity':
          features.push(this.calculateAccountDiversity(payments));
          break;
        case 'income_ratio':
          features.push(this.calculateIncomeRatio(user, payments));
          break;
        default:
          features.push(0);
      }
    }

    return features;
  }

  /**
   * Calcular score de histórico de pagamentos
   */
  private calculatePaymentHistoryScore(payments: any[]): number {
    const totalPayments = payments.length;
    const onTimePayments = payments.filter(p => p.status === 'paid' && !p.late).length;
    return totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;
  }

  /**
   * Calcular utilização de crédito
   */
  private calculateCreditUtilization(payments: any[]): number {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgAmount = totalAmount / payments.length;
    return Math.min(avgAmount / 1000, 1); // Normalizar para 0-1
  }

  /**
   * Calcular idade do crédito em meses
   */
  private calculateCreditAge(payments: any[]): number {
    if (payments.length === 0) return 0;
    
    const oldestPayment = Math.min(...payments.map(p => new Date(p.createdAt).getTime()));
    const now = Date.now();
    const ageInMonths = (now - oldestPayment) / (1000 * 60 * 60 * 24 * 30);
    
    return Math.min(ageInMonths / 60, 1); // Normalizar para 0-1 (máximo 5 anos)
  }

  /**
   * Calcular frequência de pagamentos
   */
  private calculatePaymentFrequency(payments: any[]): number {
    if (payments.length < 2) return 0;
    
    const sortedPayments = payments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const timeSpan = new Date(sortedPayments[sortedPayments.length - 1].createdAt).getTime() - 
                     new Date(sortedPayments[0].createdAt).getTime();
    const avgInterval = timeSpan / (payments.length - 1);
    const daysBetweenPayments = avgInterval / (1000 * 60 * 60 * 24);
    
    return Math.min(30 / daysBetweenPayments, 1); // Normalizar para 0-1
  }

  /**
   * Calcular variância de valores
   */
  private calculateAmountVariance(payments: any[]): number {
    if (payments.length < 2) return 0;
    
    const amounts = payments.map(p => p.amount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.min(stdDev / mean, 1); // Normalizar para 0-1
  }

  /**
   * Calcular proporção de pagamentos em atraso
   */
  private calculateLatePaymentRatio(payments: any[]): number {
    const totalPayments = payments.length;
    const latePayments = payments.filter(p => p.status === 'late' || p.status === 'defaulted').length;
    return totalPayments > 0 ? latePayments / totalPayments : 0;
  }

  /**
   * Calcular diversidade de contas
   */
  private calculateAccountDiversity(payments: any[]): number {
    const uniqueTypes = new Set(payments.map(p => p.type)).size;
    return Math.min(uniqueTypes / 5, 1); // Normalizar para 0-1 (máximo 5 tipos)
  }

  /**
   * Calcular proporção renda/pagamentos
   */
  private calculateIncomeRatio(user: any, payments: any[]): number {
    if (!user.income || payments.length === 0) return 0;
    
    const avgPayment = payments.reduce((sum, p) => sum + p.amount, 0) / payments.length;
    return Math.min(avgPayment / (user.income / 12), 1); // Normalizar para 0-1
  }

  /**
   * Criar modelo de rede neural
   */
  private createModel(inputShape: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Camada de entrada
        tf.layers.dense({
          inputShape: [inputShape],
          units: 128,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        
        // Camada de dropout para regularização
        tf.layers.dropout({ rate: 0.3 }),
        
        // Camada oculta 1
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        
        // Camada de dropout
        tf.layers.dropout({ rate: 0.2 }),
        
        // Camada oculta 2
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
        }),
        
        // Camada de saída
        tf.layers.dense({
          units: 1,
          activation: 'linear' // Regressão para score 0-1000
        })
      ]
    });

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae', 'mse']
    });

    return model;
  }

  /**
   * Treinar modelo
   */
  async trainModel(trainingData: TrainingData, config: TrainingConfig): Promise<ModelMetrics> {
    this.logger.info('Iniciando treinamento do modelo...');

    try {
      // Preparar dados
      const { features, labels } = trainingData;
      const featureTensor = tf.tensor2d(features);
      const labelTensor = tf.tensor2d(labels.map(l => [l]));

      // Normalizar features
      const normalizedFeatures = this.normalizeFeatures(featureTensor);

      // Dividir dados
      const { trainFeatures, trainLabels, valFeatures, valLabels } = this.splitData(
        normalizedFeatures, 
        labelTensor, 
        config.validationSplit
      );

      // Criar modelo
      this.model = this.createModel(features[0].length);

      // Treinar modelo
      const history = await this.model.fit(trainFeatures, trainLabels, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationData: [valFeatures, valLabels],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.logger.info(`Época ${epoch + 1}: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}`);
          }
        }
      });

      // Avaliar modelo
      const metrics = await this.evaluateModel(valFeatures, valLabels);

      this.logger.info('Treinamento concluído', { metrics });

      // Limpar tensores
      featureTensor.dispose();
      labelTensor.dispose();
      normalizedFeatures.dispose();
      trainFeatures.dispose();
      trainLabels.dispose();
      valFeatures.dispose();
      valLabels.dispose();

      return metrics;
    } catch (error) {
      this.logger.error('Erro durante treinamento:', error);
      throw error;
    }
  }

  /**
   * Normalizar features
   */
  private normalizeFeatures(features: tf.Tensor2D): tf.Tensor2D {
    const mean = features.mean(0);
    const std = features.sub(mean).square().mean(0).sqrt();
    return features.sub(mean).div(std);
  }

  /**
   * Dividir dados em treino e validação
   */
  private splitData(features: tf.Tensor2D, labels: tf.Tensor2D, validationSplit: number) {
    const totalSamples = features.shape[0];
    const valSize = Math.floor(totalSamples * validationSplit);
    const trainSize = totalSamples - valSize;

    const trainFeatures = features.slice([0, 0], [trainSize, -1]);
    const trainLabels = labels.slice([0, 0], [trainSize, -1]);
    const valFeatures = features.slice([trainSize, 0], [valSize, -1]);
    const valLabels = labels.slice([trainSize, 0], [valSize, -1]);

    return { trainFeatures, trainLabels, valFeatures, valLabels };
  }

  /**
   * Avaliar modelo
   */
  private async evaluateModel(valFeatures: tf.Tensor2D, valLabels: tf.Tensor2D): Promise<ModelMetrics> {
    if (!this.model) {
      throw new Error('Modelo não foi treinado');
    }

    const predictions = this.model.predict(valFeatures) as tf.Tensor2D;
    const predArray = await predictions.array();
    const labelArray = await valLabels.array();

    // Calcular métricas
    const mse = tf.losses.meanSquaredError(valLabels, predictions);
    const mae = tf.losses.absoluteDifference(valLabels, predictions);
    
    const mseValue = await mse.data();
    const maeValue = await mae.data();

    // Calcular accuracy (dentro de 50 pontos)
    let correct = 0;
    for (let i = 0; i < predArray.length; i++) {
      if (Math.abs(predArray[i][0] - labelArray[i][0]) <= 50) {
        correct++;
      }
    }
    const accuracy = correct / predArray.length;

    // Calcular precision e recall (simplificado)
    const precision = accuracy; // Simplificado
    const recall = accuracy; // Simplificado
    const f1Score = 2 * (precision * recall) / (precision + recall);

    // Limpar tensores
    predictions.dispose();
    mse.dispose();
    mae.dispose();

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      mse: mseValue[0],
      mae: maeValue[0]
    };
  }

  /**
   * Salvar modelo treinado
   */
  async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não foi treinado');
    }

    this.logger.info(`Salvando modelo em: ${path}`);
    await this.model.save(`file://${path}`);
  }

  /**
   * Carregar modelo salvo
   */
  async loadModel(path: string): Promise<void> {
    this.logger.info(`Carregando modelo de: ${path}`);
    this.model = await tf.loadLayersModel(`file://${path}`);
  }

  /**
   * Fazer predição
   */
  async predict(features: number[]): Promise<number> {
    if (!this.model) {
      throw new Error('Modelo não foi carregado');
    }

    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor2D;
    const result = await prediction.data();
    
    input.dispose();
    prediction.dispose();

    return Math.max(0, Math.min(1000, result[0])); // Clamp entre 0 e 1000
  }

  /**
   * Pipeline completo de treinamento
   */
  async runTrainingPipeline(config: TrainingConfig, modelPath: string): Promise<ModelMetrics> {
    this.logger.info('Iniciando pipeline de treinamento completo...');

    try {
      // 1. Preparar dados
      const trainingData = await this.prepareTrainingData(config);
      
      // 2. Treinar modelo
      const metrics = await this.trainModel(trainingData, config);
      
      // 3. Salvar modelo
      await this.saveModel(modelPath);
      
      this.logger.info('Pipeline de treinamento concluído com sucesso');
      
      return metrics;
    } catch (error) {
      this.logger.error('Erro no pipeline de treinamento:', error);
      throw error;
    }
  }
}

// Script de treinamento standalone
if (require.main === module) {
  const trainer = new CreditScoreTrainer();
  
  const config: TrainingConfig = {
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    testSplit: 0.1,
    features: [
      'payment_history_score',
      'credit_utilization',
      'credit_age_months',
      'payment_frequency',
      'amount_variance',
      'late_payment_ratio',
      'account_diversity',
      'income_ratio'
    ],
    targetColumn: 'score'
  };

  trainer.runTrainingPipeline(config, './models/credit-score-model')
    .then(metrics => {
      console.log('Treinamento concluído:', metrics);
      process.exit(0);
    })
    .catch(error => {
      console.error('Erro no treinamento:', error);
      process.exit(1);
    });
}
