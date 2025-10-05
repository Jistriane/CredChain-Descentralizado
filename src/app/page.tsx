'use client'

import { useEffect, useState } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando CredChain...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-8">
            CredChain
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema Descentralizado de Pontuação de Crédito
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 Deploy Automático Concluído!
            </h2>
            <p className="text-gray-600 mb-6">
              Seu CredChain está funcionando perfeitamente no Render.com
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Frontend</h3>
                <p className="text-blue-600">Next.js + React</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Blockchain</h3>
                <p className="text-green-600">Polkadot + Ethereum</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">AI/ML</h3>
                <p className="text-purple-600">ElizaOS + ML</p>
              </div>
            </div>
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Conectar Carteira
              </button>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                Ver Score de Crédito
              </button>
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Chat com Eliza
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}