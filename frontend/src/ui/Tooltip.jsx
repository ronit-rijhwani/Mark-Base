import React, { useId, useState } from 'react'

/**
 * Lightweight tooltip:
 * - Shows on hover + keyboard focus.
 * - Uses aria-describedby to announce content when focused.
 */
export default function Tooltip({ content, children, className = '' }) {
  const id = useId()
  const [open, setOpen] = useState(false)

  if (!content) return children

  return (
    <span
      className={`tooltip-wrap ${className}`.trim()}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.cloneElement(children, {
        'aria-describedby': id,
      })}
      <span
        id={id}
        role="tooltip"
        className={`tooltip ${open ? 'tooltip-open' : ''}`.trim()}
      >
        {content}
      </span>
    </span>
  )
}

