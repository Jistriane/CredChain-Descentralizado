import * as tf from '@tensorflow/tfjs-node';
import { FraudData, FraudPrediction, FraudModelConfig } from './types';

export class FraudDetectionModel {
  private model: tf.LayersModel | null = null;
  private config: FraudModelConfig;
  private isTrained: boolean = false;
  private featureScaler: any = null;

  constructor(config: FraudModelConfig) {
    this.config = config;
  }

  /**
   * Inicializa o modelo de detecção de fraude
   */
  async initialize(): Promise<void> {
    try {
      console.log('🛡️ Inicializando modelo de detecção de fraude...');
      
      // Criar arquitetura do modelo
      this.model = tf.sequential({
        layers: [
          // Camada de entrada
          tf.layers.dense({
            inputShape: [this.config.inputFeatures],
            units: 128,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          
          // Camada de dropout para regularização
          tf.layers.dropout({ rate: 0.4 }),
          
          // Camada oculta 1
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          
          // Camada de dropout
          tf.layers.dropout({ rate: 0.3 }),
          
          // Camada oculta 2
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
          }),
          
          // Camada de saída (classificação binária)
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      // Compilar modelo
      this.model.compile({
        optimizer: tf.train.adam(this.config.learningRate),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy', 'precision', 'recall']
      });

      console.log('✅ Modelo de fraude inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar modelo de fraude:', error);
      throw error;
    }
  }

  /**
   * Treina o modelo com dados históricos
   */
  async train(trainingData: FraudData[]): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não inicializado');
    }

    try {
      console.log('🎯 Iniciando treinamento do modelo de fraude...');
      
      // Preparar dados de treinamento
      const { features, labels } = this.prepareTrainingData(trainingData);
      
      // Dividir dados em treino e validação
      const { trainFeatures, trainLabels, valFeatures, valLabels } = this.splitData(
        features, 
        labels, 
        0.8
      );

      // Configurar callbacks
      const callbacks = {
        onEpochEnd: (epoch: number, logs: any) => {
          console.log(`Época ${epoch + 1}: Loss = ${logs.loss.toFixed(4)}, Accuracy = ${logs.acc.toFixed(4)}`);
        }
      };

      // Treinar modelo
      const history = await this.model.fit(trainFeatures, trainLabels, {
        epochs: this.config.epochs,
        batchSize: this.config.batchSize,
        validationData: [valFeatures, valLabels],
        callbacks: callbacks,
        verbose: 1
      });

      this.isTrained = true;
      console.log('✅ Modelo de fraude treinado com sucesso');
      
      // Salvar modelo
      await this.saveModel();
      
    } catch (error) {
      console.error('❌ Erro ao treinar modelo de fraude:', error);
      throw error;
    }
  }

  /**
   * Faz predição de fraude
   */
  async predict(features: number[]): Promise<FraudPrediction> {
    if (!this.model || !this.isTrained) {
      throw new Error('Modelo não treinado');
    }

    try {
      // Normalizar features
      const normalizedFeatures = this.normalizeFeatures(features);
      
      // Fazer predição
      const prediction = this.model.predict(tf.tensor2d([normalizedFeatures])) as tf.Tensor;
      const score = await prediction.data();
      
      // Calcular probabilidade de fraude
      const fraudProbability = score[0];
      const isFraud = fraudProbability > this.config.threshold;
      
      // Calcular confiança
      const confidence = this.calculateConfidence(fraudProbability);
      
      // Gerar explicação
      const explanation = this.generateExplanation(features, fraudProbability);
      
      // Analisar fatores de risco
      const riskFactors = this.analyzeRiskFactors(features);
      
      return {
        isFraud: isFraud,
        probability: fraudProbability,
        confidence: confidence,
        explanation: explanation,
        riskFactors: riskFactors,
        recommendations: this.generateRecommendations(features, fraudProbability)
      };
    } catch (error) {
      console.error('❌ Erro ao fazer predição de fraude:', error);
      throw error;
    }
  }

  /**
   * Avalia o modelo com dados de teste
   */
  async evaluate(testData: FraudData[]): Promise<any> {
    if (!this.model || !this.isTrained) {
      throw new Error('Modelo não treinado');
    }

    try {
      console.log('📊 Avaliando modelo de fraude...');
      
      // Preparar dados de teste
      const { features, labels } = this.prepareTrainingData(testData);
      
      // Fazer predições
      const predictions = this.model.predict(features) as tf.Tensor;
      const predArray = await predictions.data();
      const labelArray = await labels.data();
      
      // Calcular métricas
      const accuracy = this.calculateAccuracy(predArray, labelArray);
      const precision = this.calculatePrecision(predArray, labelArray);
      const recall = this.calculateRecall(predArray, labelArray);
      const f1Score = this.calculateF1Score(precision, recall);
      const auc = this.calculateAUC(predArray, labelArray);
      
      const metrics = {
        accuracy: accuracy,
        precision: precision,
        recall: recall,
        f1Score: f1Score,
        auc: auc
      };
      
      console.log('✅ Avaliação do modelo de fraude concluída:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Erro ao avaliar modelo de fraude:', error);
      throw error;
    }
  }

  /**
   * Carrega modelo salvo
   */
  async loadModel(modelPath: string): Promise<void> {
    try {
      console.log('📁 Carregando modelo de fraude salvo...');
      
      this.model = await tf.loadLayersModel(modelPath);
      this.isTrained = true;
      
      console.log('✅ Modelo de fraude carregado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar modelo de fraude:', error);
      throw error;
    }
  }

  /**
   * Salva o modelo treinado
   */
  async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não inicializado');
    }

    try {
      const modelPath = `./models/fraud-detection-${Date.now()}`;
      await this.model.save(`file://${modelPath}`);
      console.log(`💾 Modelo de fraude salvo em: ${modelPath}`);
    } catch (error) {
      console.error('❌ Erro ao salvar modelo de fraude:', error);
      throw error;
    }
  }

  /**
   * Prepara dados de treinamento
   */
  private prepareTrainingData(data: FraudData[]): { features: tf.Tensor, labels: tf.Tensor } {
    const features: number[][] = [];
    const labels: number[] = [];
    
    for (const item of data) {
      features.push([
        item.transactionAmount,
        item.transactionFrequency,
        item.timeOfDay,
        item.dayOfWeek,
        item.merchantCategory,
        item.locationDistance,
        item.deviceType,
        item.ipAddress,
        item.userAgent,
        item.sessionDuration,
        item.loginAttempts,
        item.failedTransactions,
        item.chargebacks,
        item.creditUtilization,
        item.accountAge
      ]);
      
      labels.push(item.isFraud ? 1 : 0);
    }
    
    return {
      features: tf.tensor2d(features),
      labels: tf.tensor1d(labels)
    };
  }

  /**
   * Divide dados em treino e validação
   */
  private splitData(features: tf.Tensor, labels: tf.Tensor, trainRatio: number): {
    trainFeatures: tf.Tensor,
    trainLabels: tf.Tensor,
    valFeatures: tf.Tensor,
    valLabels: tf.Tensor
  } {
    const totalSamples = features.shape[0];
    const trainSize = Math.floor(totalSamples * trainRatio);
    
    const trainFeatures = features.slice([0, 0], [trainSize, -1]);
    const trainLabels = labels.slice([0], [trainSize]);
    const valFeatures = features.slice([trainSize, 0], [-1, -1]);
    const valLabels = labels.slice([trainSize], [-1]);
    
    return { trainFeatures, trainLabels, valFeatures, valLabels };
  }

  /**
   * Normaliza features
   */
  private normalizeFeatures(features: number[]): number[] {
    // Implementar normalização baseada nos dados de treinamento
    // Por simplicidade, usando normalização min-max
    const normalized = features.map((value, index) => {
      const min = 0;
      const max = 100;
      return (value - min) / (max - min);
    });
    
    return normalized;
  }

  /**
   * Calcula confiança da predição
   */
  private calculateConfidence(probability: number): number {
    // Implementar cálculo de confiança baseado na distribuição dos dados
    const confidence = Math.min(0.95, Math.max(0.5, 1 - Math.abs(probability - 0.5) * 2));
    return confidence;
  }

  /**
   * Gera explicação da predição
   */
  private generateExplanation(features: number[], probability: number): string {
    const explanations = [];
    
    if (features[0] > 10000) {
      explanations.push('Valor da transação muito alto');
    }
    
    if (features[1] > 10) {
      explanations.push('Frequência de transações muito alta');
    }
    
    if (features[2] < 6 || features[2] > 22) {
      explanations.push('Horário atípico para transações');
    }
    
    if (features[5] > 1000) {
      explanations.push('Distância muito grande da localização usual');
    }
    
    if (features[10] > 5) {
      explanations.push('Muitas tentativas de login');
    }
    
    if (features[11] > 3) {
      explanations.push('Muitas transações falhadas');
    }
    
    return explanations.join('. ');
  }

  /**
   * Analisa fatores de risco
   */
  private analyzeRiskFactors(features: number[]): any[] {
    const factors = [
      { name: 'Valor da Transação', value: features[0], risk: features[0] > 5000 ? 'Alto' : 'Baixo' },
      { name: 'Frequência de Transações', value: features[1], risk: features[1] > 5 ? 'Alto' : 'Baixo' },
      { name: 'Horário da Transação', value: features[2], risk: (features[2] < 6 || features[2] > 22) ? 'Alto' : 'Baixo' },
      { name: 'Categoria do Comerciante', value: features[3], risk: features[3] > 8 ? 'Alto' : 'Baixo' },
      { name: 'Distância da Localização', value: features[4], risk: features[4] > 1000 ? 'Alto' : 'Baixo' },
      { name: 'Tipo de Dispositivo', value: features[5], risk: features[5] > 5 ? 'Alto' : 'Baixo' },
      { name: 'Tentativas de Login', value: features[9], risk: features[9] > 3 ? 'Alto' : 'Baixo' },
      { name: 'Transações Falhadas', value: features[10], risk: features[10] > 2 ? 'Alto' : 'Baixo' }
    ];
    
    return factors;
  }

  /**
   * Gera recomendações para reduzir risco
   */
  private generateRecommendations(features: number[], probability: number): string[] {
    const recommendations = [];
    
    if (features[0] > 5000) {
      recommendations.push('Considere dividir transações grandes em menores');
    }
    
    if (features[1] > 5) {
      recommendations.push('Reduza a frequência de transações');
    }
    
    if (features[2] < 6 || features[2] > 22) {
      recommendations.push('Evite transações em horários atípicos');
    }
    
    if (features[4] > 1000) {
      recommendations.push('Verifique se a localização está correta');
    }
    
    if (features[9] > 3) {
      recommendations.push('Use autenticação de dois fatores');
    }
    
    if (features[10] > 2) {
      recommendations.push('Verifique os dados da transação antes de tentar novamente');
    }
    
    return recommendations;
  }

  /**
   * Calcula acurácia
   */
  private calculateAccuracy(predictions: Float32Array, labels: Float32Array): number {
    let correct = 0;
    const threshold = this.config.threshold;
    
    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] > threshold ? 1 : 0;
      if (pred === labels[i]) {
        correct++;
      }
    }
    
    return correct / predictions.length;
  }

  /**
   * Calcula precisão
   */
  private calculatePrecision(predictions: Float32Array, labels: Float32Array): number {
    let truePositives = 0;
    let falsePositives = 0;
    const threshold = this.config.threshold;
    
    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] > threshold ? 1 : 0;
      if (pred === 1 && labels[i] === 1) {
        truePositives++;
      } else if (pred === 1 && labels[i] === 0) {
        falsePositives++;
      }
    }
    
    return truePositives / (truePositives + falsePositives);
  }

  /**
   * Calcula recall
   */
  private calculateRecall(predictions: Float32Array, labels: Float32Array): number {
    let truePositives = 0;
    let falseNegatives = 0;
    const threshold = this.config.threshold;
    
    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] > threshold ? 1 : 0;
      if (pred === 1 && labels[i] === 1) {
        truePositives++;
      } else if (pred === 0 && labels[i] === 1) {
        falseNegatives++;
      }
    }
    
    return truePositives / (truePositives + falseNegatives);
  }

  /**
   * Calcula F1 Score
   */
  private calculateF1Score(precision: number, recall: number): number {
    return 2 * (precision * recall) / (precision + recall);
  }

  /**
   * Calcula AUC
   */
  private calculateAUC(predictions: Float32Array, labels: Float32Array): number {
    // Implementação simplificada de AUC
    // Em uma implementação real, você usaria uma biblioteca especializada
    const sorted = predictions.map((pred, i) => ({ pred, label: labels[i] }))
      .sort((a, b) => a.pred - b.pred);
    
    let auc = 0;
    let truePositives = 0;
    let falsePositives = 0;
    const totalPositives = labels.reduce((sum, label) => sum + label, 0);
    const totalNegatives = labels.length - totalPositives;
    
    for (const item of sorted) {
      if (item.label === 1) {
        truePositives++;
      } else {
        falsePositives++;
        auc += truePositives;
      }
    }
    
    return auc / (totalPositives * totalNegatives);
  }

  /**
   * Obtém status do modelo
   */
  getStatus(): any {
    return {
      isInitialized: this.model !== null,
      isTrained: this.isTrained,
      config: this.config
    };
  }
}

export const fraudDetectionModel = new FraudDetectionModel({
  inputFeatures: 15,
  learningRate: 0.001,
  epochs: 100,
  batchSize: 32,
  threshold: 0.5
});
