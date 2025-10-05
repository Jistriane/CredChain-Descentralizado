'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp'

declare global {
  interface Window {
    injectedWeb3?: {
      [key: string]: {
        enable: (origin: string) => Promise<any>
        version: string
      }
    }
    polkadot?: any
    talisman?: any
    subwallet?: any
    nova?: any
  }
}

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string
  chainId: string | null
  isConnecting: boolean
  error: string | null
  walletType: string | null
}

interface WalletActions {
  connectWallet: (walletType: string) => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<boolean>
  getWalletBalance: () => Promise<string>
}

interface WalletContextType extends WalletState, WalletActions {}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

// Configuração da rede Polkadot Mainnet
const polkadotMainnetConfig = {
  chainId: "0x0", // Polkadot Mainnet
  chainName: "Polkadot Mainnet",
  nativeCurrency: { 
    name: "Polkadot", 
    symbol: "DOT", 
    decimals: 10 
  },
  rpcUrls: ["wss://rpc.polkadot.io"],
  blockExplorerUrls: ["https://polkascan.io/polkadot"],
}

// Tipos de carteiras suportadas
const SUPPORTED_WALLETS = {
  'polkadot-js': {
    name: 'Polkadot.js',
    extension: 'polkadot-js',
    icon: '🔗',
    description: 'Carteira oficial do Polkadot'
  },
  'talisman': {
    name: 'Talisman',
    extension: 'talisman',
    icon: '⚡',
    description: 'Carteira multi-chain para Polkadot'
  },
  'subwallet': {
    name: 'SubWallet',
    extension: 'subwallet-js',
    icon: '🔷',
    description: 'Carteira para ecossistema Substrate'
  },
  'nova': {
    name: 'Nova Wallet',
    extension: 'nova',
    icon: '✨',
    description: 'Carteira moderna para Polkadot'
  }
}

export function PolkadotWalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    isConnecting: false,
    error: null,
    walletType: null,
  })

  // Debug: Log do estado quando ele muda
  useEffect(() => {
    console.log('PolkadotWalletProvider - Estado atualizado:', state)
  }, [state])

  const getWalletBalance = useCallback(async () => {
    if (!state.address) {
      console.log('getWalletBalance: Nenhum endereço disponível')
      return '0'
    }

    console.log(`getWalletBalance: Obtendo saldo para ${state.address}`)

    try {
      // Para Polkadot, vamos usar uma API REST para obter o saldo
      const response = await fetch(`https://api.polkascan.io/polkadot/api/v1/account/${state.address}/balance`)
      const data = await response.json()
      
      if (data.data && data.data.balance) {
        // Converter de planck para DOT (1 DOT = 10^10 planck)
        const balanceInDOT = (parseInt(data.data.balance) / Math.pow(10, 10)).toFixed(4)
        
        console.log(`getWalletBalance: Saldo obtido: ${balanceInDOT} DOT`)
        
        setState(prev => ({
          ...prev,
          balance: balanceInDOT,
          error: null, // Limpar erro anterior
        }))

        console.log(`Saldo real da carteira: ${balanceInDOT} DOT`)
        return balanceInDOT
      } else {
        throw new Error('Dados de saldo não encontrados')
      }
    } catch (error: any) {
      console.error('Erro ao obter saldo real:', error)
      setState(prev => ({
        ...prev,
        error: `Erro ao obter saldo: ${error.message}`,
      }))
      return '0'
    }
  }, [state.address])

  const checkNetwork = useCallback(async () => {
    // Para carteiras Polkadot, não precisamos trocar de rede
    // pois elas já estão conectadas à rede Polkadot
    console.log('checkNetwork: Rede Polkadot verificada')
    return true
  }, [])

  const connectWallet = useCallback(async (walletType?: string) => {
    console.log(`Tentando conectar com carteira Polkadot...`)
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Usar a API oficial do Polkadot.js
      const extensions = await web3Enable('CredChain-Descentralizado')
      
      if (extensions.length === 0) {
        throw new Error('Nenhuma carteira Polkadot encontrada. Por favor, instale Polkadot.js, Talisman, SubWallet ou Nova Wallet.')
      }

      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        throw new Error('Nenhuma conta encontrada. Por favor, crie uma conta na sua carteira.')
      }

      let targetAccount = allAccounts[0]
      
      // Se um tipo específico foi solicitado, tentar encontrar uma conta dessa carteira
      if (walletType) {
        const filteredAccounts = allAccounts.filter(acc => acc.meta.source === walletType)
        if (filteredAccounts.length > 0) {
          targetAccount = filteredAccounts[0]
        }
      }

      console.log(`Conta conectada: ${targetAccount.address}`)

      setState(prev => ({
        ...prev,
        isConnected: true,
        address: targetAccount.address,
        chainId: polkadotMainnetConfig.chainId,
        isConnecting: false,
        error: null,
        walletType: targetAccount.meta.source,
      }))

      // Obter saldo após conectar
      await getWalletBalance()

      console.log(`Conexão estabelecida com sucesso!`)
      console.log(`Endereço: ${targetAccount.address}`)
      console.log(`Carteira: ${targetAccount.meta.source}`)
      console.log(`Rede: ${polkadotMainnetConfig.chainName}`)

    } catch (error: any) {
      console.error(`Erro ao conectar com carteira:`, error)
      setState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        chainId: null,
        isConnecting: false,
        error: error.message,
        walletType: null,
      }))
    }
  }, [getWalletBalance])

  const disconnectWallet = useCallback(() => {
    console.log('Desconectando carteira...')
    
    setState({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      error: null,
      walletType: null,
    })

    console.log('Carteira desconectada')
  }, [])

  const switchNetwork = useCallback(async () => {
    // Para carteiras Polkadot, não precisamos trocar de rede
    console.log('switchNetwork: Rede Polkadot já está ativa')
    return true
  }, [])

  // Verificar se há carteiras disponíveis
  const checkAvailableWallets = useCallback(() => {
    const availableWallets: any[] = []
    
    Object.entries(SUPPORTED_WALLETS).forEach(([key, wallet]) => {
      if (window.injectedWeb3 && window.injectedWeb3[wallet.extension]) {
        availableWallets.push({
          key,
          ...wallet
        })
      }
    })

    return availableWallets
  }, [])

  const value: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getWalletBalance,
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
    throw new Error('useWallet deve ser usado dentro de um PolkadotWalletProvider')
  }
  return context
}

// Exportar tipos e constantes para uso em outros componentes
export { SUPPORTED_WALLETS, polkadotMainnetConfig }
export type { WalletState, WalletActions, WalletContextType }
export const dynamic = "force-dynamic"
