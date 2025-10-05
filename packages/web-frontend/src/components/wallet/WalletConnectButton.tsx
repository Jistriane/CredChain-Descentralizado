'use client';

import React, { useState } from 'react';
import { useWallet } from '../../app/WalletProvider';
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
  const { 
    isConnected, 
    address, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();
  
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      if (address) {
        onWalletConnected?.(address);
      }
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
    }
  };

  const handleDisconnect = async () => {
    console.log('Botão desconectar clicado');
    setIsDisconnecting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      disconnectWallet();
      onWalletDisconnected?.();
      console.log('Desconexão processada com sucesso');
    } catch (error) {
      console.error('Erro ao desconectar carteira:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {isConnected ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {formatAddress(address || '')}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            {isDisconnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Desconectando...</span>
              </>
            ) : (
              <span>Desconectar Carteira</span>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <span>Conectar Carteira</span>
            </>
          )}
        </button>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;