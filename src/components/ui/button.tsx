import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  }
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  )
}
