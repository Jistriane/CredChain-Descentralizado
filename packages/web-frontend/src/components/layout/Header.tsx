'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '../../app/WalletProvider';
import { useTranslation } from '../../hooks/useTranslation';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { LanguageSwitcher } from '../language/LanguageSwitcher';
import { Logo } from '../ui/Logo';

export const Header: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { t } = useTranslation();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo variant="compact" showText={true} />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('dashboard')}
            </Link>
            <Link 
              href="/score" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('score')}
            </Link>
            <Link 
              href="/payments" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('payments')}
            </Link>
            <Link 
              href="/chat" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('chat')}
            </Link>
            <Link 
              href="/wallet" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('wallet')}
            </Link>
            <Link 
              href="/payments" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Pagamentos
            </Link>
            <Link 
              href="/reports" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Relatórios
            </Link>
            <Link 
              href="/settings" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Configurações
            </Link>
            <Link 
              href="/help" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Ajuda
            </Link>
          </nav>

          {/* Wallet Connection & Language */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {formatAddress(address || '')}
                  </span>
                </div>
                <WalletConnectButton />
              </div>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
