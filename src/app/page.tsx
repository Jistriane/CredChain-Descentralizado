export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-800 mb-4">
          CredChain
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema Descentralizado de Credit Scoring
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🚀 Deploy Automático
          </h2>
          <p className="text-gray-600 mb-4">
            Frontend configurado para deploy na Netlify
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✅ Build estático funcionando</p>
            <p>✅ Configuração Netlify pronta</p>
            <p>✅ Variáveis de ambiente configuradas</p>
            <p>✅ Deploy automático ativado</p>
          </div>
        </div>
      </div>
    </main>
  )
}