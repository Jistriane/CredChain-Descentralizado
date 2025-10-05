'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  balance: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  const connect = async () => {
    try {
      // Simular conexão com carteira
      setIsConnected(true)
      setAddress('0x1234567890123456789012345678901234567890')
      setBalance('1.5 ETH')
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance(null)
  }

  const value = {
    isConnected,
    address,
    connect,
    disconnect,
    balance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet deve ser usado dentro de um WalletProvider')
  }
  return context
}
