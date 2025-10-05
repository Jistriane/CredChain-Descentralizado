'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  score: number
  verified: boolean
  createdAt: string
  lastLogin: string
  token?: string
  walletAddress?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Simular carregamento inicial
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Simular verificação de token/sessão
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock user para desenvolvimento
        const mockUser: User = {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          score: 750,
          verified: true,
          createdAt: '2024-01-15T10:00:00Z',
          lastLogin: new Date().toISOString()
        }
        
        setUser(mockUser)
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simular login
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (email === 'joao@example.com' && password === '123456') {
        const mockUser: User = {
          id: '1',
          name: 'João Silva',
          email: email,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          score: 750,
          verified: true,
          createdAt: '2024-01-15T10:00:00Z',
          lastLogin: new Date().toISOString()
        }
        
        setUser(mockUser)
        localStorage.setItem('auth_token', 'mock_token_123')
      } else {
        throw new Error('Credenciais inválidas')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simular registro
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        score: 600, // Score inicial
        verified: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
      
      setUser(newUser)
      localStorage.setItem('auth_token', 'mock_token_123')
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Simular atualização
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Simular refresh
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const refreshedUser = {
        ...user,
        lastLogin: new Date().toISOString(),
        score: user.score + Math.floor(Math.random() * 10) - 5 // Simular mudança no score
      }
      
      setUser(refreshedUser)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}