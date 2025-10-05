import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WalletConnectButton } from '../../components/wallet/WalletConnectButton';

export const WalletScreen: React.FC = () => {
  const handleWalletConnected = (address: string) => {
    Alert.alert(
      'Carteira Conectada',
      `Conectado com sucesso!\nEndereço: ${address.slice(0, 6)}...${address.slice(-4)}`,
      [{ text: 'OK' }]
    );
  };

  const handleWalletDisconnected = () => {
    Alert.alert(
      'Carteira Desconectada',
      'Sua carteira foi desconectada com sucesso.',
      [{ text: 'OK' }]
    );
  };

  const openFaucet = () => {
    Alert.alert(
      'Faucet Polkadot',
      'Para obter tokens de teste, acesse: https://faucet.polkadot.io/?parachain=1111',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir', onPress: () => {
          // Implementar abertura de URL
          console.log('Abrindo faucet...');
        }}
      ]
    );
  };

  const openExplorer = () => {
    Alert.alert(
      'Block Explorer',
      'Para visualizar transações, acesse: https://blockscout-passet-hub.parity-testnet.parity.io',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir', onPress: () => {
          // Implementar abertura de URL
          console.log('Abrindo explorer...');
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciamento de Carteira</Text>
        <Text style={styles.subtitle}>
          Conecte sua carteira para acessar o CredChain
        </Text>
      </View>

      <View style={styles.content}>
        {/* Seção de Conexão */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conectar Carteira</Text>
          
          <WalletConnectButton
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instruções:</Text>
            <Text style={styles.instructionText}>1. Instale a extensão MetaMask</Text>
            <Text style={styles.instructionText}>2. Clique em "Conectar Carteira"</Text>
            <Text style={styles.instructionText}>3. Aprove a conexão no MetaMask</Text>
            <Text style={styles.instructionText}>4. A rede será trocada automaticamente</Text>
          </View>
        </View>

        {/* Seção de Recursos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recursos da Rede Polkadot</Text>
          
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>⚡</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Rede Rápida</Text>
                <Text style={styles.featureDescription}>
                  Transações rápidas e eficientes na rede Polkadot
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🔒</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Seguro</Text>
                <Text style={styles.featureDescription}>
                  Tecnologia blockchain segura e confiável
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🌐</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Descentralizado</Text>
                <Text style={styles.featureDescription}>
                  Sistema descentralizado sem intermediários
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seção de Links Úteis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links Úteis</Text>
          
          <View style={styles.links}>
            <TouchableOpacity style={styles.linkButton} onPress={openFaucet}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>💰</Text>
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Faucet</Text>
                <Text style={styles.linkDescription}>
                  Obter tokens de teste
                </Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={openExplorer}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>🔍</Text>
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Block Explorer</Text>
                <Text style={styles.linkDescription}>
                  Visualizar transações
                </Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>📚</Text>
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Documentação</Text>
                <Text style={styles.linkDescription}>
                  Polkadot Survival Guide
                </Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações da Rede */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Rede</Text>
          
          <View style={styles.networkInfo}>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Rede:</Text>
              <Text style={styles.networkValue}>Polkadot Hub TestNet</Text>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Chain ID:</Text>
              <Text style={styles.networkValue}>420420422</Text>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>RPC:</Text>
              <Text style={styles.networkValue}>
                testnet-passet-hub-eth-rpc.polkadot.io
              </Text>
            </View>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Explorer:</Text>
              <Text style={styles.networkValue}>
                blockscout-passet-hub.parity-testnet.parity.io
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  instructions: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 4,
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  links: {
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  linkIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkIconText: {
    fontSize: 16,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  linkDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
  networkInfo: {
    gap: 12,
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  networkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  networkValue: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
});

export default WalletScreen;
