'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'
import { useWalletSafe } from '../hooks/useWalletSafe'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  actionUrl?: string
  metadata?: any
  timestamp: string
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { isConnected } = useSocket()
  const { user } = useAuth()
  const { address } = useWalletSafe()

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Manter apenas 50 notificações
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const removeNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }

  const clearAll = async () => {
    try {
      await fetch('/api/notifications/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setNotifications([])
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }

  // Carregar notificações do usuário
  useEffect(() => {
    if (user) {
      loadNotifications()
    } else {
      setNotifications([])
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      // Incluir endereço da carteira se conectada
      const url = address 
        ? `/api/notifications?walletAddress=${address}`
        : '/api/notifications'
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setNotifications(data.notifications || [])
      
      if (address) {
        console.log('Notificações carregadas com dados da carteira:', address)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Em caso de erro, manter array vazio
      setNotifications([])
    }
  }

  // Conectar com WebSocket para notificações em tempo real
  useEffect(() => {
    if (isConnected && user) {
      // Aqui seria implementada a conexão real com WebSocket
      // para receber notificações em tempo real do servidor
      console.log('Conectado ao WebSocket para notificações em tempo real')
      
      // Limpar conexão anterior se existir
      return () => {
        console.log('Desconectando WebSocket de notificações')
      }
    }
  }, [isConnected, user])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    // Retornar valores padrão em vez de lançar erro durante SSR
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      removeNotification: () => {},
      clearAll: () => {}
    }
  }
  return context
}
