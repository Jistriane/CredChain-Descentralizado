'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: any
  }
}
import { ethers } from 'ethers';
import { useTranslation } from '../../hooks/useTranslation';

interface WalletConnectButtonProps {
  onWalletConnected?: (address: string) => void;
  onWalletDisconnected?: () => void;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onWalletConnected,
  onWalletDisconnected,
}) => {
  const { t } = useTranslation();
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
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          onWalletConnected?.(accounts[0]);
        }
      } catch (error) {
        console.error('Erro ao verificar conexão da carteira:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask não está instalado. Por favor, instale a extensão MetaMask.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Solicitar conexão da carteira
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);
        onWalletConnected?.(account);

        // Verificar se estamos na rede correta
        await checkNetwork();
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Conexão rejeitada pelo usuário.');
      } else {
        setError(`Erro: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== paseoConfig.chainId) {
        // Solicitar mudança de rede
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [paseoConfig],
        });
      }
    } catch (error: any) {
      if (error.code === 4902) {
        // Rede não existe, adicionar
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [paseoConfig],
          });
        } catch (addError) {
          setError('Erro ao trocar rede. Certifique-se de estar na Polkadot Hub TestNet.');
        }
      } else {
        setError('Erro ao trocar rede. Certifique-se de estar na Polkadot Hub TestNet.');
      }
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    onWalletDisconnected?.();
    setError('');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getBalance = async () => {
    if (!account) return '0';
    
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://testnet-passet-hub-eth-rpc.polkadot.io"
      );
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      return '0';
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">
            {formatAddress(account)}
          </span>
        </div>
        
        <button
          onClick={disconnectWallet}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center space-x-2"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05c-3.035-3.035-7.952-3.035-10.987 0A1 1 0 012.515 9.636c3.76-3.76 9.854-3.76 13.614 0a1 1 0 01-1.414 1.414zM12.12 13.88c-1.775-1.775-4.652-1.775-6.427 0a1 1 0 01-1.414-1.414c2.55-2.55 6.685-2.55 9.235 0a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
            </svg>
            <span>Conectar Carteira</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-600">
        <p>Instruções:</p>
        <p>1. Instale a extensão MetaMask</p>
        <p>2. Clique em "Conectar Carteira"</p>
        <p>3. Aprove a conexão no MetaMask</p>
        <p>4. A rede será trocada automaticamente para Polkadot Hub TestNet</p>
      </div>
    </div>
  );
};

export default WalletConnectButton;
