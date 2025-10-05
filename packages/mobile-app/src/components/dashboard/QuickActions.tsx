import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function QuickActions() {
  const navigation = useNavigation();

  const actions = [
    {
      id: 'calculate-score',
      title: 'Calcular Score',
      icon: 'calculator',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Score'),
    },
    {
      id: 'make-payment',
      title: 'Fazer Pagamento',
      icon: 'credit-card',
      color: '#2196F3',
      onPress: () => navigation.navigate('Payment'),
    },
    {
      id: 'chat-ai',
      title: 'Chat com IA',
      icon: 'chat',
      color: '#FF9800',
      onPress: () => navigation.navigate('Chat'),
    },
    {
      id: 'view-reports',
      title: 'Relatórios',
      icon: 'chart-line',
      color: '#9C27B0',
      onPress: () => navigation.navigate('Reports'),
    },
  ];

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text style={styles.title}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <IconButton
                icon={action.icon}
                size={24}
                iconColor="white"
              />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
});
