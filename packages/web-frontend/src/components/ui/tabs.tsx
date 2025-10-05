import React, { useState } from 'react'

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  className?: string
}

export function Tabs({ children, defaultValue, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || '')

  return (
    <div className={`tabs ${className}`} data-active-tab={activeTab}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab })
        }
        return child
      })}
    </div>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  children: React.ReactNode
  value: string
  className?: string
  activeTab?: string
  setActiveTab?: (value: string) => void
}

export function TabsTrigger({ 
  children, 
  value, 
  className = '', 
  activeTab, 
  setActiveTab 
}: TabsTriggerProps) {
  const isActive = activeTab === value

  return (
    <button
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive 
          ? 'border-primary-500 text-primary-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      } ${className}`}
      onClick={() => setActiveTab?.(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  children: React.ReactNode
  value: string
  className?: string
  activeTab?: string
}

export function TabsContent({ 
  children, 
  value, 
  className = '', 
  activeTab 
}: TabsContentProps) {
  if (activeTab !== value) return null

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  )
}
