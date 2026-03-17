import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ items, className = '' }) {
  return (
    <nav className={`breadcrumbs ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li className="breadcrumbs-item" key={`${it.label}-${idx}`}>
              {idx > 0 && <ChevronRight size={14} aria-hidden="true" className="breadcrumbs-sep" />}
              {isLast ? (
                <span aria-current="page" className="breadcrumbs-current">
                  {it.label}
                </span>
              ) : it.href ? (
                <a className="breadcrumbs-link" href={it.href}>
                  {it.label}
                </a>
              ) : (
                <span className="breadcrumbs-text">{it.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

