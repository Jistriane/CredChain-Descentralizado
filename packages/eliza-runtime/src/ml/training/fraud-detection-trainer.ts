/**
 * Fraud Detection Model Trainer
 * 
 * Script para treinar o modelo de detecção de fraude usando TensorFlow.js
 */

import * as tf from '@tensorflow/tfjs-node';
import { Logger } from '../utils/logger';
import { DatabaseAdapter } from '../adapters/database';

export interface FraudTrainingData {
  features: number[][];
  labels: number[]; // 0 = normal, 1 = fraude
  userIds: string[];
  transactionIds: string[];
}

export interface FraudMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
}

export interface FraudTrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  testSplit: number;
  features: string[];
  targetColumn: string;
  fraudThreshold: number;
  anomalyThreshold: number;
}

export class FraudDetectionTrainer {
  private logger: Logger;
  private dbAdapter: DatabaseAdapter;
  private model: tf.LayersModel | null = null;

  constructor() {
    this.logger = new Logger('FraudDetectionTrainer');
    this.dbAdapter = new DatabaseAdapter();
  }

  /**
   * Preparar dados de treinamento para detecção de fraude
   */
  async prepareTrainingData(config: FraudTrainingConfig): Promise<FraudTrainingData> {
    this.logger.info('Preparando dados de treinamento para detecção de fraude...');

    try {
      // Buscar transações
      const transactions = await this.dbAdapter.getTransactions();
      
      // Buscar dados de usuários
      const users = await this.dbAdapter.getUsers();
      
      // Buscar registros de fraude
      const fraudRecords = await this.dbAdapter.getFraudDetection();

      const features: number[][] = [];
      const labels: number[] = [];
      const userIds: string[] = [];
      const transactionIds: string[] = [];

      for (const transaction of transactions) {
        const user = users.find(u => u.id === transaction.userId);
        const fraudRecord = fraudRecords.find(f => f.userId === transaction.userId);
        
        if (user) {
          // Extrair features da transação
          const featureVector = this.extractTransactionFeatures(transaction, user, config.features);
          features.push(featureVector);
          
          // Label: 1 se é fraude, 0 se não é
          const isFraud = fraudRecord ? (fraudRecord.severity === 'high' || fraudRecord.severity === 'critical') ? 1 : 0 : 0;
          labels.push(isFraud);
          
          userIds.push(transaction.userId);
          transactionIds.push(transaction.id);
        }
      }

      this.logger.info(`Dados preparados: ${features.length} transações, ${features[0]?.length || 0} features`);
      this.logger.info(`Distribuição: ${labels.filter(l => l === 1).length} fraudes, ${labels.filter(l => l === 0).length} normais`);
      
      return { features, labels, userIds, transactionIds };
    } catch (error) {
      this.logger.error('Erro ao preparar dados de treinamento:', error);
      throw error;
    }
  }

  /**
   * Extrair features de uma transação
   */
  private extractTransactionFeatures(transaction: any, user: any, featureNames: string[]): number[] {
    const features: number[] = [];

    for (const featureName of featureNames) {
      switch (featureName) {
        case 'amount_normalized':
          features.push(this.normalizeAmount(transaction.amount, user.income));
          break;
        case 'time_of_day':
          features.push(this.getTimeOfDay(transaction.createdAt));
          break;
        case 'day_of_week':
          features.push(this.getDayOfWeek(transaction.createdAt));
          break;
        case 'hour_of_day':
          features.push(this.getHourOfDay(transaction.createdAt));
          break;
        case 'location_anomaly':
          features.push(this.calculateLocationAnomaly(transaction, user));
          break;
        case 'device_anomaly':
          features.push(this.calculateDeviceAnomaly(transaction, user));
          break;
        case 'velocity_anomaly':
          features.push(this.calculateVelocityAnomaly(transaction, user));
          break;
        case 'amount_anomaly':
          features.push(this.calculateAmountAnomaly(transaction, user));
          break;
        case 'frequency_anomaly':
          features.push(this.calculateFrequencyAnomaly(transaction, user));
          break;
        case 'pattern_deviation':
          features.push(this.calculatePatternDeviation(transaction, user));
          break;
        default:
          features.push(0);
      }
    }

    return features;
  }

  /**
   * Normalizar valor da transação
   */
  private normalizeAmount(amount: number, income: number): number {
    if (!income || income === 0) return 0;
    return Math.min(amount / (income / 12), 1); // Normalizar para 0-1
  }

  /**
   * Obter hora do dia (0-1)
   */
  private getTimeOfDay(timestamp: string): number {
    const hour = new Date(timestamp).getHours();
    return hour / 24;
  }

  /**
   * Obter dia da semana (0-1)
   */
  private getDayOfWeek(timestamp: string): number {
    const day = new Date(timestamp).getDay();
    return day / 7;
  }

  /**
   * Obter hora do dia (0-1)
   */
  private getHourOfDay(timestamp: string): number {
    const hour = new Date(timestamp).getHours();
    return hour / 24;
  }

  /**
   * Calcular anomalia de localização
   */
  private calculateLocationAnomaly(transaction: any, user: any): number {
    // Simular verificação de localização
    const isUnusualLocation = Math.random() < 0.1; // 10% chance de localização suspeita
    return isUnusualLocation ? 1 : 0;
  }

  /**
   * Calcular anomalia de dispositivo
   */
  private calculateDeviceAnomaly(transaction: any, user: any): number {
    // Simular verificação de dispositivo
    const isNewDevice = Math.random() < 0.05; // 5% chance de dispositivo novo
    return isNewDevice ? 1 : 0;
  }

  /**
   * Calcular anomalia de velocidade
   */
  private calculateVelocityAnomaly(transaction: any, user: any): number {
    // Simular verificação de velocidade de transações
    const isHighVelocity = Math.random() < 0.08; // 8% chance de alta velocidade
    return isHighVelocity ? 1 : 0;
  }

  /**
   * Calcular anomalia de valor
   */
  private calculateAmountAnomaly(transaction: any, user: any): number {
    const avgAmount = user.income / 30; // Estimativa de gasto diário
    const isUnusualAmount = Math.abs(transaction.amount - avgAmount) > (avgAmount * 3);
    return isUnusualAmount ? 1 : 0;
  }

  /**
   * Calcular anomalia de frequência
   */
  private calculateFrequencyAnomaly(transaction: any, user: any): number {
    // Simular verificação de frequência
    const isUnusualFrequency = Math.random() < 0.12; // 12% chance de frequência suspeita
    return isUnusualFrequency ? 1 : 0;
  }

  /**
   * Calcular desvio de padrão
   */
  private calculatePatternDeviation(transaction: any, user: any): number {
    // Simular verificação de padrão
    const isPatternDeviation = Math.random() < 0.15; // 15% chance de desvio de padrão
    return isPatternDeviation ? 1 : 0;
  }

  /**
   * Criar modelo de detecção de fraude
   */
  private createModel(inputShape: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Camada de entrada
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Camada de dropout
        tf.layers.dropout({ rate: 0.3 }),
        
        // Camada oculta 1
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Camada de dropout
        tf.layers.dropout({ rate: 0.2 }),
        
        // Camada oculta 2
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        
        // Camada de saída (classificação binária)
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    // Compilar modelo
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  /**
   * Treinar modelo de detecção de fraude
   */
  async trainModel(trainingData: FraudTrainingData, config: FraudTrainingConfig): Promise<FraudMetrics> {
    this.logger.info('Iniciando treinamento do modelo de detecção de fraude...');

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
            this.logger.info(`Época ${epoch + 1}: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}, val_accuracy=${logs?.val_accuracy?.toFixed(4)}`);
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
   * Dividir dados
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
  private async evaluateModel(valFeatures: tf.Tensor2D, valLabels: tf.Tensor2D): Promise<FraudMetrics> {
    if (!this.model) {
      throw new Error('Modelo não foi treinado');
    }

    const predictions = this.model.predict(valFeatures) as tf.Tensor2D;
    const predArray = await predictions.array();
    const labelArray = await valLabels.array();

    // Calcular métricas
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < predArray.length; i++) {
      const predicted = predArray[i][0] > 0.5 ? 1 : 0;
      const actual = labelArray[i][0];

      if (predicted === 1 && actual === 1) truePositives++;
      else if (predicted === 1 && actual === 0) falsePositives++;
      else if (predicted === 0 && actual === 0) trueNegatives++;
      else if (predicted === 0 && actual === 1) falseNegatives++;
    }

    const accuracy = (truePositives + trueNegatives) / (truePositives + falsePositives + trueNegatives + falseNegatives);
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    // Calcular AUC (simplificado)
    const auc = this.calculateAUC(predArray, labelArray);

    // Matriz de confusão
    const confusionMatrix = [
      [trueNegatives, falsePositives],
      [falseNegatives, truePositives]
    ];

    // Limpar tensores
    predictions.dispose();

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      auc,
      confusionMatrix
    };
  }

  /**
   * Calcular AUC (simplificado)
   */
  private calculateAUC(predictions: number[][], labels: number[][]): number {
    // Implementação simplificada do AUC
    const scores = predictions.map(p => p[0]);
    const actuals = labels.map(l => l[0]);
    
    // Ordenar por score
    const sorted = scores.map((score, index) => ({ score, actual: actuals[index] }))
      .sort((a, b) => b.score - a.score);
    
    let auc = 0;
    let rank = 0;
    let positiveCount = 0;
    
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].actual === 1) {
        positiveCount++;
        auc += rank;
      }
      rank++;
    }
    
    const totalPositives = actuals.filter(a => a === 1).length;
    const totalNegatives = actuals.filter(a => a === 0).length;
    
    if (totalPositives === 0 || totalNegatives === 0) return 0.5;
    
    return (auc - (totalPositives * (totalPositives - 1)) / 2) / (totalPositives * totalNegatives);
  }

  /**
   * Salvar modelo
   */
  async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não foi treinado');
    }

    this.logger.info(`Salvando modelo em: ${path}`);
    await this.model.save(`file://${path}`);
  }

  /**
   * Carregar modelo
   */
  async loadModel(path: string): Promise<void> {
    this.logger.info(`Carregando modelo de: ${path}`);
    this.model = await tf.loadLayersModel(`file://${path}`);
  }

  /**
   * Fazer predição
   */
  async predict(features: number[]): Promise<{ isFraud: boolean; confidence: number }> {
    if (!this.model) {
      throw new Error('Modelo não foi carregado');
    }

    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor2D;
    const result = await prediction.data();
    
    input.dispose();
    prediction.dispose();

    const confidence = result[0];
    const isFraud = confidence > 0.5;

    return { isFraud, confidence };
  }

  /**
   * Pipeline completo de treinamento
   */
  async runTrainingPipeline(config: FraudTrainingConfig, modelPath: string): Promise<FraudMetrics> {
    this.logger.info('Iniciando pipeline de treinamento de detecção de fraude...');

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
  const trainer = new FraudDetectionTrainer();
  
  const config: FraudTrainingConfig = {
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    testSplit: 0.1,
    features: [
      'amount_normalized',
      'time_of_day',
      'day_of_week',
      'hour_of_day',
      'location_anomaly',
      'device_anomaly',
      'velocity_anomaly',
      'amount_anomaly',
      'frequency_anomaly',
      'pattern_deviation'
    ],
    targetColumn: 'is_fraud',
    fraudThreshold: 0.5,
    anomalyThreshold: 0.7
  };

  trainer.runTrainingPipeline(config, './models/fraud-detection-model')
    .then(metrics => {
      console.log('Treinamento concluído:', metrics);
      process.exit(0);
    })
    .catch(error => {
      console.error('Erro no treinamento:', error);
      process.exit(1);
    });
}
