import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CredChain - Sistema Descentralizado de Credit Scoring',
  description: 'Plataforma inovadora de credit scoring baseada em blockchain e IA para democratizar o acesso ao crédito na América Latina.',
  keywords: ['blockchain', 'credit scoring', 'polkadot', 'elizaos', 'fintech', 'brasil'],
  authors: [{ name: 'Development Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}