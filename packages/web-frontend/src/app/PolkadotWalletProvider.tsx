'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

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
  switchNetwork: () => Promise<void>
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

  const connectWallet = useCallback(async (walletType: string) => {
    console.log(`Tentando conectar com ${walletType}...`)
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Verificar se a carteira está disponível
      if (!window.injectedWeb3 || !window.injectedWeb3[SUPPORTED_WALLETS[walletType as keyof typeof SUPPORTED_WALLETS]?.extension]) {
        throw new Error(`${SUPPORTED_WALLETS[walletType as keyof typeof SUPPORTED_WALLETS]?.name} não está instalado. Por favor, instale a extensão.`)
      }

      const wallet = window.injectedWeb3[SUPPORTED_WALLETS[walletType as keyof typeof SUPPORTED_WALLETS].extension]
      
      console.log(`Habilitando ${walletType}...`)
      const extension = await wallet.enable('CredChain')
      
      console.log('Solicitando contas...')
      const accounts = await extension.accounts.get()
      
      if (accounts.length === 0) {
        throw new Error('Nenhuma conta encontrada. Por favor, crie uma conta na sua carteira.')
      }

      const account = accounts[0]
      console.log(`Conta conectada: ${account.address}`)

      setState(prev => ({
        ...prev,
        isConnected: true,
        address: account.address,
        chainId: polkadotMainnetConfig.chainId,
        isConnecting: false,
        error: null,
        walletType: walletType,
      }))

      // Obter saldo após conectar
      await getWalletBalance()

      console.log(`Conexão com ${walletType} estabelecida com sucesso!`)
      console.log(`Endereço: ${account.address}`)
      console.log(`Rede: ${polkadotMainnetConfig.chainName}`)

    } catch (error: any) {
      console.error(`Erro ao conectar com ${walletType}:`, error)
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
    const availableWallets = []
    
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
