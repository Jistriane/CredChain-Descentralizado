'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface TranslationContextType {
  t: (key: string) => string
  language: string
  setLanguage: (lang: string) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('pt-BR')

  const t = (key: string): string => {
    // Simular tradução - em produção, isso viria de um arquivo de tradução
    const translations: Record<string, string> = {
      'welcome': 'Bem-vindo',
      'dashboard': 'Dashboard',
      'profile': 'Perfil',
      'settings': 'Configurações',
      'logout': 'Sair',
      'login': 'Entrar',
      'register': 'Registrar',
      'email': 'E-mail',
      'password': 'Senha',
      'name': 'Nome',
      'save': 'Salvar',
      'cancel': 'Cancelar',
      'edit': 'Editar',
      'delete': 'Excluir',
      'confirm': 'Confirmar',
      'loading': 'Carregando...',
      'error': 'Erro',
      'success': 'Sucesso',
      'warning': 'Aviso',
      'info': 'Informação'
    }
    
    return translations[key] || key
  }

  const value = {
    t,
    language,
    setLanguage
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation deve ser usado dentro de um TranslationProvider')
  }
  return context
}
