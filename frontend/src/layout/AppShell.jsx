import React, { useMemo, useState } from 'react'
import { LayoutGrid, Users, BookOpen, BarChart3, Menu } from 'lucide-react'
import Drawer from '../ui/Drawer'

function iconFor(key) {
  switch (key) {
    case 'overview':
      return LayoutGrid
    case 'structure':
      return BookOpen
    case 'users':
      return Users
    case 'attendance':
      return BarChart3
    default:
      return null
  }
}

export default function AppShell({
  title,
  subtitle,
  navItems = [],
  navValue,
  onNavChange,
  actions,
  children,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const hasNav = navItems && navItems.length > 0 && typeof onNavChange === 'function'

  const sidebar = useMemo(() => {
    if (!hasNav) return null

    return (
      <nav className="appShell-nav" aria-label="Primary">
        <div className="appShell-navTitle">Menu</div>
        <ul className="appShell-navList">
          {navItems.map((it) => {
            const Icon = it.icon || iconFor(it.value)
            const active = it.value === navValue
            return (
              <li key={it.value} className="appShell-navItem">
                <button
                  type="button"
                  className={`appShell-navBtn ${active ? 'is-active' : ''}`.trim()}
                  onClick={() => onNavChange(it.value)}
                  aria-current={active ? 'page' : undefined}
                >
                  {Icon ? <Icon size={18} aria-hidden="true" /> : null}
                  <span>{it.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }, [hasNav, navItems, navValue, onNavChange])

  return (
    <div className="appShell">
      {hasNav ? <aside className="appShell-sidebar">{sidebar}</aside> : null}

      <div className="appShell-main">
        <header className="appShell-topbar">
          <div className="appShell-topbarLeft">
            {hasNav ? (
              <button
                type="button"
                className="appShell-menuBtn"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} aria-hidden="true" />
                <span>Menu</span>
              </button>
            ) : null}

            <div className="appShell-titleBlock">
              <div className="appShell-title">{title}</div>
              {subtitle ? <div className="appShell-subtitle">{subtitle}</div> : null}
            </div>
          </div>

          {actions ? <div className="appShell-actions">{actions}</div> : null}
        </header>

        <main className="appShell-content" id="main">
          {children}
        </main>
      </div>

      {hasNav ? (
        <Drawer
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          title="Menu"
          side="left"
          width={320}
        >
          <div
            onClick={(e) => {
              // close drawer when selecting a nav item
              const btn = e.target.closest?.('button')
              if (btn && btn.classList.contains('appShell-navBtn')) setMobileNavOpen(false)
            }}
          >
            {sidebar}
          </div>
        </Drawer>
      ) : null}
    </div>
  )
}

