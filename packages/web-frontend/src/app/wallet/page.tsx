'use client';

import React from 'react';
import { WalletConnectButton } from '../../components/wallet/WalletConnectButton';
import { WalletInfo } from '../../components/wallet/WalletInfo';
import { useWallet } from '../../hooks/useWallet';

export default function WalletPage() {
  const { isConnected, account, balance, chainId } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gerenciamento de Carteira
          </h1>
          <p className="text-lg text-gray-600">
            Conecte sua carteira MetaMask para acessar o CredChain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seção de Conexão */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Conectar Carteira
            </h2>
            
            <div className="space-y-4">
              <WalletConnectButton
                onWalletConnected={(address) => {
                  console.log('Carteira conectada:', address);
                }}
                onWalletDisconnected={() => {
                  console.log('Carteira desconectada');
                }}
              />
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Instruções:
              </h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Instale a extensão MetaMask</li>
                <li>2. Clique em "Conectar Carteira"</li>
                <li>3. Aprove a conexão no MetaMask</li>
                <li>4. A rede será trocada automaticamente para Polkadot Hub TestNet</li>
              </ol>
            </div>
          </div>

          {/* Seção de Informações */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Status da Carteira
            </h2>
            
            {isConnected ? (
              <WalletInfo />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-gray-500">
                  Nenhuma carteira conectada
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Conecte sua carteira para ver as informações
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Seção de Recursos */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recursos da Rede Polkadot
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Rede Rápida</h3>
              <p className="text-sm text-gray-600">
                Transações rápidas e eficientes na rede Polkadot
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Seguro</h3>
              <p className="text-sm text-gray-600">
                Tecnologia blockchain segura e confiável
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Descentralizado</h3>
              <p className="text-sm text-gray-600">
                Sistema descentralizado sem intermediários
              </p>
            </div>
          </div>
        </div>

        {/* Links Úteis */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Links Úteis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Rede Polkadot</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <a 
                    href="https://testnet-passet-hub-eth-rpc.polkadot.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    RPC Endpoint
                  </a>
                </li>
                <li>
                  <a 
                    href="https://blockscout-passet-hub.parity-testnet.parity.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Block Explorer
                  </a>
                </li>
                <li>
                  <a 
                    href="https://faucet.polkadot.io/?parachain=1111" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Faucet (Obter tokens de teste)
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Documentação</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <a 
                    href="https://polkadot-survival-guide.w3d.community/pt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Polkadot Survival Guide
                  </a>
                </li>
                <li>
                  <a 
                    href="https://docs.polkadot.network/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Documentação Oficial
                  </a>
                </li>
                <li>
                  <a 
                    href="https://substrate.io/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Substrate Framework
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
