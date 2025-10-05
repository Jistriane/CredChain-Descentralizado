'use client'

import { useWallet } from '../app/PolkadotWalletProvider'

export function useWalletSafe() {
  try {
    return useWallet()
  } catch (error) {
    // Retornar valores padrão quando não estiver dentro do WalletProvider
    return {
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      error: null,
      connectWallet: async () => {},
      disconnectWallet: () => {},
      switchNetwork: async () => {},
      getWalletBalance: async () => '0'
    }
  }
}
