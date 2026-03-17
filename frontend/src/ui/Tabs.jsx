import React from 'react'

/**
 * Accessible tabs-like segmented control for simple page switching.
 * Uses buttons (not role=tablist) to avoid ARIA complexity since panels are rendered conditionally.
 */
export default function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={`tabs ${className}`.trim()}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          className={`tab ${value === it.value ? 'active' : ''}`.trim()}
          onClick={() => onChange(it.value)}
          disabled={it.disabled}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

