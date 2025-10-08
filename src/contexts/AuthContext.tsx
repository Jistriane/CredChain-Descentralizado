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
  loginWithWallet: (userData: User) => Promise<void>
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

  // Carregar usuário da sessão
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setUser(null)
          return
        }

        // Verificar token com backend
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          localStorage.removeItem('auth_token')
          setUser(null)
        }
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro no login')
      }

      const { user: userData, token } = await response.json()
      setUser(userData)
      localStorage.setItem('auth_token', token)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithWallet = async (userData: User) => {
    setIsLoading(true)
    try {
      // Simular login com carteira
      setUser(userData)
      localStorage.setItem('auth_token', userData.token || 'mock-jwt-token')
    } catch (error) {
      console.error('Erro no login com carteira:', error)
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
    loginWithWallet,
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
    // Retornar valores padrão em vez de lançar erro durante SSR
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {},
      loginWithWallet: async () => {},
      logout: () => {},
      register: async () => {},
      updateProfile: async () => {},
      refreshUser: async () => {}
    }
  }
  return context
}