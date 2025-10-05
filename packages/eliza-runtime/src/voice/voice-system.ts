import { AgentRuntime, Character } from '@elizaos/core';
import * as fs from 'fs';
import * as path from 'path';

export interface VoiceConfig {
  provider: 'elevenlabs' | 'azure' | 'google' | 'aws';
  apiKey: string;
  model: string;
  voice: string;
  language: string;
  outputFormat: 'mp3' | 'wav' | 'ogg';
  sampleRate: number;
  bitRate: number;
}

export interface VoiceMessage {
  id: string;
  userId: string;
  text: string;
  audioUrl?: string;
  audioBuffer?: Buffer;
  duration: number;
  language: string;
  voice: string;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface VoiceResponse {
  id: string;
  text: string;
  audioUrl: string;
  duration: number;
  confidence: number;
  language: string;
  voice: string;
}

export class VoiceSystem {
  private config: VoiceConfig;
  private runtime: AgentRuntime;
  private isInitialized: boolean = false;

  constructor(config: VoiceConfig, runtime: AgentRuntime) {
    this.config = config;
    this.runtime = runtime;
  }

  async initialize(): Promise<void> {
    try {
      // Verificar configurações
      if (!this.config.apiKey) {
        throw new Error('API Key não configurada');
      }

      // Testar conexão com provedor
      await this.testConnection();
      
      this.isInitialized = true;
      console.log('🎤 Sistema de voz inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de voz:', error);
      throw error;
    }
  }

  async textToSpeech(text: string, userId: string): Promise<VoiceResponse> {
    if (!this.isInitialized) {
      throw new Error('Sistema de voz não inicializado');
    }

    try {
      const messageId = this.generateMessageId();
      
      // Processar texto para fala
      const audioBuffer = await this.generateSpeech(text);
      
      // Salvar arquivo de áudio
      const audioUrl = await this.saveAudioFile(audioBuffer, messageId);
      
      // Calcular duração
      const duration = await this.calculateDuration(audioBuffer);
      
      const response: VoiceResponse = {
        id: messageId,
        text,
        audioUrl,
        duration,
        confidence: 0.95,
        language: this.config.language,
        voice: this.config.voice
      };

      // Log da conversão
      console.log(`🎤 Texto convertido para fala: ${text.substring(0, 50)}...`);
      
      return response;
    } catch (error) {
      console.error('❌ Erro na conversão texto para fala:', error);
      throw error;
    }
  }

  async speechToText(audioBuffer: Buffer, userId: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Sistema de voz não inicializado');
    }

    try {
      // Converter áudio para texto
      const text = await this.transcribeAudio(audioBuffer);
      
      console.log(`🎤 Áudio convertido para texto: ${text.substring(0, 50)}...`);
      
      return text;
    } catch (error) {
      console.error('❌ Erro na conversão fala para texto:', error);
      throw error;
    }
  }

  async processVoiceMessage(audioBuffer: Buffer, userId: string): Promise<VoiceResponse> {
    try {
      // 1. Converter áudio para texto
      const text = await this.speechToText(audioBuffer, userId);
      
      // 2. Processar com ElizaOS
      const response = await this.processWithElizaOS(text, userId);
      
      // 3. Converter resposta para áudio
      const voiceResponse = await this.textToSpeech(response, userId);
      
      return voiceResponse;
    } catch (error) {
      console.error('❌ Erro ao processar mensagem de voz:', error);
      throw error;
    }
  }

  async generateVoiceResponse(text: string, userId: string): Promise<VoiceResponse> {
    // Processar texto com ElizaOS
    const processedText = await this.processWithElizaOS(text, userId);
    
    // Converter para áudio
    const voiceResponse = await this.textToSpeech(processedText, userId);
    
    return voiceResponse;
  }

  private async testConnection(): Promise<void> {
    switch (this.config.provider) {
      case 'elevenlabs':
        await this.testElevenLabsConnection();
        break;
      case 'azure':
        await this.testAzureConnection();
        break;
      case 'google':
        await this.testGoogleConnection();
        break;
      case 'aws':
        await this.testAWSConnection();
        break;
      default:
        throw new Error('Provedor de voz não suportado');
    }
  }

  private async testElevenLabsConnection(): Promise<void> {
    // Testar conexão com ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Falha na conexão com ElevenLabs');
    }
  }

  private async testAzureConnection(): Promise<void> {
    // Testar conexão com Azure Speech
    const response = await fetch('https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Falha na conexão com Azure Speech');
    }
  }

  private async testGoogleConnection(): Promise<void> {
    // Testar conexão com Google Cloud Speech
    // Implementar teste de conexão
    console.log('Testando conexão com Google Cloud Speech...');
  }

  private async testAWSConnection(): Promise<void> {
    // Testar conexão com AWS Polly
    // Implementar teste de conexão
    console.log('Testando conexão com AWS Polly...');
  }

  private async generateSpeech(text: string): Promise<Buffer> {
    switch (this.config.provider) {
      case 'elevenlabs':
        return await this.generateSpeechElevenLabs(text);
      case 'azure':
        return await this.generateSpeechAzure(text);
      case 'google':
        return await this.generateSpeechGoogle(text);
      case 'aws':
        return await this.generateSpeechAWS(text);
      default:
        throw new Error('Provedor de voz não suportado');
    }
  }

  private async generateSpeechElevenLabs(text: string): Promise<Buffer> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: this.config.model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha na geração de fala com ElevenLabs');
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async generateSpeechAzure(text: string): Promise<Buffer> {
    // Implementar geração de fala com Azure
    const response = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: `<speak version='1.0' xml:lang='${this.config.language}'><voice xml:lang='${this.config.language}' name='${this.config.voice}'>${text}</voice></speak>`
    });

    if (!response.ok) {
      throw new Error('Falha na geração de fala com Azure');
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async generateSpeechGoogle(text: string): Promise<Buffer> {
    // Implementar geração de fala com Google Cloud
    // Placeholder para implementação
    return Buffer.from('placeholder');
  }

  private async generateSpeechAWS(text: string): Promise<Buffer> {
    // Implementar geração de fala com AWS Polly
    // Placeholder para implementação
    return Buffer.from('placeholder');
  }

  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    switch (this.config.provider) {
      case 'elevenlabs':
        return await this.transcribeAudioElevenLabs(audioBuffer);
      case 'azure':
        return await this.transcribeAudioAzure(audioBuffer);
      case 'google':
        return await this.transcribeAudioGoogle(audioBuffer);
      case 'aws':
        return await this.transcribeAudioAWS(audioBuffer);
      default:
        throw new Error('Provedor de voz não suportado');
    }
  }

  private async transcribeAudioElevenLabs(audioBuffer: Buffer): Promise<string> {
    // ElevenLabs não oferece speech-to-text, usar outro provedor
    return await this.transcribeAudioAzure(audioBuffer);
  }

  private async transcribeAudioAzure(audioBuffer: Buffer): Promise<string> {
    const response = await fetch('https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Content-Type': 'audio/wav'
      },
      body: audioBuffer
    });

    if (!response.ok) {
      throw new Error('Falha na transcrição com Azure');
    }

    const result = await response.json();
    return result.DisplayText || '';
  }

  private async transcribeAudioGoogle(audioBuffer: Buffer): Promise<string> {
    // Implementar transcrição com Google Cloud
    return 'Transcrição com Google Cloud';
  }

  private async transcribeAudioAWS(audioBuffer: Buffer): Promise<string> {
    // Implementar transcrição com AWS Transcribe
    return 'Transcrição com AWS Transcribe';
  }

  private async processWithElizaOS(text: string, userId: string): Promise<string> {
    // Simular processamento com ElizaOS
    const responses = [
      'Entendi sua pergunta sobre crédito. Vou analisar seu score atual.',
      'Baseado no seu histórico, posso sugerir algumas melhorias.',
      'Seu score está em uma boa posição. Continue assim!',
      'Vou verificar suas transações para dar uma resposta mais precisa.',
      'Com base nos dados disponíveis, posso orientá-lo sobre crédito.'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async saveAudioFile(audioBuffer: Buffer, messageId: string): Promise<string> {
    const fileName = `voice_${messageId}.${this.config.outputFormat}`;
    const filePath = path.join(process.cwd(), 'uploads', 'voice', fileName);
    
    // Criar diretório se não existir
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    
    // Salvar arquivo
    await fs.promises.writeFile(filePath, audioBuffer);
    
    // Retornar URL
    return `/uploads/voice/${fileName}`;
  }

  private async calculateDuration(audioBuffer: Buffer): Promise<number> {
    // Calcular duração baseada no tamanho do buffer e configurações
    const bytesPerSecond = (this.config.sampleRate * this.config.bitRate) / 8;
    return audioBuffer.length / bytesPerSecond;
  }

  private generateMessageId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAvailableVoices(): Promise<any[]> {
    switch (this.config.provider) {
      case 'elevenlabs':
        return await this.getElevenLabsVoices();
      case 'azure':
        return await this.getAzureVoices();
      case 'google':
        return await this.getGoogleVoices();
      case 'aws':
        return await this.getAWSVoices();
      default:
        return [];
    }
  }

  private async getElevenLabsVoices(): Promise<any[]> {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': this.config.apiKey
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.voices || [];
  }

  private async getAzureVoices(): Promise<any[]> {
    // Implementar busca de vozes do Azure
    return [];
  }

  private async getGoogleVoices(): Promise<any[]> {
    // Implementar busca de vozes do Google
    return [];
  }

  private async getAWSVoices(): Promise<any[]> {
    // Implementar busca de vozes do AWS
    return [];
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const voiceSystem = new VoiceSystem({
  provider: 'elevenlabs',
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  model: 'eleven_multilingual_v2',
  voice: 'en_US-hfc_female-medium',
  language: 'pt-BR',
  outputFormat: 'mp3',
  sampleRate: 22050,
  bitRate: 128
}, null as any); // Runtime será injetado posteriormente
