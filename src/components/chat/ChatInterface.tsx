import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
  audioUrl?: string;
  confidence?: number;
  agent?: string;
}

interface ChatInterfaceProps {
  userId: string;
  onVoiceResponse?: (response: any) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  onVoiceResponse,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>('ElizaOS');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Mensagem de boas-vindas
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: 'Olá! Sou o ElizaOS, seu assistente de IA para questões financeiras. Como posso ajudar você hoje?',
      timestamp: new Date(),
      agent: 'ElizaOS'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simular resposta do ElizaOS
      const responses = [
        'Entendi sua pergunta sobre crédito. Vou analisar seu score atual.',
        'Baseado no seu histórico, posso sugerir algumas melhorias para seu score.',
        'Seu score está em uma boa posição. Continue mantendo os pagamentos em dia!',
        'Vou verificar suas transações para dar uma resposta mais precisa.',
        'Com base nos dados disponíveis, posso orientá-lo sobre como melhorar seu crédito.',
        'Para melhorar seu score, foque em pagar todas as contas em dia.',
        'Seu histórico de pagamentos é o fator mais importante para o score.',
        'Considere diversificar seus tipos de crédito para melhorar o score.',
        'Mantenha contas ativas por mais tempo para aumentar seu score.',
        'Evite abrir muitas contas novas em pouco tempo.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
        agent: currentAgent,
        confidence: 0.85 + Math.random() * 0.15
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Se voz estiver habilitada, converter para áudio
      if (isVoiceEnabled && !isMuted) {
        await convertToSpeech(randomResponse);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToSpeech = async (text: string) => {
    try {
      // Simular conversão de texto para fala
      console.log('Convertendo para fala:', text);
      
      // Em uma implementação real, você usaria uma API de TTS
      // const audioUrl = await textToSpeech(text);
      // playAudio(audioUrl);
    } catch (error) {
      console.error('Erro na conversão de fala:', error);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  };

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
        await processAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
    try {
      // Simular processamento de áudio
      const mockTranscription = 'Como posso melhorar meu score de crédito?';
      
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: mockTranscription,
        timestamp: new Date(),
        isAudio: true
      };

      setMessages(prev => [...prev, userMessage]);
      await sendMessage(mockTranscription);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAgentColor = (agent?: string) => {
    switch (agent) {
      case 'ElizaOS': return 'bg-blue-500';
      case 'Credit Analyzer': return 'bg-green-500';
      case 'Compliance Guardian': return 'bg-purple-500';
      case 'Fraud Detector': return 'bg-red-500';
      case 'Financial Advisor': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`chat-interface ${className}`}>
      <Card className="h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getAgentColor(currentAgent)}`} />
            <div>
              <h3 className="font-semibold">{currentAgent}</h3>
              <p className="text-sm text-gray-500">Assistente de IA</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={isVoiceEnabled ? 'bg-blue-100 text-blue-600' : ''}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className={isMuted ? 'bg-red-100 text-red-600' : ''}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'assistant'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'assistant' && (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.agent && (
                          <Badge variant="secondary" className="text-xs">
                            {message.agent}
                          </Badge>
                        )}
                        {message.confidence && (
                          <span className="text-xs opacity-70">
                            {(message.confidence * 100).toFixed(0)}% confiança
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Processando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              className={isRecording ? 'bg-red-100 text-red-600' : ''}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Voice Status */}
          {isVoiceEnabled && (
            <div className="mt-2 text-xs text-gray-500">
              🎤 Voz habilitada • {isMuted ? '🔇 Silenciado' : '🔊 Ativo'}
            </div>
          )}
        </div>
      </Card>

      {/* Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};