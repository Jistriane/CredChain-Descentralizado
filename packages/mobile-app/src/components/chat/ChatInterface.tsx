import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'failed';
  metadata?: any;
}

interface ChatInterfaceProps {
  userId: string;
  agentType?: 'orchestrator' | 'credit-analyzer' | 'compliance' | 'fraud-detector' | 'user-assistant' | 'financial-advisor';
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
}

const { width } = Dimensions.get('window');

export default function ChatInterface({
  userId,
  agentType = 'orchestrator',
  onMessageSent,
  onMessageReceived,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      // Cleanup WebSocket connection
    };
  }, [userId, agentType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    try {
      const wsUrl = process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000';
      const ws = new WebSocket(`${wsUrl}/chat?userId=${userId}&agentType=${agentType}`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket conectado');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket desconectado');
        // Tentar reconectar após 3 segundos
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        setError('Erro de conexão com o servidor');
        console.error('Erro WebSocket:', error);
      };
    } catch (error) {
      setError('Falha ao conectar com o servidor');
      console.error('Erro ao conectar WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'message':
        const message: ChatMessage = {
          id: data.id,
          type: 'assistant',
          content: data.content,
          timestamp: new Date(data.timestamp),
          status: 'delivered',
          metadata: data.metadata
        };
        setMessages(prev => [...prev, message]);
        onMessageReceived?.(message);
        break;
      
      case 'typing':
        setIsTyping(data.isTyping);
        break;
      
      case 'error':
        setError(data.message);
        break;
      
      case 'status':
        setIsConnected(data.connected);
        break;
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setInputValue('');
    onMessageSent?.(message);

    try {
      // Simular envio de mensagem
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
      }, 1000);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'failed' } : msg
      ));
      setError('Falha ao enviar mensagem');
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Ionicons name="person" size={20} color="#3B82F6" />;
      case 'assistant':
        return <Ionicons name="chatbubble" size={20} color="#10B981" />;
      default:
        return <Ionicons name="chatbubble" size={20} color="#10B981" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <ActivityIndicator size="small" color="#3B82F6" />;
      case 'sent':
        return <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />;
      case 'delivered':
        return <Ionicons name="checkmark-circle" size={16} color="#10B981" />;
      case 'failed':
        return <Ionicons name="alert-circle" size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAgentName = () => {
    switch (agentType) {
      case 'orchestrator':
        return 'CredChain Orchestrator';
      case 'credit-analyzer':
        return 'Credit Analyzer';
      case 'compliance':
        return 'Compliance Guardian';
      case 'fraud-detector':
        return 'Fraud Detector';
      case 'user-assistant':
        return 'User Assistant';
      case 'financial-advisor':
        return 'Financial Advisor';
      default:
        return 'ElizaOS';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.agentInfo}>
            <Ionicons name="chatbubble" size={24} color="white" />
            <View style={styles.agentDetails}>
              <Text style={styles.agentName}>{getAgentName()}</Text>
              <Text style={styles.connectionStatus}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
            </View>
          </View>
          <View style={styles.connectionIndicator}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#10B981' : '#EF4444' }
            ]} />
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              Olá! Sou o {getAgentName()}. Como posso ajudar você hoje?
            </Text>
          </View>
        )}

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userBubble : styles.assistantBubble
            ]}>
              <View style={styles.messageHeader}>
                {message.type !== 'user' && (
                  <View style={styles.messageIcon}>
                    {getMessageIcon(message.type)}
                  </View>
                )}
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userText : styles.assistantText
                ]}>
                  {message.content}
                </Text>
                {message.type === 'user' && (
                  <View style={styles.messageIcon}>
                    {getMessageIcon(message.type)}
                  </View>
                )}
              </View>
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.timestamp,
                  message.type === 'user' ? styles.userTimestamp : styles.assistantTimestamp
                ]}>
                  {formatTimestamp(message.timestamp)}
                </Text>
                {message.type === 'user' && (
                  <View style={styles.statusIcon}>
                    {getStatusIcon(message.status)}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingIcon}>
                <Ionicons name="chatbubble" size={20} color="#10B981" />
              </View>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.1s' }]} />
                <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            editable={isConnected}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputValue.trim() || !isConnected}
            style={[
              styles.sendButton,
              (!inputValue.trim() || !isConnected) && styles.sendButtonDisabled
            ]}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(!inputValue.trim() || !isConnected) ? '#9CA3AF' : 'white'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentDetails: {
    marginLeft: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  connectionStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginHorizontal: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#374151',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    color: '#9CA3AF',
  },
  statusIcon: {
    marginLeft: 8,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  typingIcon: {
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
