import { Config } from '../config';
import { Logger } from '../utils/logger';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface VoiceConfig {
  provider: 'azure' | 'aws' | 'google' | 'elevenlabs';
  apiKey: string;
  region?: string;
  language: string;
  voice: string;
  speed: number;
  pitch: number;
}

export interface SpeechResult {
  audio: Buffer;
  duration: number;
  format: string;
  metadata: {
    provider: string;
    voice: string;
    language: string;
    speed: number;
    pitch: number;
  };
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  metadata: {
    provider: string;
    model: string;
    timestamp: number;
  };
}

export class VoiceAdapter {
  private config: Config;
  private logger: Logger;
  private voiceConfig: VoiceConfig;
  private cacheDir: string;

  constructor(config: Config) {
    this.config = config;
    this.logger = new Logger('VoiceAdapter');
    this.cacheDir = path.join(process.cwd(), 'cache', 'voice');
    this.voiceConfig = {
      provider: config.get('VOICE_PROVIDER', 'azure') as VoiceConfig['provider'],
      apiKey: config.get('VOICE_API_KEY', ''),
      region: config.get('VOICE_REGION', ''),
      language: config.get('VOICE_LANGUAGE', 'pt-BR'),
      voice: config.get('VOICE_NAME', ''),
      speed: parseFloat(config.get('VOICE_SPEED', '1.0')),
      pitch: parseFloat(config.get('VOICE_PITCH', '1.0')),
    };

    // Cria diretório de cache se não existir
    this.ensureCacheDir();
  }

  /**
   * Conecta ao serviço de voz
   */
  async connect(): Promise<void> {
    try {
      this.logger.info('Conectando ao serviço de voz...');

      // Verifica configuração
      if (!this.voiceConfig.apiKey) {
        throw new Error('VOICE_API_KEY não configurado');
      }

      // Testa conexão com o provedor
      await this.testConnection();

      this.logger.info('✅ Serviço de voz conectado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao serviço de voz:', error);
      throw error;
    }
  }

  /**
   * Testa conexão com o provedor de voz
   */
  private async testConnection(): Promise<void> {
    try {
      switch (this.voiceConfig.provider) {
        case 'azure':
          await this.testAzureConnection();
          break;
        case 'aws':
          await this.testAWSConnection();
          break;
        case 'google':
          await this.testGoogleConnection();
          break;
        case 'elevenlabs':
          await this.testElevenLabsConnection();
          break;
        default:
          throw new Error(`Provedor de voz não suportado: ${this.voiceConfig.provider}`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao testar conexão com provedor de voz:', error);
      throw error;
    }
  }

  /**
   * Testa conexão com Azure Speech Services
   */
  private async testAzureConnection(): Promise<void> {
    try {
      const response = await axios.post(
        `https://${this.voiceConfig.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          text: 'Teste de conexão',
          voice: this.voiceConfig.voice,
          rate: this.voiceConfig.speed,
          pitch: this.voiceConfig.pitch,
        },
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.voiceConfig.apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Falha na conexão com Azure Speech Services');
      }
    } catch (error) {
      throw new Error(`Erro ao conectar com Azure: ${error.message}`);
    }
  }

  /**
   * Testa conexão com AWS Polly
   */
  private async testAWSConnection(): Promise<void> {
    try {
      // Implementação para AWS Polly
      this.logger.info('Teste de conexão AWS Polly (simulado)');
    } catch (error) {
      throw new Error(`Erro ao conectar com AWS: ${error.message}`);
    }
  }

  /**
   * Testa conexão com Google Cloud Text-to-Speech
   */
  private async testGoogleConnection(): Promise<void> {
    try {
      // Implementação para Google Cloud TTS
      this.logger.info('Teste de conexão Google Cloud TTS (simulado)');
    } catch (error) {
      throw new Error(`Erro ao conectar com Google: ${error.message}`);
    }
  }

  /**
   * Testa conexão com ElevenLabs
   */
  private async testElevenLabsConnection(): Promise<void> {
    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.voiceConfig.apiKey,
        },
      });

      if (response.status !== 200) {
        throw new Error('Falha na conexão com ElevenLabs');
      }
    } catch (error) {
      throw new Error(`Erro ao conectar com ElevenLabs: ${error.message}`);
    }
  }

  /**
   * Converte texto em fala
   */
  async textToSpeech(text: string, options: Partial<VoiceConfig> = {}): Promise<SpeechResult> {
    try {
      const config = { ...this.voiceConfig, ...options };
      const cacheKey = this.generateCacheKey(text, config);
      const cachedAudio = await this.getCachedAudio(cacheKey);

      if (cachedAudio) {
        this.logger.info('✅ Áudio obtido do cache');
        return cachedAudio;
      }

      let audio: Buffer;
      let duration: number;

      switch (config.provider) {
        case 'azure':
          ({ audio, duration } = await this.synthesizeWithAzure(text, config));
          break;
        case 'aws':
          ({ audio, duration } = await this.synthesizeWithAWS(text, config));
          break;
        case 'google':
          ({ audio, duration } = await this.synthesizeWithGoogle(text, config));
          break;
        case 'elevenlabs':
          ({ audio, duration } = await this.synthesizeWithElevenLabs(text, config));
          break;
        default:
          throw new Error(`Provedor de voz não suportado: ${config.provider}`);
      }

      const result: SpeechResult = {
        audio,
        duration,
        format: 'mp3',
        metadata: {
          provider: config.provider,
          voice: config.voice,
          language: config.language,
          speed: config.speed,
          pitch: config.pitch,
        },
      };

      // Armazena no cache
      await this.cacheAudio(cacheKey, result);

      this.logger.info(`✅ Texto convertido em fala (${duration}s)`);
      return result;
    } catch (error) {
      this.logger.error('❌ Erro ao converter texto em fala:', error);
      throw error;
    }
  }

  /**
   * Converte fala em texto
   */
  async speechToText(audio: Buffer, options: Partial<VoiceConfig> = {}): Promise<TranscriptionResult> {
    try {
      const config = { ...this.voiceConfig, ...options };
      const cacheKey = this.generateCacheKey(audio.toString('base64'), config);
      const cachedTranscription = await this.getCachedTranscription(cacheKey);

      if (cachedTranscription) {
        this.logger.info('✅ Transcrição obtida do cache');
        return cachedTranscription;
      }

      let text: string;
      let confidence: number;
      let duration: number;

      switch (config.provider) {
        case 'azure':
          ({ text, confidence, duration } = await this.transcribeWithAzure(audio, config));
          break;
        case 'aws':
          ({ text, confidence, duration } = await this.transcribeWithAWS(audio, config));
          break;
        case 'google':
          ({ text, confidence, duration } = await this.transcribeWithGoogle(audio, config));
          break;
        default:
          throw new Error(`Provedor de voz não suportado para transcrição: ${config.provider}`);
      }

      const result: TranscriptionResult = {
        text,
        confidence,
        language: config.language,
        duration,
        metadata: {
          provider: config.provider,
          model: config.voice,
          timestamp: Date.now(),
        },
      };

      // Armazena no cache
      await this.cacheTranscription(cacheKey, result);

      this.logger.info(`✅ Fala convertida em texto (${confidence.toFixed(2)}% confiança)`);
      return result;
    } catch (error) {
      this.logger.error('❌ Erro ao converter fala em texto:', error);
      throw error;
    }
  }

  /**
   * Sintetiza com Azure Speech Services
   */
  private async synthesizeWithAzure(text: string, config: VoiceConfig): Promise<{ audio: Buffer; duration: number }> {
    try {
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.language}">
          <voice name="${config.voice}">
            <prosody rate="${config.speed}" pitch="${config.pitch}">
              ${text}
            </prosody>
          </voice>
        </speak>
      `;

      const response = await axios.post(
        `https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        ssml,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': config.apiKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          },
          responseType: 'arraybuffer',
        }
      );

      const audio = Buffer.from(response.data);
      const duration = this.estimateAudioDuration(audio);

      return { audio, duration };
    } catch (error) {
      throw new Error(`Erro ao sintetizar com Azure: ${error.message}`);
    }
  }

  /**
   * Sintetiza com AWS Polly
   */
  private async synthesizeWithAWS(text: string, config: VoiceConfig): Promise<{ audio: Buffer; duration: number }> {
    try {
      // Implementação para AWS Polly
      this.logger.info('Síntese com AWS Polly (simulada)');
      const audio = Buffer.from('audio simulado');
      const duration = 1.0;
      return { audio, duration };
    } catch (error) {
      throw new Error(`Erro ao sintetizar com AWS: ${error.message}`);
    }
  }

  /**
   * Sintetiza com Google Cloud Text-to-Speech
   */
  private async synthesizeWithGoogle(text: string, config: VoiceConfig): Promise<{ audio: Buffer; duration: number }> {
    try {
      // Implementação para Google Cloud TTS
      this.logger.info('Síntese com Google Cloud TTS (simulada)');
      const audio = Buffer.from('audio simulado');
      const duration = 1.0;
      return { audio, duration };
    } catch (error) {
      throw new Error(`Erro ao sintetizar com Google: ${error.message}`);
    }
  }

  /**
   * Sintetiza com ElevenLabs
   */
  private async synthesizeWithElevenLabs(text: string, config: VoiceConfig): Promise<{ audio: Buffer; duration: number }> {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.voice}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      const audio = Buffer.from(response.data);
      const duration = this.estimateAudioDuration(audio);

      return { audio, duration };
    } catch (error) {
      throw new Error(`Erro ao sintetizar com ElevenLabs: ${error.message}`);
    }
  }

  /**
   * Transcreve com Azure Speech Services
   */
  private async transcribeWithAzure(audio: Buffer, config: VoiceConfig): Promise<{ text: string; confidence: number; duration: number }> {
    try {
      // Implementação para Azure Speech-to-Text
      this.logger.info('Transcrição com Azure Speech Services (simulada)');
      return {
        text: 'Transcrição simulada',
        confidence: 0.95,
        duration: 1.0,
      };
    } catch (error) {
      throw new Error(`Erro ao transcrever com Azure: ${error.message}`);
    }
  }

  /**
   * Transcreve com AWS Transcribe
   */
  private async transcribeWithAWS(audio: Buffer, config: VoiceConfig): Promise<{ text: string; confidence: number; duration: number }> {
    try {
      // Implementação para AWS Transcribe
      this.logger.info('Transcrição com AWS Transcribe (simulada)');
      return {
        text: 'Transcrição simulada',
        confidence: 0.90,
        duration: 1.0,
      };
    } catch (error) {
      throw new Error(`Erro ao transcrever com AWS: ${error.message}`);
    }
  }

  /**
   * Transcreve com Google Cloud Speech-to-Text
   */
  private async transcribeWithGoogle(audio: Buffer, config: VoiceConfig): Promise<{ text: string; confidence: number; duration: number }> {
    try {
      // Implementação para Google Cloud Speech-to-Text
      this.logger.info('Transcrição com Google Cloud Speech-to-Text (simulada)');
      return {
        text: 'Transcrição simulada',
        confidence: 0.92,
        duration: 1.0,
      };
    } catch (error) {
      throw new Error(`Erro ao transcrever com Google: ${error.message}`);
    }
  }

  /**
   * Estima duração do áudio
   */
  private estimateAudioDuration(audio: Buffer): number {
    // Estimativa simples baseada no tamanho do arquivo
    // Em uma implementação real, você usaria uma biblioteca como node-ffmpeg
    return audio.length / 16000; // Assumindo 16kHz, 16-bit mono
  }

  /**
   * Gera chave de cache
   */
  private generateCacheKey(input: string, config: VoiceConfig): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    hash.update(input + JSON.stringify(config));
    return hash.digest('hex');
  }

  /**
   * Obtém áudio do cache
   */
  private async getCachedAudio(key: string): Promise<SpeechResult | null> {
    try {
      const cacheFile = path.join(this.cacheDir, 'audio', `${key}.json`);
      if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const audioFile = path.join(this.cacheDir, 'audio', `${key}.mp3`);
        if (fs.existsSync(audioFile)) {
          data.audio = fs.readFileSync(audioFile);
          return data;
        }
      }
      return null;
    } catch (error) {
      this.logger.warn('Erro ao obter áudio do cache:', error);
      return null;
    }
  }

  /**
   * Armazena áudio no cache
   */
  private async cacheAudio(key: string, result: SpeechResult): Promise<void> {
    try {
      const cacheDir = path.join(this.cacheDir, 'audio');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const audioFile = path.join(cacheDir, `${key}.mp3`);
      const metaFile = path.join(cacheDir, `${key}.json`);

      fs.writeFileSync(audioFile, result.audio);
      fs.writeFileSync(metaFile, JSON.stringify({
        ...result,
        audio: undefined, // Não armazena o buffer no JSON
      }, null, 2));
    } catch (error) {
      this.logger.warn('Erro ao armazenar áudio no cache:', error);
    }
  }

  /**
   * Obtém transcrição do cache
   */
  private async getCachedTranscription(key: string): Promise<TranscriptionResult | null> {
    try {
      const cacheFile = path.join(this.cacheDir, 'transcription', `${key}.json`);
      if (fs.existsSync(cacheFile)) {
        return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      }
      return null;
    } catch (error) {
      this.logger.warn('Erro ao obter transcrição do cache:', error);
      return null;
    }
  }

  /**
   * Armazena transcrição no cache
   */
  private async cacheTranscription(key: string, result: TranscriptionResult): Promise<void> {
    try {
      const cacheDir = path.join(this.cacheDir, 'transcription');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const metaFile = path.join(cacheDir, `${key}.json`);
      fs.writeFileSync(metaFile, JSON.stringify(result, null, 2));
    } catch (error) {
      this.logger.warn('Erro ao armazenar transcrição no cache:', error);
    }
  }

  /**
   * Cria diretório de cache
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<any> {
    return {
      connected: true,
      provider: this.voiceConfig.provider,
      language: this.voiceConfig.language,
      voice: this.voiceConfig.voice,
      cacheDir: this.cacheDir,
    };
  }

  /**
   * Desconecta do serviço de voz
   */
  async disconnect(): Promise<void> {
    try {
      this.logger.info('✅ Desconectado do serviço de voz');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar do serviço de voz:', error);
      throw error;
    }
  }
}
