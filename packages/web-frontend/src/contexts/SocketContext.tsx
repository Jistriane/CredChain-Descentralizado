'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  reconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'
      
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setIsConnected(true)
        setConnectionError(null)
      })

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
        setConnectionError(reason)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnectionError(error.message)
        setIsConnected(false)
      })

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts')
        setIsConnected(true)
        setConnectionError(null)
      })

      newSocket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error)
        setConnectionError(error.message)
      })

      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed')
        setConnectionError('Falha na reconexão')
      })

      // Listen for real-time updates
      newSocket.on('scoreUpdate', (data) => {
        console.log('Score update received:', data)
        // Handle score updates
      })

      newSocket.on('paymentUpdate', (data) => {
        console.log('Payment update received:', data)
        // Handle payment updates
      })

      newSocket.on('notification', (data) => {
        console.log('Notification received:', data)
        // Handle notifications
      })

      newSocket.on('complianceAlert', (data) => {
        console.log('Compliance alert received:', data)
        // Handle compliance alerts
      })

      newSocket.on('fraudAlert', (data) => {
        console.log('Fraud alert received:', data)
        // Handle fraud alerts
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [isAuthenticated, user])

  const reconnect = () => {
    if (socket) {
      socket.disconnect()
      socket.connect()
    }
  }

  const value = {
    socket,
    isConnected,
    connectionError,
    reconnect
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
