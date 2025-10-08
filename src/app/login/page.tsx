'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/app/PolkadotWalletProvider'
import { SUPPORTED_WALLETS } from '@/app/PolkadotWalletProvider'
import { ClientOnly } from '@/components/ClientOnly'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { loginWithWallet } = useAuth()
  const { connectWallet, isConnected, address } = useWallet()

  const handleWalletLogin = async (walletType: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await connectWallet(walletType)
      
      if (isConnected && address) {
        // Simular login com dados da carteira
        const mockUser = {
          id: '1',
          email: `${address}@wallet.credchain.io`,
          name: `Usuário ${address.slice(0, 8)}...`,
          score: 750,
          verified: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          token: 'mock-jwt-token',
          walletAddress: address
        }
        
        await loginWithWallet(mockUser)
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Entre na sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Conecte sua carteira Polkadot para acessar o CredChain
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Escolha sua carteira:
              </h3>
              
              <div className="space-y-3">
                {Object.entries(SUPPORTED_WALLETS).map(([key, wallet]) => (
                  <button
                    key={key}
                    onClick={() => handleWalletLogin(key)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-3 text-xl">{wallet.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-xs text-gray-500">{wallet.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma carteira?{' '}
                <a 
                  href="https://polkadot.js.org/extension/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Instale a Polkadot.js Extension
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}
