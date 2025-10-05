/**
 * Credit Score ML Model - Modelo de Machine Learning para Score de Crédito
 * 
 * Implementa modelo de ML para cálculo de score de crédito usando TensorFlow.js
 */

import * as tf from '@tensorflow/tfjs-node';

export interface CreditScoreFeatures {
  // Histórico de pagamentos
  paymentHistory: number; // 0-1 (taxa de pagamentos em dia)
  averagePaymentDelay: number; // dias de atraso médio
  
  // Utilização de crédito
  creditUtilization: number; // 0-1 (percentual do limite usado)
  maxUtilization: number; // maior utilização nos últimos 12 meses
  
  // Idade do crédito
  creditAge: number; // meses desde o primeiro crédito
  oldestAccountAge: number; // idade da conta mais antiga
  
  // Diversidade
  creditMix: number; // 0-1 (diversidade de tipos de crédito)
  accountTypes: number; // número de tipos diferentes
  
  // Novas consultas
  recentInquiries: number; // consultas nos últimos 6 meses
  totalInquiries: number; // total de consultas
  
  // Comportamentais
  transactionFrequency: number; // transações por mês
  averageTransactionAmount: number; // valor médio das transações
  incomeStability: number; // 0-1 (estabilidade da renda)
  
  // Demográficos
  age: number; // idade do usuário
  income: number; // renda mensal
  employmentLength: number; // tempo no emprego atual
}

export interface CreditScorePrediction {
  score: number; // 300-850
  confidence: number; // 0-1
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditAge: number;
    creditMix: number;
    newCredit: number;
  };
  explanation: string;
  recommendations: string[];
}

export class CreditScoreModel {
  private model: tf.LayersModel | null = null;
  private isLoaded: boolean = false;
  private modelPath: string;

  constructor(modelPath: string = './models/credit-score-model.json') {
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
        console.log('✅ Modelo de Credit Score carregado com sucesso');
      } catch (error) {
        // Se não existir, criar modelo padrão
        console.log('⚠️ Modelo não encontrado, criando modelo padrão...');
        this.model = await this.createDefaultModel();
        await this.saveModel();
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('❌ Erro ao carregar modelo de Credit Score:', error);
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
          inputShape: [12], // 12 features
          units: 64,
          activation: 'relu',
          name: 'dense1'
        }),
        
        // Camada oculta 1
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          name: 'dense2'
        }),
        
        // Dropout para regularização
        tf.layers.dropout({
          rate: 0.2,
          name: 'dropout1'
        }),
        
        // Camada oculta 2
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          name: 'dense3'
        }),
        
        // Camada de saída
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid', // 0-1, depois escalado para 300-850
          name: 'output'
        })
      ]
    });

    // Compilar modelo
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
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
  prepareFeatures(data: CreditScoreFeatures): tf.Tensor {
    const features = [
      data.paymentHistory,
      data.averagePaymentDelay / 30, // normalizar para meses
      data.creditUtilization,
      data.maxUtilization,
      data.creditAge / 120, // normalizar (10 anos = 1)
      data.oldestAccountAge / 120,
      data.creditMix,
      data.accountTypes / 10, // normalizar
      data.recentInquiries / 10, // normalizar
      data.totalInquiries / 20, // normalizar
      data.transactionFrequency / 30, // normalizar
      data.incomeStability
    ];

    return tf.tensor2d([features]);
  }

  /**
   * Faz predição do score
   */
  async predict(features: CreditScoreFeatures): Promise<CreditScorePrediction> {
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
      
      // Escalar para 300-850
      const rawScore = predictionArray[0];
      const score = Math.round(300 + (rawScore * 550));
      
      // Calcular confiança baseada na consistência dos fatores
      const confidence = this.calculateConfidence(features);
      
      // Calcular fatores individuais
      const factors = this.calculateFactors(features);
      
      // Gerar explicação
      const explanation = this.generateExplanation(score, factors);
      
      // Gerar recomendações
      const recommendations = this.generateRecommendations(features, score);
      
      return {
        score: Math.max(300, Math.min(850, score)),
        confidence,
        factors,
        explanation,
        recommendations
      };
    } catch (error) {
      console.error('❌ Erro na predição do modelo:', error);
      throw error;
    }
  }

  /**
   * Calcula confiança da predição
   */
  private calculateConfidence(features: CreditScoreFeatures): number {
    let confidence = 0.5; // Base
    
    // Mais dados = maior confiança
    if (features.creditAge > 24) confidence += 0.2;
    if (features.creditAge > 60) confidence += 0.1;
    
    // Histórico consistente = maior confiança
    if (features.paymentHistory > 0.9) confidence += 0.1;
    if (features.paymentHistory > 0.95) confidence += 0.1;
    
    // Diversidade = maior confiança
    if (features.accountTypes > 2) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  /**
   * Calcula fatores individuais
   */
  private calculateFactors(features: CreditScoreFeatures) {
    return {
      paymentHistory: Math.round(features.paymentHistory * 100),
      creditUtilization: Math.round((1 - features.creditUtilization) * 100),
      creditAge: Math.round(Math.min(features.creditAge / 10, 1) * 100),
      creditMix: Math.round(features.creditMix * 100),
      newCredit: Math.round((1 - Math.min(features.recentInquiries / 5, 1)) * 100)
    };
  }

  /**
   * Gera explicação do score
   */
  private generateExplanation(score: number, factors: any): string {
    let explanation = `Seu score de ${score} foi calculado considerando:\n\n`;
    
    explanation += `📊 **Histórico de Pagamentos (${factors.paymentHistory}%)**: `;
    if (factors.paymentHistory >= 90) {
      explanation += "Excelente! Você paga sempre em dia.\n";
    } else if (factors.paymentHistory >= 70) {
      explanation += "Bom, mas pode melhorar a pontualidade.\n";
    } else {
      explanation += "Precisa melhorar - atrasos prejudicam o score.\n";
    }
    
    explanation += `💰 **Utilização de Crédito (${factors.creditUtilization}%)**: `;
    if (factors.creditUtilization >= 80) {
      explanation += "Ótima utilização! Mantenha baixo uso.\n";
    } else if (factors.creditUtilization >= 60) {
      explanation += "Utilização moderada, tente reduzir.\n";
    } else {
      explanation += "Utilização alta está prejudicando.\n";
    }
    
    explanation += `⏰ **Idade do Crédito (${factors.creditAge}%)**: `;
    if (factors.creditAge >= 80) {
      explanation += "Excelente histórico longo.\n";
    } else if (factors.creditAge >= 60) {
      explanation += "Histórico em construção, continue.\n";
    } else {
      explanation += "Histórico muito curto, precisa de tempo.\n";
    }
    
    explanation += `🔄 **Diversidade (${factors.creditMix}%)**: `;
    if (factors.creditMix >= 80) {
      explanation += "Ótima diversidade de produtos.\n";
    } else if (factors.creditMix >= 60) {
      explanation += "Diversidade moderada, explore novos tipos.\n";
    } else {
      explanation += "Pouca diversidade, experimente novos produtos.\n";
    }
    
    explanation += `🔍 **Novas Consultas (${factors.newCredit}%)**: `;
    if (factors.newCredit >= 80) {
      explanation += "Poucas consultas recentes, excelente!\n";
    } else if (factors.newCredit >= 60) {
      explanation += "Consultas moderadas, evite muitas simultâneas.\n";
    } else {
      explanation += "Muitas consultas recentes prejudicam o score.\n";
    }
    
    return explanation;
  }

  /**
   * Gera recomendações personalizadas
   */
  private generateRecommendations(features: CreditScoreFeatures, score: number): string[] {
    const recommendations: string[] = [];
    
    if (features.paymentHistory < 0.9) {
      recommendations.push("Configure lembretes ou débito automático para pagar sempre em dia");
    }
    
    if (features.creditUtilization > 0.3) {
      recommendations.push("Reduza a utilização do cartão de crédito para menos de 30%");
    }
    
    if (features.creditAge < 24) {
      recommendations.push("Mantenha contas antigas abertas para aumentar a idade do crédito");
    }
    
    if (features.accountTypes < 2) {
      recommendations.push("Diversifique seus tipos de crédito (cartão, empréstimo, financiamento)");
    }
    
    if (features.recentInquiries > 3) {
      recommendations.push("Evite muitas consultas de crédito simultâneas");
    }
    
    if (score < 650) {
      recommendations.push("Foque em melhorar a pontualidade dos pagamentos");
    }
    
    if (score >= 750) {
      recommendations.push("Parabéns! Continue mantendo essas boas práticas");
    }
    
    return recommendations;
  }

  /**
   * Treina o modelo com dados históricos
   */
  async train(trainingData: Array<{features: CreditScoreFeatures, score: number}>): Promise<void> {
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // Preparar dados de treino
      const features = trainingData.map(d => this.prepareFeatures(d.features));
      const labels = trainingData.map(d => (d.score - 300) / 550); // Normalizar para 0-1
      
      const X = tf.concat(features);
      const y = tf.tensor1d(labels);
      
      // Treinar modelo
      const history = await this.model!.fit(X, y, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Época ${epoch}: loss = ${logs?.loss?.toFixed(4)}`);
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
  async evaluate(testData: Array<{features: CreditScoreFeatures, score: number}>): Promise<any> {
    if (!this.model) {
      throw new Error('Modelo não carregado');
    }

    try {
      const features = testData.map(d => this.prepareFeatures(d.features));
      const labels = testData.map(d => (d.score - 300) / 550);
      
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
