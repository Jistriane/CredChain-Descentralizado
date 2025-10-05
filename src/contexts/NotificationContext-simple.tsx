'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

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

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Carregar notificações do usuário
  useEffect(() => {
    if (user) {
      // Simular carregamento de notificações
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Score Atualizado',
          message: 'Seu score foi atualizado para 750 pontos',
          actionUrl: '/dashboard',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Nova Oferta',
          message: 'Você tem uma nova oferta de crédito disponível',
          actionUrl: '/offers',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true
        }
      ]
      
      setNotifications(mockNotifications)
    }
  }, [user])

  // Simular notificações em tempo real
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        // Simular notificação ocasional
        if (Math.random() < 0.1) {
          addNotification({
            type: 'info',
            title: 'Nova Atualização',
            message: 'Seu score foi atualizado',
            actionUrl: '/dashboard',
            metadata: {}
          })
        }
      }, 30000) // Verificar a cada 30 segundos

      return () => clearInterval(interval)
    }
  }, [isConnected])

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
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider')
  }
  return context
}
