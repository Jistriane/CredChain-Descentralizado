import React from 'react'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
}

export function ScrollArea({ children, className = '' }: ScrollAreaProps) {
  return (
    <div className={`scrollbar-thin overflow-auto ${className}`}>
      {children}
    </div>
  )
}
