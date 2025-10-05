import React from 'react'

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  required?: boolean
}

export function Input({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  onKeyPress,
  className = '', 
  disabled = false,
  required = false
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      required={required}
      className={`input ${className}`}
    />
  )
}
