import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Card, Avatar, Button, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Message, ChatSession } from '../../types/chat';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);

  // Fetch chat session
  const { data: chatSession, isLoading } = useQuery<ChatSession>(
    ['chat-session'],
    async () => {
      const response = await api.get('/chat/session');
      return response.data;
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (messageText: string) => {
      const response = await api.post('/chat/message', {
        message: messageText,
        sessionId: chatSession?.id,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['chat-session']);
      },
    }
  );

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: Message) => {
      queryClient.invalidateQueries(['chat-session']);
    };

    const handleTyping = (data: { isTyping: boolean }) => {
      setAgentTyping(data.isTyping);
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, queryClient]);

  const sendMessage = async () => {
    if (!message.trim() || sendMessageMutation.isLoading) return;

    const messageText = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      await sendMessageMutation.mutateAsync(messageText);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar mensagem');
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.agentMessage
      ]}>
        {!isUser && (
          <Avatar.Icon
            size={32}
            icon="robot"
            style={styles.avatar}
          />
        )}
        
        <Card style={[
          styles.messageCard,
          isUser ? styles.userMessageCard : styles.agentMessageCard
        ]}>
          <Card.Content style={styles.messageContent}>
            <Text style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.agentMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.agentTimestamp
            ]}>
              {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Card.Content>
        </Card>
        
        {isUser && (
          <Avatar.Icon
            size={32}
            icon="account"
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!agentTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.agentMessage]}>
        <Avatar.Icon
          size={32}
          icon="robot"
          style={styles.avatar}
        />
        <Card style={[styles.messageCard, styles.agentMessageCard]}>
          <Card.Content style={styles.messageContent}>
            <View style={styles.typingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.typingText}>ElizaOS está digitando...</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Chat com ElizaOS</Text>
        <Text style={styles.headerSubtitle}>
          Sua assistente de crédito inteligente
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={chatSession?.messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Digite sua mensagem..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || sendMessageMutation.isLoading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!message.trim() || sendMessageMutation.isLoading}
        >
          {sendMessageMutation.isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  agentMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
  },
  messageCard: {
    maxWidth: '75%',
    elevation: 2,
  },
  userMessageCard: {
    backgroundColor: '#667eea',
  },
  agentMessageCard: {
    backgroundColor: 'white',
  },
  messageContent: {
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  agentMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  agentTimestamp: {
    color: '#999',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
