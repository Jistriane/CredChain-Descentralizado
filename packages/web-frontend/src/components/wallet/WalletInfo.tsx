'use client';

import React from 'react';
import { useWallet } from '../../hooks/useWallet';

export const WalletInfo: React.FC = () => {
  const { 
    isConnected, 
    account, 
    balance, 
    chainId, 
    error,
    getBalance 
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const getNetworkName = (chainId: string | null) => {
    switch (chainId) {
      case '0x1911f0a6': // 420420422
        return 'Polkadot Hub TestNet';
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x5':
        return 'Goerli Testnet';
      default:
        return 'Rede Desconhecida';
    }
  };

  const getNetworkColor = (chainId: string | null) => {
    switch (chainId) {
      case '0x1911f0a6': // 420420422
        return 'bg-blue-100 text-blue-800';
      case '0x1':
        return 'bg-green-100 text-green-800';
      case '0x5':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Informações da Carteira
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getNetworkColor(chainId)}`}>
          {getNetworkName(chainId)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Endereço:</span>
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {formatAddress(account || '')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Saldo:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">
              {formatBalance(balance)} PAS
            </span>
            <button
              onClick={getBalance}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              ↻
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Chain ID:</span>
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {chainId || 'N/A'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Rede: Polkadot Hub TestNet</p>
          <p>• RPC: https://testnet-passet-hub-eth-rpc.polkadot.io</p>
          <p>• Explorer: https://blockscout-passet-hub.parity-testnet.parity.io</p>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
