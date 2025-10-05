import * as tf from '@tensorflow/tfjs-node';
import { CreditScoreData, CreditScorePrediction, ModelConfig } from './types';

export class CreditScoreModel {
  private model: tf.LayersModel | null = null;
  private config: ModelConfig;
  private isTrained: boolean = false;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  /**
   * Inicializa o modelo de ML
   */
  async initialize(): Promise<void> {
    try {
      console.log('🤖 Inicializando modelo de credit score...');
      
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
            activation: 'sigmoid'
          })
        ]
      });

      // Compilar modelo
      this.model.compile({
        optimizer: tf.train.adam(this.config.learningRate),
        loss: 'meanSquaredError',
        metrics: ['mae', 'mse']
      });

      console.log('✅ Modelo inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar modelo:', error);
      throw error;
    }
  }

  /**
   * Treina o modelo com dados históricos
   */
  async train(trainingData: CreditScoreData[]): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não inicializado');
    }

    try {
      console.log('🎯 Iniciando treinamento do modelo...');
      
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
          console.log(`Época ${epoch + 1}: Loss = ${logs.loss.toFixed(4)}, Val Loss = ${logs.val_loss.toFixed(4)}`);
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
      console.log('✅ Modelo treinado com sucesso');
      
      // Salvar modelo
      await this.saveModel();
      
    } catch (error) {
      console.error('❌ Erro ao treinar modelo:', error);
      throw error;
    }
  }

  /**
   * Faz predição de credit score
   */
  async predict(features: number[]): Promise<CreditScorePrediction> {
    if (!this.model || !this.isTrained) {
      throw new Error('Modelo não treinado');
    }

    try {
      // Normalizar features
      const normalizedFeatures = this.normalizeFeatures(features);
      
      // Fazer predição
      const prediction = this.model.predict(tf.tensor2d([normalizedFeatures])) as tf.Tensor;
      const score = await prediction.data();
      
      // Converter para escala 0-1000
      const creditScore = Math.round(score[0] * 1000);
      
      // Calcular confiança
      const confidence = this.calculateConfidence(score[0]);
      
      // Gerar explicação
      const explanation = this.generateExplanation(features, creditScore);
      
      return {
        score: creditScore,
        confidence: confidence,
        explanation: explanation,
        factors: this.analyzeFactors(features),
        recommendations: this.generateRecommendations(features, creditScore)
      };
    } catch (error) {
      console.error('❌ Erro ao fazer predição:', error);
      throw error;
    }
  }

  /**
   * Avalia o modelo com dados de teste
   */
  async evaluate(testData: CreditScoreData[]): Promise<any> {
    if (!this.model || !this.isTrained) {
      throw new Error('Modelo não treinado');
    }

    try {
      console.log('📊 Avaliando modelo...');
      
      // Preparar dados de teste
      const { features, labels } = this.prepareTrainingData(testData);
      
      // Fazer predições
      const predictions = this.model.predict(features) as tf.Tensor;
      const predArray = await predictions.data();
      const labelArray = await labels.data();
      
      // Calcular métricas
      const mse = this.calculateMSE(predArray, labelArray);
      const mae = this.calculateMAE(predArray, labelArray);
      const r2 = this.calculateR2(predArray, labelArray);
      const accuracy = this.calculateAccuracy(predArray, labelArray);
      
      const metrics = {
        mse: mse,
        mae: mae,
        r2: r2,
        accuracy: accuracy
      };
      
      console.log('✅ Avaliação concluída:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Erro ao avaliar modelo:', error);
      throw error;
    }
  }

  /**
   * Carrega modelo salvo
   */
  async loadModel(modelPath: string): Promise<void> {
    try {
      console.log('📁 Carregando modelo salvo...');
      
      this.model = await tf.loadLayersModel(modelPath);
      this.isTrained = true;
      
      console.log('✅ Modelo carregado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar modelo:', error);
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
      const modelPath = `./models/credit-score-${Date.now()}`;
      await this.model.save(`file://${modelPath}`);
      console.log(`💾 Modelo salvo em: ${modelPath}`);
    } catch (error) {
      console.error('❌ Erro ao salvar modelo:', error);
      throw error;
    }
  }

  /**
   * Prepara dados de treinamento
   */
  private prepareTrainingData(data: CreditScoreData[]): { features: tf.Tensor, labels: tf.Tensor } {
    const features: number[][] = [];
    const labels: number[] = [];
    
    for (const item of data) {
      features.push([
        item.paymentHistory,
        item.creditUtilization,
        item.creditAge,
        item.creditMix,
        item.newCreditInquiries,
        item.income,
        item.debtToIncome,
        item.employmentLength,
        item.housingStatus,
        item.educationLevel
      ]);
      
      labels.push(item.actualScore / 1000); // Normalizar para 0-1
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
  private calculateConfidence(score: number): number {
    // Implementar cálculo de confiança baseado na distribuição dos dados
    const confidence = Math.min(0.95, Math.max(0.5, 1 - Math.abs(score - 0.5) * 2));
    return confidence;
  }

  /**
   * Gera explicação da predição
   */
  private generateExplanation(features: number[], score: number): string {
    const explanations = [];
    
    if (features[0] > 80) {
      explanations.push('Excelente histórico de pagamentos');
    } else if (features[0] > 60) {
      explanations.push('Bom histórico de pagamentos');
    } else {
      explanations.push('Histórico de pagamentos precisa melhorar');
    }
    
    if (features[1] < 30) {
      explanations.push('Baixa utilização de crédito');
    } else if (features[1] < 50) {
      explanations.push('Utilização moderada de crédito');
    } else {
      explanations.push('Alta utilização de crédito');
    }
    
    if (features[2] > 5) {
      explanations.push('Longo histórico de crédito');
    } else if (features[2] > 2) {
      explanations.push('Histórico de crédito moderado');
    } else {
      explanations.push('Histórico de crédito curto');
    }
    
    return explanations.join('. ');
  }

  /**
   * Analisa fatores que afetam o score
   */
  private analyzeFactors(features: number[]): any[] {
    const factors = [
      { name: 'Histórico de Pagamentos', value: features[0], impact: 'Alto' },
      { name: 'Utilização de Crédito', value: features[1], impact: 'Alto' },
      { name: 'Idade do Crédito', value: features[2], impact: 'Médio' },
      { name: 'Mix de Crédito', value: features[3], impact: 'Médio' },
      { name: 'Novas Consultas', value: features[4], impact: 'Baixo' },
      { name: 'Renda', value: features[5], impact: 'Médio' },
      { name: 'Dívida/Renda', value: features[6], impact: 'Alto' },
      { name: 'Tempo de Emprego', value: features[7], impact: 'Médio' },
      { name: 'Status de Moradia', value: features[8], impact: 'Baixo' },
      { name: 'Nível de Educação', value: features[9], impact: 'Baixo' }
    ];
    
    return factors;
  }

  /**
   * Gera recomendações para melhorar o score
   */
  private generateRecommendations(features: number[], score: number): string[] {
    const recommendations = [];
    
    if (features[0] < 70) {
      recommendations.push('Pague todas as contas em dia para melhorar seu histórico');
    }
    
    if (features[1] > 30) {
      recommendations.push('Reduza a utilização do seu crédito para menos de 30%');
    }
    
    if (features[2] < 3) {
      recommendations.push('Mantenha contas antigas abertas para aumentar a idade do crédito');
    }
    
    if (features[4] > 3) {
      recommendations.push('Evite fazer muitas consultas de crédito em pouco tempo');
    }
    
    if (features[6] > 40) {
      recommendations.push('Reduza sua dívida para melhorar a relação dívida/renda');
    }
    
    return recommendations;
  }

  /**
   * Calcula MSE
   */
  private calculateMSE(predictions: Float32Array, labels: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.pow(predictions[i] - labels[i], 2);
    }
    return sum / predictions.length;
  }

  /**
   * Calcula MAE
   */
  private calculateMAE(predictions: Float32Array, labels: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.abs(predictions[i] - labels[i]);
    }
    return sum / predictions.length;
  }

  /**
   * Calcula R²
   */
  private calculateR2(predictions: Float32Array, labels: Float32Array): number {
    const mean = labels.reduce((a, b) => a + b, 0) / labels.length;
    const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - labels[i], 2), 0);
    const ssTot = labels.reduce((sum, label) => sum + Math.pow(label - mean, 2), 0);
    return 1 - (ssRes / ssTot);
  }

  /**
   * Calcula acurácia
   */
  private calculateAccuracy(predictions: Float32Array, labels: Float32Array): number {
    let correct = 0;
    const threshold = 0.1; // 10% de tolerância
    
    for (let i = 0; i < predictions.length; i++) {
      if (Math.abs(predictions[i] - labels[i]) <= threshold) {
        correct++;
      }
    }
    
    return correct / predictions.length;
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

export const creditScoreModel = new CreditScoreModel({
  inputFeatures: 10,
  learningRate: 0.001,
  epochs: 100,
  batchSize: 32
});
