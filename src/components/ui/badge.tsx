import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export function Badge({ 
  children, 
  className = '', 
  variant = 'secondary'
}: BadgeProps) {
  const baseClasses = 'badge'
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
