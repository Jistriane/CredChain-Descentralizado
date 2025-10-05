'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin' | 'institution'
  createdAt: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post('/api/auth/login', {
        email,
        password
      })

      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser(userData)
      
      router.push('/')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      router.push('/login')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await axios.post('/api/auth/register', data)
      
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser(userData)
      
      router.push('/')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const { token: newToken } = response.data
      localStorage.setItem('token', newToken)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch('/api/auth/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUser(response.data.user)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar perfil')
    }
  }

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && user) {
          try {
            await refreshToken()
            return axios.request(error.config)
          } catch (refreshError) {
            logout()
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [user])

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshToken,
    updateProfile
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
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
