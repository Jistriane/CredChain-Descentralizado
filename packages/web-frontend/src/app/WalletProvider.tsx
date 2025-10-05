'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string
  chainId: string | null
  isConnecting: boolean
  error: string | null
}

interface WalletActions {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
  getWalletBalance: () => Promise<string>
}

interface WalletContextType extends WalletState, WalletActions {}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    isConnecting: false,
    error: null,
  })

  // Debug: Log do estado quando ele muda
  useEffect(() => {
    console.log('WalletProvider - Estado atualizado:', state)
  }, [state])

  // Configuração da rede Ethereum Mainnet (compatível com MetaMask)
  const ethereumMainnetConfig = {
    chainId: "0x1", // Ethereum Mainnet
    chainName: "Ethereum Mainnet",
    nativeCurrency: { 
      name: "Ether", 
      symbol: "ETH", 
      decimals: 18 
    },
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  }

  const getWalletBalance = useCallback(async () => {
    if (!state.address) {
      console.log('getWalletBalance: Nenhum endereço disponível')
      return '0'
    }

    console.log(`getWalletBalance: Obtendo saldo para ${state.address}`)

    try {
      const provider = new ethers.JsonRpcProvider(ethereumMainnetConfig.rpcUrls[0])
      const balance = await provider.getBalance(state.address)
      const formattedBalance = ethers.formatEther(balance)
      
      console.log(`getWalletBalance: Saldo obtido: ${formattedBalance} ETH`)
      
      setState(prev => ({
        ...prev,
        balance: formattedBalance,
        error: null, // Limpar erro anterior
      }))

      console.log(`Saldo real da carteira: ${formattedBalance} ETH`)
      return formattedBalance
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
    if (typeof window.ethereum === 'undefined') return

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (currentChainId !== ethereumMainnetConfig.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethereumMainnetConfig.chainId }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [ethereumMainnetConfig],
            })
          } else {
            throw switchError
          }
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Erro ao trocar rede: ${error.message}`,
      }))
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({
        ...prev,
        error: 'MetaMask não está instalado. Por favor, instale a extensão MetaMask.',
      }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      console.log('Solicitando conexão com MetaMask...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })

        console.log(`Carteira conectada: ${address}`)
        console.log(`Chain ID: ${chainId}`)

        setState(prev => ({
          ...prev,
          isConnected: true,
          address,
          chainId,
          isConnecting: false,
        }))

        // Verificar e trocar para rede correta
        await checkNetwork()
        
        // Obter saldo real da carteira
        console.log('Obtendo saldo real da carteira...')
        await getWalletBalance()
        
        console.log('Conexão com carteira concluída com dados reais')
      }
    } catch (error: any) {
      console.error('Erro ao conectar carteira:', error)
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.code === 4001 
          ? 'Conexão rejeitada pelo usuário.' 
          : `Erro ao conectar: ${error.message}`,
      }))
    }
  }, [checkNetwork, getWalletBalance])

  const disconnectWallet = useCallback(() => {
    console.log('Desconectando carteira...')
    setState({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      error: null,
    })
    console.log('Carteira desconectada com sucesso')
  }, [])

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Contas da carteira alteradas:', accounts)
      if (accounts.length === 0) {
        console.log('Nenhuma conta conectada, desconectando...')
        disconnectWallet()
      } else {
        console.log(`Nova conta conectada: ${accounts[0]}`)
        setState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }))
        // Obter saldo real da nova conta
        getWalletBalance()
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log(`Rede alterada para: ${chainId}`)
      setState(prev => ({
        ...prev,
        chainId,
      }))
      // Verificar se é a rede correta e obter saldo real
      if (chainId === ethereumMainnetConfig.chainId) {
        getWalletBalance()
      } else {
        console.log('Rede incorreta detectada, solicitando troca...')
        checkNetwork()
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [disconnectWallet, getWalletBalance])

  // Remover auto-connect para permitir desconexão manual
  // useEffect(() => {
  //   connectWallet()
  // }, [connectWallet])

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork: checkNetwork,
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
    throw new Error('useWallet deve ser usado dentro de um WalletProvider')
  }
  return context
}
