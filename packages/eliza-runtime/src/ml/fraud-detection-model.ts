/**
 * Fraud Detection ML Model - Modelo de Machine Learning para Detecção de Fraude
 * 
 * Implementa modelo de ML para detecção de fraudes usando TensorFlow.js
 */

import * as tf from '@tensorflow/tfjs-node';

export interface FraudFeatures {
  // Features temporais
  hour: number; // 0-23
  dayOfWeek: number; // 0-6
  isWeekend: boolean; // 0 ou 1
  isHoliday: boolean; // 0 ou 1
  
  // Features de valor
  amount: number; // valor da transação
  amountRatio: number; // razão com valor médio do usuário
  isRoundAmount: boolean; // valor redondo (ex: 100, 1000)
  
  // Features de localização
  location: string; // localização da transação
  isNewLocation: boolean; // nova localização
  distanceFromHome: number; // distância da localização usual
  
  // Features de dispositivo
  device: string; // tipo de dispositivo
  isNewDevice: boolean; // novo dispositivo
  deviceTrustScore: number; // 0-1 (confiança no dispositivo)
  
  // Features comportamentais
  loginFrequency: number; // logins por dia
  transactionFrequency: number; // transações por dia
  averageTransactionAmount: number; // valor médio das transações
  spendingPattern: number; // 0-1 (padrão de gastos)
  
  // Features de risco
  riskScore: number; // 0-1 (score de risco do usuário)
  creditUtilization: number; // 0-1 (utilização de crédito)
  recentDeclines: number; // recusas recentes
  
  // Features de rede
  ipReputation: number; // 0-1 (reputação do IP)
  vpnDetection: boolean; // 0 ou 1
  proxyDetection: boolean; // 0 ou 1
}

export interface FraudPrediction {
  isFraudulent: boolean;
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    temporal: number;
    amount: number;
    location: number;
    device: number;
    behavioral: number;
    network: number;
  };
  explanation: string;
  recommendations: string[];
}

export class FraudDetectionModel {
  private model: tf.LayersModel | null = null;
  private isLoaded: boolean = false;
  private modelPath: string;

  constructor(modelPath: string = './models/fraud-detection-model.json') {
    this.modelPath = modelPath;
  }

  /**
   * Carrega o modelo de ML
   */
  async loadModel(): Promise<void> {
    try {
      if (this.isLoaded) {
        return;
      }

      // Tentar carregar modelo existente
      try {
        this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
        console.log('✅ Modelo de Fraud Detection carregado com sucesso');
      } catch (error) {
        // Se não existir, criar modelo padrão
        console.log('⚠️ Modelo não encontrado, criando modelo padrão...');
        this.model = await this.createDefaultModel();
        await this.saveModel();
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('❌ Erro ao carregar modelo de Fraud Detection:', error);
      throw error;
    }
  }

  /**
   * Cria modelo padrão se não existir
   */
  private async createDefaultModel(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        // Camada de entrada
        tf.layers.dense({
          inputShape: [20], // 20 features
          units: 128,
          activation: 'relu',
          name: 'dense1'
        }),
        
        // Camada oculta 1
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          name: 'dense2'
        }),
        
        // Dropout para regularização
        tf.layers.dropout({
          rate: 0.3,
          name: 'dropout1'
        }),
        
        // Camada oculta 2
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          name: 'dense3'
        }),
        
        // Dropout adicional
        tf.layers.dropout({
          rate: 0.2,
          name: 'dropout2'
        }),
        
        // Camada de saída
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid', // 0-1 (probabilidade de fraude)
          name: 'output'
        })
      ]
    });

    // Compilar modelo
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  /**
   * Salva o modelo
   */
  async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Modelo não carregado');
    }

    try {
      await this.model.save(`file://${this.modelPath}`);
      console.log('✅ Modelo salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar modelo:', error);
    }
  }

  /**
   * Prepara features para o modelo
   */
  prepareFeatures(data: FraudFeatures): tf.Tensor {
    const features = [
      // Temporais
      data.hour / 24, // normalizar
      data.dayOfWeek / 7, // normalizar
      data.isWeekend ? 1 : 0,
      data.isHoliday ? 1 : 0,
      
      // Valor
      Math.log(data.amount + 1) / 10, // log normalizar
      data.amountRatio,
      data.isRoundAmount ? 1 : 0,
      
      // Localização
      data.isNewLocation ? 1 : 0,
      Math.min(data.distanceFromHome / 1000, 1), // normalizar km
      
      // Dispositivo
      data.isNewDevice ? 1 : 0,
      data.deviceTrustScore,
      
      // Comportamentais
      Math.min(data.loginFrequency / 10, 1), // normalizar
      Math.min(data.transactionFrequency / 10, 1), // normalizar
      Math.log(data.averageTransactionAmount + 1) / 10, // log normalizar
      data.spendingPattern,
      
      // Risco
      data.riskScore,
      data.creditUtilization,
      Math.min(data.recentDeclines / 5, 1), // normalizar
      
      // Rede
      data.ipReputation,
      data.vpnDetection ? 1 : 0,
      data.proxyDetection ? 1 : 0
    ];

    return tf.tensor2d([features]);
  }

  /**
   * Faz predição de fraude
   */
  async predict(features: FraudFeatures): Promise<FraudPrediction> {
    if (!this.model || !this.isLoaded) {
      await this.loadModel();
    }

    try {
      // Preparar features
      const inputTensor = this.prepareFeatures(features);
      
      // Fazer predição
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const predictionArray = await prediction.data();
      
      // Limpar tensors
      inputTensor.dispose();
      prediction.dispose();
      
      // Obter probabilidade de fraude
      const fraudProbability = predictionArray[0];
      const isFraudulent = fraudProbability > 0.5;
      
      // Calcular confiança
      const confidence = Math.abs(fraudProbability - 0.5) * 2; // 0-1
      
      // Determinar nível de risco
      const riskLevel = this.determineRiskLevel(fraudProbability);
      
      // Calcular fatores individuais
      const factors = this.calculateFactors(features);
      
      // Gerar explicação
      const explanation = this.generateExplanation(isFraudulent, fraudProbability, factors);
      
      // Gerar recomendações
      const recommendations = this.generateRecommendations(features, isFraudulent);
      
      return {
        isFraudulent,
        confidence,
        riskLevel,
        factors,
        explanation,
        recommendations
      };
    } catch (error) {
      console.error('❌ Erro na predição de fraude:', error);
      throw error;
    }
  }

  /**
   * Determina nível de risco
   */
  private determineRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calcula fatores individuais
   */
  private calculateFactors(features: FraudFeatures) {
    return {
      temporal: this.calculateTemporalRisk(features),
      amount: this.calculateAmountRisk(features),
      location: this.calculateLocationRisk(features),
      device: this.calculateDeviceRisk(features),
      behavioral: this.calculateBehavioralRisk(features),
      network: this.calculateNetworkRisk(features)
    };
  }

  /**
   * Calcula risco temporal
   */
  private calculateTemporalRisk(features: FraudFeatures): number {
    let risk = 0;
    
    // Horário suspeito (madrugada)
    if (features.hour >= 2 && features.hour <= 5) risk += 0.3;
    
    // Fim de semana
    if (features.isWeekend) risk += 0.1;
    
    // Feriado
    if (features.isHoliday) risk += 0.2;
    
    return Math.min(1, risk);
  }

  /**
   * Calcula risco de valor
   */
  private calculateAmountRisk(features: FraudFeatures): number {
    let risk = 0;
    
    // Valor muito alto
    if (features.amountRatio > 5) risk += 0.4;
    else if (features.amountRatio > 3) risk += 0.2;
    
    // Valor redondo (suspeito)
    if (features.isRoundAmount) risk += 0.1;
    
    return Math.min(1, risk);
  }

  /**
   * Calcula risco de localização
   */
  private calculateLocationRisk(features: FraudFeatures): number {
    let risk = 0;
    
    // Nova localização
    if (features.isNewLocation) risk += 0.3;
    
    // Distância da localização usual
    if (features.distanceFromHome > 100) risk += 0.2;
    else if (features.distanceFromHome > 50) risk += 0.1;
    
    return Math.min(1, risk);
  }

  /**
   * Calcula risco de dispositivo
   */
  private calculateDeviceRisk(features: FraudFeatures): number {
    let risk = 0;
    
    // Novo dispositivo
    if (features.isNewDevice) risk += 0.4;
    
    // Baixa confiança no dispositivo
    if (features.deviceTrustScore < 0.5) risk += 0.3;
    
    return Math.min(1, risk);
  }

  /**
   * Calcula risco comportamental
   */
  private calculateBehavioralRisk(features: FraudFeatures): number {
    let risk = 0;
    
    // Alta frequência de transações
    if (features.transactionFrequency > 5) risk += 0.2;
    
    // Padrão de gastos anômalo
    if (features.spendingPattern < 0.3) risk += 0.3;
    
    // Alto score de risco
    if (features.riskScore > 0.7) risk += 0.2;
    
    return Math.min(1, risk);
  }

  /**
   * Calcula risco de rede
   */
  private calculateNetworkRisk(features: FraudFeatures): number {
    let risk = 0;
    
    // Baixa reputação do IP
    if (features.ipReputation < 0.3) risk += 0.4;
    
    // VPN detectado
    if (features.vpnDetection) risk += 0.3;
    
    // Proxy detectado
    if (features.proxyDetection) risk += 0.2;
    
    return Math.min(1, risk);
  }

  /**
   * Gera explicação da predição
   */
  private generateExplanation(isFraudulent: boolean, probability: number, factors: any): string {
    let explanation = isFraudulent 
      ? `🚨 **FRAUDE DETECTADA** (${Math.round(probability * 100)}% de probabilidade)\n\n`
      : `✅ **Transação Segura** (${Math.round((1 - probability) * 100)}% de confiança)\n\n`;
    
    explanation += "**📊 Análise Detalhada**:\n\n";
    
    explanation += `🕐 **Fator Temporal**: ${Math.round(factors.temporal * 100)}%\n`;
    if (factors.temporal > 0.5) {
      explanation += "• Horário suspeito ou padrão anômalo\n";
    }
    
    explanation += `💰 **Fator Valor**: ${Math.round(factors.amount * 100)}%\n`;
    if (factors.amount > 0.5) {
      explanation += "• Valor muito alto ou padrão suspeito\n";
    }
    
    explanation += `📍 **Fator Localização**: ${Math.round(factors.location * 100)}%\n`;
    if (factors.location > 0.5) {
      explanation += "• Nova localização ou distância suspeita\n";
    }
    
    explanation += `📱 **Fator Dispositivo**: ${Math.round(factors.device * 100)}%\n`;
    if (factors.device > 0.5) {
      explanation += "• Novo dispositivo ou baixa confiança\n";
    }
    
    explanation += `👤 **Fator Comportamental**: ${Math.round(factors.behavioral * 100)}%\n`;
    if (factors.behavioral > 0.5) {
      explanation += "• Padrão de comportamento anômalo\n";
    }
    
    explanation += `🌐 **Fator Rede**: ${Math.round(factors.network * 100)}%\n`;
    if (factors.network > 0.5) {
      explanation += "• IP suspeito ou uso de VPN/Proxy\n";
    }
    
    return explanation;
  }

  /**
   * Gera recomendações
   */
  private generateRecommendations(features: FraudFeatures, isFraudulent: boolean): string[] {
    const recommendations: string[] = [];
    
    if (isFraudulent) {
      recommendations.push("🚨 BLOQUEAR transação imediatamente");
      recommendations.push("📞 Notificar equipe de segurança");
      recommendations.push("🔍 Investigar histórico do usuário");
      recommendations.push("📧 Enviar alerta de segurança");
    } else {
      if (features.isNewLocation) {
        recommendations.push("📍 Verificar localização com usuário");
      }
      
      if (features.isNewDevice) {
        recommendations.push("📱 Confirmar novo dispositivo");
      }
      
      if (features.amountRatio > 2) {
        recommendations.push("💰 Verificar valor da transação");
      }
      
      if (features.vpnDetection || features.proxyDetection) {
        recommendations.push("🌐 Verificar uso de VPN/Proxy");
      }
    }
    
    return recommendations;
  }

  /**
   * Treina o modelo com dados históricos
   */
  async train(trainingData: Array<{features: FraudFeatures, isFraud: boolean}>): Promise<void> {
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // Preparar dados de treino
      const features = trainingData.map(d => this.prepareFeatures(d.features));
      const labels = trainingData.map(d => d.isFraud ? 1 : 0);
      
      const X = tf.concat(features);
      const y = tf.tensor1d(labels);
      
      // Treinar modelo
      const history = await this.model!.fit(X, y, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Época ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        }
      });
      
      // Limpar tensors
      features.forEach(t => t.dispose());
      X.dispose();
      y.dispose();
      
      console.log('✅ Modelo treinado com sucesso');
      
      // Salvar modelo atualizado
      await this.saveModel();
    } catch (error) {
      console.error('❌ Erro no treinamento do modelo:', error);
      throw error;
    }
  }

  /**
   * Avalia o modelo
   */
  async evaluate(testData: Array<{features: FraudFeatures, isFraud: boolean}>): Promise<any> {
    if (!this.model) {
      throw new Error('Modelo não carregado');
    }

    try {
      const features = testData.map(d => this.prepareFeatures(d.features));
      const labels = testData.map(d => d.isFraud ? 1 : 0);
      
      const X = tf.concat(features);
      const y = tf.tensor1d(labels);
      
      const evaluation = this.model.evaluate(X, y);
      
      // Limpar tensors
      features.forEach(t => t.dispose());
      X.dispose();
      y.dispose();
      
      return evaluation;
    } catch (error) {
      console.error('❌ Erro na avaliação do modelo:', error);
      throw error;
    }
  }

  /**
   * Obtém status do modelo
   */
  getStatus(): any {
    return {
      loaded: this.isLoaded,
      modelPath: this.modelPath,
      hasModel: this.model !== null
    };
  }
}
