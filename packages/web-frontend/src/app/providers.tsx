'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { SWRConfig } from 'swr'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { WalletProvider } from './WalletProvider'
import { TranslationProvider } from './TranslationProvider'
import { Header } from '@/components/layout/Header'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig
        value={{
          fetcher: (url: string) => fetch(url).then((res) => res.json()),
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          refreshInterval: 0,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <WalletProvider>
                  <TranslationProvider>
                    <div className="min-h-screen bg-gray-50">
                      <Header />
                      <main className="flex-1">
                        {children}
                      </main>
                    </div>
                  </TranslationProvider>
                </WalletProvider>
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </SWRConfig>
    </QueryClientProvider>
  )
}
