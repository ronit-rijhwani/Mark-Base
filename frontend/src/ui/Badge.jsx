import React from 'react'

const variantClass = {
  neutral: 'badge badge-secondary',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  info: 'badge badge-info',
}

export default function Badge({ variant = 'neutral', className = '', children, ...props }) {
  const cls = `${variantClass[variant] || variantClass.neutral} ${className}`.trim()
  return (
    <span className={cls} {...props}>
      {children}
    </span>
  )
}

