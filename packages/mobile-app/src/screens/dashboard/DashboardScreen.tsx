import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useQuery } from 'react-query';
import { Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Components
import ScoreCard from '../../components/dashboard/ScoreCard';
import PaymentCard from '../../components/dashboard/PaymentCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import CreditChart from '../../components/dashboard/CreditChart';
import { Logo } from '../../components/ui/Logo';

// Services
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Types
import { DashboardData, CreditScore, Payment } from '../../types/dashboard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>(
    ['dashboard'],
    async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Logo variant="compact" showText={true} />
          </View>
          <Text style={styles.welcomeText}>
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
          </Text>
          <Text style={styles.subtitleText}>
            Gerencie seu crédito de forma inteligente
          </Text>
        </LinearGradient>

        {/* Score Card */}
        {dashboardData?.creditScore && (
          <ScoreCard score={dashboardData.creditScore} />
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Payment Status */}
        {dashboardData?.upcomingPayments && (
          <PaymentCard payments={dashboardData.upcomingPayments} />
        )}

        {/* Credit Chart */}
        {dashboardData?.scoreHistory && (
          <CreditChart data={dashboardData.scoreHistory} />
        )}

        {/* Recent Activity */}
        {dashboardData?.recentActivity && (
          <RecentActivity activities={dashboardData.recentActivity} />
        )}

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Title>💡 Dica do Dia</Title>
            <Paragraph>
              Pagar suas contas em dia é o fator mais importante para melhorar seu score de crédito. 
              Mantenha a pontualidade!
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="chat"
        onPress={() => navigation.navigate('Chat')}
        label="Chat com IA"
      />
    </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  tipsCard: {
    margin: 16,
    marginBottom: 100, // Space for FAB
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
});
