import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ethers } from 'ethers';

interface WalletConnectButtonProps {
  onWalletConnected?: (address: string) => void;
  onWalletDisconnected?: () => void;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onWalletConnected,
  onWalletDisconnected,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Configuração da rede Polkadot conforme documentação
  const paseoConfig = {
    chainId: "0x1911f0a6", // 420420422
    chainName: "Polkadot Hub TestNet",
    nativeCurrency: { 
      name: "PAS", 
      symbol: "PAS", 
      decimals: 18 
    },
    rpcUrls: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
    blockExplorerUrls: ["https://blockscout-passet-hub.parity-testnet.parity.io"],
  };

  // Verificar conexão existente ao carregar
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Para mobile, usamos WalletConnect ou similar
      // Aqui simulamos a verificação
      const storedAccount = await getStoredAccount();
      if (storedAccount) {
        setAccount(storedAccount);
        setIsConnected(true);
        onWalletConnected?.(storedAccount);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão da carteira:', error);
    }
  };

  const getStoredAccount = async (): Promise<string | null> => {
    // Implementar storage local (AsyncStorage)
    // Por enquanto, retorna null
    return null;
  };

  const storeAccount = async (account: string) => {
    // Implementar storage local (AsyncStorage)
    // Por enquanto, apenas log
    console.log('Conta armazenada:', account);
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Para mobile, usar WalletConnect ou similar
      // Aqui simulamos a conexão
      const mockAccount = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      
      setAccount(mockAccount);
      setIsConnected(true);
      await storeAccount(mockAccount);
      onWalletConnected?.(mockAccount);

      Alert.alert(
        'Carteira Conectada',
        `Conectado com sucesso!\nEndereço: ${mockAccount.slice(0, 6)}...${mockAccount.slice(-4)}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      setError(`Erro ao conectar carteira: ${error.message}`);
      Alert.alert('Erro', error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    onWalletDisconnected?.();
    setError('');
    
    Alert.alert(
      'Carteira Desconectada',
      'Sua carteira foi desconectada com sucesso.',
      [{ text: 'OK' }]
    );
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkInfo = () => {
    return {
      name: 'Polkadot Hub TestNet',
      chainId: '420420422',
      rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
    };
  };

  if (isConnected) {
    return (
      <View style={styles.connectedContainer}>
        <View style={styles.connectedInfo}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.connectedText}>
            {formatAddress(account)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={disconnectWallet}
        >
          <Text style={styles.disconnectButtonText}>Desconectar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
        onPress={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.connectButtonText}>Conectando...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.connectButtonText}>Conectar Carteira</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Conecte sua carteira para acessar o CredChain
        </Text>
        <Text style={styles.networkText}>
          Rede: {getNetworkInfo().name}
        </Text>
        <Text style={styles.networkText}>
          Chain ID: {getNetworkInfo().chainId}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  networkText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
});

export default WalletConnectButton;
