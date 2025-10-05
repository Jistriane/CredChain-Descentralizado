/**
 * Logger Utility - Sistema de logging para ElizaOS
 * 
 * Implementa logging estruturado com diferentes níveis e formatação
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  metadata?: any;
  userId?: string;
  agentName?: string;
  traceId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  logFile?: string;
  remoteEndpoint?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

export class Logger {
  private config: LoggerConfig;
  private context: string;
  private agentName?: string;

  constructor(context: string = 'ElizaOS', agentName?: string, config?: Partial<LoggerConfig>) {
    this.context = context;
    this.agentName = agentName;
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };
  }

  /**
   * Log de erro
   */
  error(message: string, metadata?: any, userId?: string): void {
    this.log(LogLevel.ERROR, message, metadata, userId);
  }

  /**
   * Log de warning
   */
  warn(message: string, metadata?: any, userId?: string): void {
    this.log(LogLevel.WARN, message, metadata, userId);
  }

  /**
   * Log de informação
   */
  info(message: string, metadata?: any, userId?: string): void {
    this.log(LogLevel.INFO, message, metadata, userId);
  }

  /**
   * Log de debug
   */
  debug(message: string, metadata?: any, userId?: string): void {
    this.log(LogLevel.DEBUG, message, metadata, userId);
  }

  /**
   * Log de trace
   */
  trace(message: string, metadata?: any, userId?: string): void {
    this.log(LogLevel.TRACE, message, metadata, userId);
  }

  /**
   * Log estruturado
   */
  private log(level: LogLevel, message: string, metadata?: any, userId?: string): void {
    if (level > this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: this.context,
      metadata,
      userId,
      agentName: this.agentName,
      traceId: this.generateTraceId()
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File logging
    if (this.config.enableFile && this.config.logFile) {
      this.logToFile(entry);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(entry);
    }
  }

  /**
   * Log para console com cores
   */
  private logToConsole(entry: LogEntry): void {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[35m', // Magenta
      TRACE: '\x1b[37m'  // White
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level as keyof typeof colors] || '';
    
    const prefix = `${color}[${entry.timestamp}] [${entry.level}] [${entry.context}]${reset}`;
    const agentPrefix = entry.agentName ? ` [${entry.agentName}]` : '';
    const userPrefix = entry.userId ? ` [User: ${entry.userId}]` : '';
    
    console.log(`${prefix}${agentPrefix}${userPrefix}: ${entry.message}`);
    
    if (entry.metadata) {
      console.log(`${color}Metadata:${reset}`, JSON.stringify(entry.metadata, null, 2));
    }
  }

  /**
   * Log para arquivo
   */
  private async logToFile(entry: LogEntry): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logLine = JSON.stringify(entry) + '\n';
      const logPath = this.config.logFile!;
      
      // Verificar tamanho do arquivo
      try {
        const stats = await fs.stat(logPath);
        if (stats.size > this.config.maxFileSize!) {
          await this.rotateLogFile();
        }
      } catch (error) {
        // Arquivo não existe, criar
      }
      
      await fs.appendFile(logPath, logLine);
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  /**
   * Rotacionar arquivo de log
   */
  private async rotateLogFile(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logPath = this.config.logFile!;
      const dir = path.dirname(logPath);
      const ext = path.extname(logPath);
      const base = path.basename(logPath, ext);
      
      // Mover arquivos existentes
      for (let i = this.config.maxFiles! - 1; i > 0; i--) {
        const oldFile = path.join(dir, `${base}.${i}${ext}`);
        const newFile = path.join(dir, `${base}.${i + 1}${ext}`);
        
        try {
          await fs.rename(oldFile, newFile);
        } catch (error) {
          // Arquivo não existe, continuar
        }
      }
      
      // Mover arquivo atual
      const rotatedFile = path.join(dir, `${base}.1${ext}`);
      await fs.rename(logPath, rotatedFile);
    } catch (error) {
      console.error('Erro ao rotacionar arquivo de log:', error);
    }
  }

  /**
   * Log para endpoint remoto
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    try {
      const response = await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        console.error('Erro ao enviar log remoto:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao enviar log remoto:', error);
    }
  }

  /**
   * Gerar trace ID único
   */
  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Criar logger para agente específico
   */
  static forAgent(agentName: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger('ElizaOS', agentName, config);
  }

  /**
   * Criar logger para contexto específico
   */
  static forContext(context: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger(context, undefined, config);
  }

  /**
   * Configurar logger global
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.globalConfig = { ...Logger.globalConfig, ...config };
  }

  private static globalConfig: Partial<LoggerConfig> = {};

  /**
   * Obter configuração atual
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Atualizar configuração
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, metadata?: any): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...metadata,
      operation,
      duration,
      type: 'performance'
    });
  }

  /**
   * Log de métricas
   */
  metrics(name: string, value: number, tags?: Record<string, string>): void {
    this.info(`Metric: ${name} = ${value}`, {
      name,
      value,
      tags,
      type: 'metric'
    });
  }

  /**
   * Log de evento de negócio
   */
  businessEvent(event: string, data: any, userId?: string): void {
    this.info(`Business Event: ${event}`, {
      event,
      data,
      userId,
      type: 'business_event'
    });
  }

  /**
   * Log de erro de sistema
   */
  systemError(error: Error, context?: string): void {
    this.error(`System Error: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      type: 'system_error'
    });
  }

  /**
   * Log de segurança
   */
  security(event: string, details: any, userId?: string): void {
    this.warn(`Security Event: ${event}`, {
      event,
      details,
      userId,
      type: 'security'
    });
  }
}

// Exportar instância padrão
export const logger = new Logger('ElizaOS');

// Exportar funções de conveniência
export const logError = (message: string, metadata?: any, userId?: string) => 
  logger.error(message, metadata, userId);

export const logWarn = (message: string, metadata?: any, userId?: string) => 
  logger.warn(message, metadata, userId);

export const logInfo = (message: string, metadata?: any, userId?: string) => 
  logger.info(message, metadata, userId);

export const logDebug = (message: string, metadata?: any, userId?: string) => 
  logger.debug(message, metadata, userId);

export const logTrace = (message: string, metadata?: any, userId?: string) => 
  logger.trace(message, metadata, userId);