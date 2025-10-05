import React, { useState, useRef, useEffect } from 'react';
import { VoiceSystem, VoiceResponse } from './voice-system';

interface VoiceInterfaceProps {
  userId: string;
  onVoiceResponse?: (response: VoiceResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  userId,
  onVoiceResponse,
  onError,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceSystemRef = useRef<VoiceSystem | null>(null);

  useEffect(() => {
    // Inicializar sistema de voz
    const initVoiceSystem = async () => {
      try {
        // Aqui você injetaria o VoiceSystem real
        // voiceSystemRef.current = new VoiceSystem(config, runtime);
        // await voiceSystemRef.current.initialize();
      } catch (error) {
        console.error('Erro ao inicializar sistema de voz:', error);
        onError?.(error as Error);
      }
    };

    initVoiceSystem();
  }, [onError]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Processar áudio
        await processAudio(audioBlob);
        
        // Parar stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      onError?.(error as Error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (!voiceSystemRef.current) {
      console.error('Sistema de voz não inicializado');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Converter Blob para Buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      
      // Processar com sistema de voz
      const voiceResponse = await voiceSystemRef.current.processVoiceMessage(audioBuffer, userId);
      
      setResponse(voiceResponse);
      setTranscript(voiceResponse.text);
      onVoiceResponse?.(voiceResponse);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async (text: string) => {
    if (!voiceSystemRef.current) {
      console.error('Sistema de voz não inicializado');
      return;
    }

    setIsProcessing(true);
    
    try {
      const voiceResponse = await voiceSystemRef.current.generateVoiceResponse(text, userId);
      
      setResponse(voiceResponse);
      onVoiceResponse?.(voiceResponse);
    } catch (error) {
      console.error('Erro ao processar mensagem de texto:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playResponse = () => {
    if (response?.audioUrl) {
      const audio = new Audio(response.audioUrl);
      audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
        onError?.(error);
      });
    }
  };

  const clearConversation = () => {
    setTranscript('');
    setResponse(null);
    setAudioUrl(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  return (
    <div className={`voice-interface ${className}`}>
      <div className="voice-controls">
        <h3 className="text-lg font-semibold mb-4">🎤 Chat por Voz</h3>
        
        {/* Controles de gravação */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? '🛑 Parar Gravação' : '🎤 Iniciar Gravação'}
          </button>
          
          {audioUrl && (
            <button
              onClick={playResponse}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              🔊 Reproduzir Resposta
            </button>
          )}
          
          <button
            onClick={clearConversation}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            🗑️ Limpar
          </button>
        </div>

        {/* Status */}
        <div className="mb-4">
          {isRecording && (
            <div className="flex items-center text-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Gravando... Fale agora
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center text-blue-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin mr-2"></div>
              Processando áudio...
            </div>
          )}
        </div>

        {/* Transcrição */}
        {transcript && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">📝 Transcrição:</h4>
            <div className="bg-gray-100 p-3 rounded-lg">
              {transcript}
            </div>
          </div>
        )}

        {/* Resposta */}
        {response && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">🤖 Resposta do ElizaOS:</h4>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="mb-2">{response.text}</p>
              <div className="text-sm text-gray-600">
                <p>🎤 Voz: {response.voice}</p>
                <p>⏱️ Duração: {response.duration.toFixed(1)}s</p>
                <p>🌐 Idioma: {response.language}</p>
                <p>📊 Confiança: {(response.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Input de texto alternativo */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">💬 Ou digite sua mensagem:</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    sendTextMessage(input.value.trim());
                    input.value = '';
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input.value.trim()) {
                  sendTextMessage(input.value.trim());
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Enviar
            </button>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Como usar:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Clique em "Iniciar Gravação" e fale sua pergunta</li>
            <li>• Clique em "Parar Gravação" quando terminar</li>
            <li>• O sistema processará seu áudio e responderá por voz</li>
            <li>• Use "Reproduzir Resposta" para ouvir a resposta</li>
            <li>• Ou digite sua mensagem no campo de texto</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
