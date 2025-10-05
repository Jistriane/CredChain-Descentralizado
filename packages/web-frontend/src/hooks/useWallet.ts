import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  account: string | null;
  balance: string;
  chainId: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  getBalance: () => Promise<string>;
}

export const useWallet = (): WalletState & WalletActions => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    account: null,
    balance: '0',
    chainId: null,
    isConnecting: false,
    error: null,
  });

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

  // Verificar conexão existente
  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          account: accounts[0],
          chainId,
        }));

        // Obter saldo apenas se conectado
        if (accounts[0]) {
          await getBalance();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  }, []);

  // Conectar carteira
  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({
        ...prev,
        error: 'MetaMask não está instalado. Por favor, instale a extensão MetaMask.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Solicitar conexão
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });

        setState(prev => ({
          ...prev,
          isConnected: true,
          account,
          chainId,
          isConnecting: false,
        }));

        // Verificar rede
        await switchNetwork();
        
        // Obter saldo
        await getBalance();
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.code === 4001 
          ? 'Conexão rejeitada pelo usuário.' 
          : `Erro ao conectar: ${error.message}`,
      }));
    }
  }, []);

  // Desconectar carteira
  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  // Trocar para rede Polkadot
  const switchNetwork = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== paseoConfig.chainId) {
        try {
          // Tentar trocar de rede
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: paseoConfig.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Rede não existe, adicionar
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [paseoConfig],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Erro ao trocar rede: ${error.message}`,
      }));
    }
  }, []);

  // Obter saldo
  const getBalance = useCallback(async () => {
    if (!state.account) return '0';

    try {
      const provider = new ethers.JsonRpcProvider(
        "https://testnet-passet-hub-eth-rpc.polkadot.io"
      );
      const balance = await provider.getBalance(state.account);
      const formattedBalance = ethers.formatEther(balance);
      
      setState(prev => ({
        ...prev,
        balance: formattedBalance,
      }));

      return formattedBalance;
    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      return '0';
    }
  }, [state.account]);

  // Listener para mudanças de conta
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({
          ...prev,
          account: accounts[0],
        }));
        getBalance();
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({
        ...prev,
        chainId,
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, getBalance]);

  // Verificar conexão ao carregar
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    getBalance,
  };
};
