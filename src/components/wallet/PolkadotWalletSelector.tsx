'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../../app/PolkadotWalletProvider'

interface WalletOption {
  key: string
  name: string
  extension: string
  icon: string
  description: string
  isAvailable: boolean
}

export const PolkadotWalletSelector: React.FC = () => {
  const { isConnected, address, balance, isConnecting, error, connectWallet, disconnectWallet, walletType } = useWallet()
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([])
  const [showSelector, setShowSelector] = useState(false)

  // Verificar carteiras disponíveis
  useEffect(() => {
    const checkWallets = () => {
      const wallets: WalletOption[] = []
      
      // Carteiras Polkadot suportadas
      const supportedWallets = [
        { key: 'polkadot-js', name: 'Polkadot.js', extension: 'polkadot-js', icon: '🌐', description: 'Carteira oficial Polkadot.js' },
        { key: 'talisman', name: 'Talisman', extension: 'talisman', icon: '⚡', description: 'Carteira Talisman' },
        { key: 'subwallet-js', name: 'SubWallet', extension: 'subwallet-js', icon: '🔷', description: 'Carteira SubWallet' },
        { key: 'nova wallet', name: 'Nova Wallet', extension: 'nova wallet', icon: '✨', description: 'Carteira Nova Wallet' }
      ]
      
      supportedWallets.forEach((wallet) => {
        const isAvailable = !!(window as any).injectedWeb3 && (window as any).injectedWeb3[wallet.extension]
        wallets.push({
          key: wallet.key,
          name: wallet.name,
          extension: wallet.extension,
          icon: wallet.icon,
          description: wallet.description,
          isAvailable
        })
      })

      setAvailableWallets(wallets)
    }

    checkWallets()
    
    // Verificar novamente após um tempo para capturar carteiras que podem ter sido instaladas
    const interval = setInterval(checkWallets, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleWalletSelect = async (walletKey: string) => {
    try {
      await connectWallet(walletKey)
      setShowSelector(false)
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
    }
  }

  const handleConnect = async (walletType: string) => {
    try {
      await connectWallet(walletType)
      setShowSelector(false)
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'polkadot-js': return '🌐'
      case 'talisman': return '⚡'
      case 'subwallet-js': return '🔷'
      case 'nova wallet': return '✨'
      default: return '💼'
    }
  }

  const getWalletName = (walletType: string) => {
    switch (walletType) {
      case 'polkadot-js': return 'Polkadot.js'
      case 'talisman': return 'Talisman'
      case 'subwallet-js': return 'SubWallet'
      case 'nova wallet': return 'Nova Wallet'
      default: return 'Carteira'
    }
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        {/* Informações da carteira conectada */}
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            {walletType ? `${getWalletIcon(walletType)} ${getWalletName(walletType)}` : 'Carteira Conectada'}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          <div className="font-medium">{formatAddress(address!)}</div>
          <div className="text-xs">{balance} DOT</div>
        </div>

        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => handleConnect('polkadot-js')}
        disabled={isConnecting}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <span>🔗</span>
            <span>Conectar Carteira Polkadot</span>
          </>
        )}
      </button>

      {showSelector && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selecione sua Carteira Polkadot
            </h3>
            
            <div className="space-y-2">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.key}
                  onClick={() => handleWalletSelect(wallet.key)}
                  disabled={!wallet.isAvailable}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    wallet.isAvailable
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{wallet.name}</div>
                    <div className="text-sm text-gray-500">{wallet.description}</div>
                    {!wallet.isAvailable && (
                      <div className="text-xs text-red-500 mt-1">
                        Instale a extensão {wallet.name}
                      </div>
                    )}
                  </div>
                  {wallet.isAvailable && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {availableWallets.filter(w => w.isAvailable).length === 0 && (
              <div className="text-center py-4">
                <div className="text-gray-500 mb-2">Nenhuma carteira Polkadot encontrada</div>
                <div className="text-sm text-gray-400">
                  Instale uma das carteiras suportadas para continuar
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Carteiras suportadas: Polkadot.js, Talisman, SubWallet, Nova Wallet
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
    </div>
  )
}

export default PolkadotWalletSelector
