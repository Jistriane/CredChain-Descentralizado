/**
 * Encryption Service - Sistema de criptografia
 * 
 * Implementa criptografia para dados sensíveis
 */

import crypto from 'crypto';
import { Logger } from '../utils/logger';

export interface EncryptionConfig {
  algorithm: string;
  key: string;
  iv: string;
  saltRounds: number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag?: string;
}

export class EncryptionService {
  private config: EncryptionConfig;
  private logger: Logger;

  constructor(config: EncryptionConfig) {
    this.config = config;
    this.logger = new Logger('EncryptionService');
  }

  /**
   * Criptografar dados
   */
  encrypt(data: string): EncryptedData {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.config.algorithm, this.config.key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted,
        iv: iv.toString('hex'),
      };
    } catch (error) {
      this.logger.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia');
    }
  }

  /**
   * Descriptografar dados
   */
  decrypt(encryptedData: EncryptedData): string {
    try {
      const decipher = crypto.createDecipher(this.config.algorithm, this.config.key);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia');
    }
  }

  /**
   * Criptografar com AES-GCM
   */
  encryptAESGCM(data: string): EncryptedData {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipherGCM(this.config.algorithm, this.config.key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      this.logger.error('Erro ao criptografar com AES-GCM:', error);
      throw new Error('Falha na criptografia AES-GCM');
    }
  }

  /**
   * Descriptografar com AES-GCM
   */
  decryptAESGCM(encryptedData: EncryptedData): string {
    try {
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipherGCM(this.config.algorithm, this.config.key, iv);
      
      if (encryptedData.tag) {
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
      }
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Erro ao descriptografar com AES-GCM:', error);
      throw new Error('Falha na descriptografia AES-GCM');
    }
  }

  /**
   * Gerar hash seguro
   */
  hash(data: string, salt?: string): string {
    try {
      const actualSalt = salt || crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHash('sha256');
      hash.update(data + actualSalt);
      return hash.digest('hex');
    } catch (error) {
      this.logger.error('Erro ao gerar hash:', error);
      throw new Error('Falha na geração de hash');
    }
  }

  /**
   * Verificar hash
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    try {
      const computedHash = this.hash(data, salt);
      return computedHash === hash;
    } catch (error) {
      this.logger.error('Erro ao verificar hash:', error);
      return false;
    }
  }

  /**
   * Gerar chave aleatória
   */
  generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Gerar IV aleatório
   */
  generateIV(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Criptografar campo sensível
   */
  encryptSensitiveField(field: string, value: string): string {
    try {
      const encrypted = this.encrypt(value);
      return JSON.stringify(encrypted);
    } catch (error) {
      this.logger.error('Erro ao criptografar campo sensível:', error);
      throw new Error('Falha na criptografia do campo');
    }
  }

  /**
   * Descriptografar campo sensível
   */
  decryptSensitiveField(field: string, encryptedValue: string): string {
    try {
      const encryptedData = JSON.parse(encryptedValue);
      return this.decrypt(encryptedData);
    } catch (error) {
      this.logger.error('Erro ao descriptografar campo sensível:', error);
      throw new Error('Falha na descriptografia do campo');
    }
  }

  /**
   * Criptografar objeto
   */
  encryptObject(obj: any, sensitiveFields: string[]): any {
    try {
      const encrypted = { ...obj };
      
      sensitiveFields.forEach(field => {
        if (encrypted[field]) {
          encrypted[field] = this.encryptSensitiveField(field, encrypted[field]);
        }
      });
      
      return encrypted;
    } catch (error) {
      this.logger.error('Erro ao criptografar objeto:', error);
      throw new Error('Falha na criptografia do objeto');
    }
  }

  /**
   * Descriptografar objeto
   */
  decryptObject(obj: any, sensitiveFields: string[]): any {
    try {
      const decrypted = { ...obj };
      
      sensitiveFields.forEach(field => {
        if (decrypted[field]) {
          decrypted[field] = this.decryptSensitiveField(field, decrypted[field]);
        }
      });
      
      return decrypted;
    } catch (error) {
      this.logger.error('Erro ao descriptografar objeto:', error);
      throw new Error('Falha na descriptografia do objeto');
    }
  }

  /**
   * Criptografar dados do usuário
   */
  encryptUserData(userData: any): any {
    const sensitiveFields = [
      'password',
      'ssn',
      'cpf',
      'creditCard',
      'bankAccount',
      'personalInfo',
    ];
    
    return this.encryptObject(userData, sensitiveFields);
  }

  /**
   * Descriptografar dados do usuário
   */
  decryptUserData(userData: any): any {
    const sensitiveFields = [
      'password',
      'ssn',
      'cpf',
      'creditCard',
      'bankAccount',
      'personalInfo',
    ];
    
    return this.decryptObject(userData, sensitiveFields);
  }

  /**
   * Criptografar dados de pagamento
   */
  encryptPaymentData(paymentData: any): any {
    const sensitiveFields = [
      'cardNumber',
      'cvv',
      'expiryDate',
      'bankAccount',
      'routingNumber',
    ];
    
    return this.encryptObject(paymentData, sensitiveFields);
  }

  /**
   * Descriptografar dados de pagamento
   */
  decryptPaymentData(paymentData: any): any {
    const sensitiveFields = [
      'cardNumber',
      'cvv',
      'expiryDate',
      'bankAccount',
      'routingNumber',
    ];
    
    return this.decryptObject(paymentData, sensitiveFields);
  }

  /**
   * Criptografar dados de KYC
   */
  encryptKYCData(kycData: any): any {
    const sensitiveFields = [
      'documentNumber',
      'documentImage',
      'selfie',
      'address',
      'phoneNumber',
      'email',
    ];
    
    return this.encryptObject(kycData, sensitiveFields);
  }

  /**
   * Descriptografar dados de KYC
   */
  decryptKYCData(kycData: any): any {
    const sensitiveFields = [
      'documentNumber',
      'documentImage',
      'selfie',
      'address',
      'phoneNumber',
      'email',
    ];
    
    return this.decryptObject(kycData, sensitiveFields);
  }

  /**
   * Verificar integridade dos dados
   */
  verifyIntegrity(data: string, hash: string): boolean {
    try {
      const computedHash = crypto.createHash('sha256').update(data).digest('hex');
      return computedHash === hash;
    } catch (error) {
      this.logger.error('Erro ao verificar integridade:', error);
      return false;
    }
  }

  /**
   * Gerar assinatura digital
   */
  sign(data: string, privateKey: string): string {
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(data);
      return sign.sign(privateKey, 'hex');
    } catch (error) {
      this.logger.error('Erro ao gerar assinatura digital:', error);
      throw new Error('Falha na geração de assinatura');
    }
  }

  /**
   * Verificar assinatura digital
   */
  verifySignature(data: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(data);
      return verify.verify(publicKey, signature, 'hex');
    } catch (error) {
      this.logger.error('Erro ao verificar assinatura digital:', error);
      return false;
    }
  }

  /**
   * Gerar par de chaves RSA
   */
  generateKeyPair(): { publicKey: string; privateKey: string } {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });
      
      return { publicKey, privateKey };
    } catch (error) {
      this.logger.error('Erro ao gerar par de chaves:', error);
      throw new Error('Falha na geração de chaves');
    }
  }

  /**
   * Criptografar com chave pública
   */
  encryptWithPublicKey(data: string, publicKey: string): string {
    try {
      const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data));
      return encrypted.toString('hex');
    } catch (error) {
      this.logger.error('Erro ao criptografar com chave pública:', error);
      throw new Error('Falha na criptografia com chave pública');
    }
  }

  /**
   * Descriptografar com chave privada
   */
  decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
    try {
      const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'hex'));
      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Erro ao descriptografar com chave privada:', error);
      throw new Error('Falha na descriptografia com chave privada');
    }
  }
}

/**
 * Factory para criar serviço de criptografia
 */
export class EncryptionServiceFactory {
  private config: EncryptionConfig;

  constructor(config: EncryptionConfig) {
    this.config = config;
  }

  /**
   * Criar serviço de criptografia
   */
  createEncryptionService(): EncryptionService {
    return new EncryptionService(this.config);
  }
}

/**
 * Utilitários de criptografia
 */
export class EncryptionUtils {
  /**
   * Gerar senha segura
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Validar força da senha
   */
  static validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Senha deve ter pelo menos 8 caracteres');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Senha deve conter letras minúsculas');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Senha deve conter letras maiúsculas');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Senha deve conter números');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Senha deve conter caracteres especiais');

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  }

  /**
   * Mascarar dados sensíveis
   */
  static maskSensitiveData(data: string, type: 'email' | 'phone' | 'ssn' | 'creditCard'): string {
    switch (type) {
      case 'email':
        const [local, domain] = data.split('@');
        return `${local.charAt(0)}***@${domain}`;
      
      case 'phone':
        return data.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
      
      case 'ssn':
        return data.replace(/(\d{3})\d{2}(\d{4})/, '$1**$2');
      
      case 'creditCard':
        return data.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
      
      default:
        return data;
    }
  }
}
