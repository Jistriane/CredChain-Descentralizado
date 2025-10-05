'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  metadata?: any
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
  const { socket, isConnected } = useSocket()
  const { user } = useAuth()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for real-time notifications
      socket.on('notification', (data) => {
        addNotification({
          type: data.type || 'info',
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          metadata: data.metadata
        })
      })

      socket.on('scoreUpdate', (data) => {
        addNotification({
          type: 'success',
          title: 'Score Atualizado',
          message: `Seu score foi atualizado para ${data.score} pontos`,
          actionUrl: '/score'
        })
      })

      socket.on('paymentReminder', (data) => {
        addNotification({
          type: 'warning',
          title: 'Lembrete de Pagamento',
          message: `Você tem um pagamento vencendo em ${data.days} dias`,
          actionUrl: '/payments'
        })
      })

      socket.on('complianceAlert', (data) => {
        addNotification({
          type: 'error',
          title: 'Alerta de Compliance',
          message: data.message,
          actionUrl: '/compliance'
        })
      })

      socket.on('fraudAlert', (data) => {
        addNotification({
          type: 'error',
          title: 'Alerta de Fraude',
          message: 'Atividade suspeita detectada em sua conta',
          actionUrl: '/security'
        })
      })

      return () => {
        socket.off('notification')
        socket.off('scoreUpdate')
        socket.off('paymentReminder')
        socket.off('complianceAlert')
        socket.off('fraudAlert')
      }
    }
  }, [socket, isConnected])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]) // Keep only last 100

    // Auto-remove after 30 seconds for info notifications
    if (notification.type === 'info') {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 30000)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )

    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const removeNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))

    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error removing notification:', error)
    }
  }

  const clearAll = async () => {
    setNotifications([])

    try {
      await fetch('/api/notifications/clear', {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  const value = {
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
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
