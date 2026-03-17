import React, { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { motionEase, motionDurations } from './motion'

export default function Drawer({
  open,
  onOpenChange,
  title,
  children,
  side = 'right',
  width = 420,
}) {
  const titleId = useId()
  const panelRef = useRef(null)
  const lastActiveRef = useRef(null)

  useEffect(() => {
    if (!open) return
    lastActiveRef.current = document.activeElement
    const t = setTimeout(() => panelRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (open) return
    const el = lastActiveRef.current
    if (el && typeof el.focus === 'function') el.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const isRight = side === 'right'
  const xFrom = isRight ? 40 : -40

  return (
    <AnimatePresence>
      {open && (
        <div className="drawer-root" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <motion.div
            className="drawer-backdrop"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDurations.short, ease: motionEase.out }}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className={`drawer-panel drawer-${side}`}
            style={{ width }}
            initial={{ opacity: 0, x: xFrom }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: xFrom }}
            transition={{ duration: motionDurations.base, ease: motionEase.out }}
          >
            <div className="drawer-header">
              <div className="drawer-title" id={titleId}>
                {title}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenChange(false)}
                aria-label="Close panel"
              >
                Close
              </button>
            </div>
            <div className="drawer-body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

