import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ProgressBar, Chip } from 'react-native-paper';
import { Payment } from '../../types/dashboard';

interface PaymentCardProps {
  payments: Payment[];
}

export default function PaymentCard({ payments }: PaymentCardProps) {
  const upcomingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => p.status === 'overdue');
  
  const totalAmount = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      default: return 'Desconhecido';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Pagamentos</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {overduePayments.length > 0 && (
          <View style={styles.overdueSection}>
            <Text style={styles.overdueTitle}>⚠️ Pagamentos Vencidos</Text>
            <Text style={styles.overdueAmount}>
              R$ {overdueAmount.toFixed(2)}
            </Text>
            <Text style={styles.overdueCount}>
              {overduePayments.length} pagamento(s) vencido(s)
            </Text>
          </View>
        )}

        {upcomingPayments.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingTitle}>Próximos Pagamentos</Text>
            <Text style={styles.upcomingAmount}>
              R$ {totalAmount.toFixed(2)}
            </Text>
            <Text style={styles.upcomingCount}>
              {upcomingPayments.length} pagamento(s) pendente(s)
            </Text>
          </View>
        )}

        <View style={styles.paymentsList}>
          {payments.slice(0, 3).map((payment) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentDescription}>
                  {payment.description}
                </Text>
                <Text style={styles.paymentAmount}>
                  R$ {payment.amount.toFixed(2)}
                </Text>
              </View>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(payment.status) }
                ]}
                textStyle={styles.statusText}
              >
                {getStatusText(payment.status)}
              </Chip>
            </View>
          ))}
        </View>

        {payments.length > 3 && (
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreText}>
              +{payments.length - 3} mais
            </Text>
          </TouchableOpacity>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  overdueSection: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  overdueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 4,
  },
  overdueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  overdueCount: {
    fontSize: 12,
    color: '#D32F2F',
  },
  upcomingSection: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  upcomingAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  upcomingCount: {
    fontSize: 12,
    color: '#1976D2',
  },
  paymentsList: {
    marginTop: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  moreText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
