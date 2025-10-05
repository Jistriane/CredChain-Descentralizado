/**
 * Model Serving Infrastructure
 * 
 * Servidor para servir modelos ML treinados
 */

import express from 'express';
import * as tf from '@tensorflow/tfjs-node';
import { Logger } from '../../utils/logger';
import { Config } from '../../utils/config';

export interface ModelPrediction {
  modelName: string;
  prediction: any;
  confidence: number;
  processingTime: number;
  timestamp: string;
}

export interface ModelInfo {
  name: string;
  version: string;
  type: 'credit_score' | 'fraud_detection';
  status: 'loading' | 'ready' | 'error';
  lastUpdated: string;
  metrics?: any;
}

export class ModelServer {
  private app: express.Application;
  private logger: Logger;
  private config: Config;
  private models: Map<string, tf.LayersModel> = new Map();
  private modelInfo: Map<string, ModelInfo> = new Map();

  constructor() {
    this.app = express();
    this.logger = new Logger('ModelServer');
    this.config = Config.getInstance();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Configurar middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  /**
   * Configurar rotas
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Listar modelos
    this.app.get('/models', (req, res) => {
      const models = Array.from(this.modelInfo.values());
      res.json({ models });
    });

    // Informações de um modelo específico
    this.app.get('/models/:modelName', (req, res) => {
      const { modelName } = req.params;
      const modelInfo = this.modelInfo.get(modelName);
      
      if (!modelInfo) {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
      
      res.json(modelInfo);
    });

    // Predição de credit score
    this.app.post('/predict/credit-score', async (req, res) => {
      try {
        const { features, userId } = req.body;
        
        if (!features || !Array.isArray(features)) {
          return res.status(400).json({ error: 'Features são obrigatórias' });
        }

        const prediction = await this.predictCreditScore(features);
        
        res.json({
          modelName: 'credit-score',
          prediction: prediction.score,
          confidence: prediction.confidence,
          processingTime: prediction.processingTime,
          timestamp: new Date().toISOString(),
          userId
        });
      } catch (error) {
        this.logger.error('Erro na predição de credit score:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // Predição de detecção de fraude
    this.app.post('/predict/fraud-detection', async (req, res) => {
      try {
        const { features, userId, transactionId } = req.body;
        
        if (!features || !Array.isArray(features)) {
          return res.status(400).json({ error: 'Features são obrigatórias' });
        }

        const prediction = await this.predictFraudDetection(features);
        
        res.json({
          modelName: 'fraud-detection',
          prediction: {
            isFraud: prediction.isFraud,
            confidence: prediction.confidence,
            riskLevel: this.getRiskLevel(prediction.confidence)
          },
          processingTime: prediction.processingTime,
          timestamp: new Date().toISOString(),
          userId,
          transactionId
        });
      } catch (error) {
        this.logger.error('Erro na predição de fraude:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // Batch prediction
    this.app.post('/predict/batch', async (req, res) => {
      try {
        const { requests } = req.body;
        
        if (!requests || !Array.isArray(requests)) {
          return res.status(400).json({ error: 'Requests são obrigatórias' });
        }

        const predictions = await Promise.all(
          requests.map(async (request: any) => {
            const startTime = Date.now();
            
            let prediction;
            if (request.modelType === 'credit-score') {
              prediction = await this.predictCreditScore(request.features);
            } else if (request.modelType === 'fraud-detection') {
              prediction = await this.predictFraudDetection(request.features);
            } else {
              throw new Error('Tipo de modelo inválido');
            }
            
            return {
              ...prediction,
              processingTime: Date.now() - startTime,
              requestId: request.id
            };
          })
        );
        
        res.json({ predictions });
      } catch (error) {
        this.logger.error('Erro na predição em lote:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });

    // Métricas dos modelos
    this.app.get('/models/:modelName/metrics', (req, res) => {
      const { modelName } = req.params;
      const modelInfo = this.modelInfo.get(modelName);
      
      if (!modelInfo) {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
      
      res.json(modelInfo.metrics || {});
    });
  }

  /**
   * Carregar modelo
   */
  async loadModel(name: string, path: string, type: 'credit_score' | 'fraud_detection'): Promise<void> {
    try {
      this.logger.info(`Carregando modelo: ${name} de ${path}`);
      
      // Atualizar status para loading
      this.modelInfo.set(name, {
        name,
        version: '1.0.0',
        type,
        status: 'loading',
        lastUpdated: new Date().toISOString()
      });

      // Carregar modelo
      const model = await tf.loadLayersModel(`file://${path}`);
      this.models.set(name, model);

      // Atualizar status para ready
      this.modelInfo.set(name, {
        name,
        version: '1.0.0',
        type,
        status: 'ready',
        lastUpdated: new Date().toISOString()
      });

      this.logger.info(`Modelo ${name} carregado com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao carregar modelo ${name}:`, error);
      
      // Atualizar status para error
      this.modelInfo.set(name, {
        name,
        version: '1.0.0',
        type,
        status: 'error',
        lastUpdated: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Predição de credit score
   */
  async predictCreditScore(features: number[]): Promise<{ score: number; confidence: number; processingTime: number }> {
    const startTime = Date.now();
    
    const model = this.models.get('credit-score');
    if (!model) {
      throw new Error('Modelo de credit score não carregado');
    }

    try {
      const input = tf.tensor2d([features]);
      const prediction = model.predict(input) as tf.Tensor2D;
      const result = await prediction.data();
      
      const score = Math.max(0, Math.min(1000, result[0]));
      const confidence = this.calculateConfidence(score, features);
      
      input.dispose();
      prediction.dispose();
      
      return {
        score,
        confidence,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Erro na predição de credit score:', error);
      throw error;
    }
  }

  /**
   * Predição de detecção de fraude
   */
  async predictFraudDetection(features: number[]): Promise<{ isFraud: boolean; confidence: number; processingTime: number }> {
    const startTime = Date.now();
    
    const model = this.models.get('fraud-detection');
    if (!model) {
      throw new Error('Modelo de detecção de fraude não carregado');
    }

    try {
      const input = tf.tensor2d([features]);
      const prediction = model.predict(input) as tf.Tensor2D;
      const result = await prediction.data();
      
      const confidence = result[0];
      const isFraud = confidence > 0.5;
      
      input.dispose();
      prediction.dispose();
      
      return {
        isFraud,
        confidence,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error('Erro na predição de fraude:', error);
      throw error;
    }
  }

  /**
   * Calcular confiança do modelo
   */
  private calculateConfidence(score: number, features: number[]): number {
    // Lógica simplificada para calcular confiança
    const featureVariance = this.calculateVariance(features);
    const baseConfidence = 0.8;
    const variancePenalty = Math.min(featureVariance * 0.1, 0.3);
    
    return Math.max(0.1, baseConfidence - variancePenalty);
  }

  /**
   * Calcular variância dos features
   */
  private calculateVariance(features: number[]): number {
    const mean = features.reduce((sum, val) => sum + val, 0) / features.length;
    const variance = features.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / features.length;
    return Math.sqrt(variance);
  }

  /**
   * Obter nível de risco
   */
  private getRiskLevel(confidence: number): string {
    if (confidence < 0.3) return 'low';
    if (confidence < 0.7) return 'medium';
    return 'high';
  }

  /**
   * Inicializar servidor
   */
  async initialize(): Promise<void> {
    this.logger.info('Inicializando Model Server...');

    try {
      // Carregar modelos
      await this.loadModel('credit-score', './models/credit-score-model', 'credit_score');
      await this.loadModel('fraud-detection', './models/fraud-detection-model', 'fraud_detection');

      this.logger.info('Model Server inicializado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Model Server:', error);
      throw error;
    }
  }

  /**
   * Iniciar servidor
   */
  start(port: number = 3002): void {
    this.app.listen(port, () => {
      this.logger.info(`Model Server rodando na porta ${port}`);
    });
  }

  /**
   * Obter informações dos modelos
   */
  getModelInfo(): ModelInfo[] {
    return Array.from(this.modelInfo.values());
  }

  /**
   * Verificar se modelo está pronto
   */
  isModelReady(modelName: string): boolean {
    const modelInfo = this.modelInfo.get(modelName);
    return modelInfo?.status === 'ready';
  }

  /**
   * Recarregar modelo
   */
  async reloadModel(name: string, path: string, type: 'credit_score' | 'fraud_detection'): Promise<void> {
    this.logger.info(`Recarregando modelo: ${name}`);
    
    // Remover modelo antigo
    const oldModel = this.models.get(name);
    if (oldModel) {
      oldModel.dispose();
    }
    this.models.delete(name);
    
    // Carregar novo modelo
    await this.loadModel(name, path, type);
  }

  /**
   * Limpar recursos
   */
  cleanup(): void {
    this.logger.info('Limpando recursos do Model Server...');
    
    // Dispose dos modelos
    for (const [name, model] of this.models) {
      model.dispose();
      this.logger.info(`Modelo ${name} descartado`);
    }
    
    this.models.clear();
    this.modelInfo.clear();
  }
}

// Script standalone
if (require.main === module) {
  const server = new ModelServer();
  
  server.initialize()
    .then(() => {
      server.start(3002);
    })
    .catch(error => {
      console.error('Erro ao inicializar Model Server:', error);
      process.exit(1);
    });
}
