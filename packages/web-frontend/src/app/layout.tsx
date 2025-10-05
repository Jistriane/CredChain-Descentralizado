import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema Descentralizado de Credit Scoring',
  description: 'Plataforma inovadora de credit scoring baseada em blockchain e IA para democratizar o acesso ao crédito na América Latina.',
  keywords: ['blockchain', 'credit scoring', 'polkadot', 'elizaos', 'fintech', 'brasil'],
  authors: [{ name: 'Development Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}