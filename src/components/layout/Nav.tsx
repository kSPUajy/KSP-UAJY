'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useCallback, useState } from 'react'

import { AccountLink } from '@/components/layout/AccountLink'
import { Logo } from '@/components/layout/Logo'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ThemeRocker } from '@/components/layout/ThemeRocker'
import { ButtonLink } from '@/components/ui/Button'
import { INSTANT, mech } from '@/components/motion/variants'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'

/** `/tentor/andi-pratama` keeps the `/tentor` tab lit. */
export function isRouteActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Three hard bars, or a cross when the overlay is open. No icon library. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-4 w-5">
      <span
        className={cn(
          'absolute left-0 block h-[2px] w-5 bg-current transition-transform duration-200 ease-[var(--ease-mech)]',
          open ? 'top-[7px] rotate-45' : 'top-0',
        )}
      />
      <span
        className={cn(
          'absolute top-[7px] left-0 block h-[2px] w-5 bg-current transition-opacity duration-150',
          open ? 'opacity-0' : 'opacity-100',
        )}
      />
      <span
        className={cn(
          'absolute left-0 block h-[2px] w-5 bg-current transition-transform duration-200 ease-[var(--ease-mech)]',
          open ? 'top-[7px] -rotate-45' : 'top-[14px]',
        )}
      />
    </span>
  )
}

export function Nav() {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [seenPathname, setSeenPathname] = useState(pathname)

  // Every menu link already closes on click; this covers back/forward while the
  // overlay is open. Adjusting during render is React's documented alternative
  // to resetting state from an effect.
  if (pathname !== seenPathname) {
    setSeenPathname(pathname)
    setMenuOpen(false)
  }

  const isActive = useCallback((href: string) => isRouteActive(href, pathname), [pathname])

  return (
    <header className="sticky top-0 z-50 border-b-2 border-line bg-canvas">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:gap-4 lg:px-8">
        <Logo />

        {/* Editor tab strip */}
        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-stretch border-x-2 border-line-soft">
            {siteConfig.nav.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href} className="border-r-2 border-line-soft last:border-r-0">
                  <Link
                    href={item.href}
                    data-accent={item.accent}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex h-16 items-center px-3 text-[11px] tracking-tight transition-colors xl:px-4 xl:text-[13px]',
                      active
                        ? 'bg-surface text-fg'
                        : 'text-muted hover:bg-surface-2 hover:text-fg',
                    )}
                  >
                    {item.label}
                    {active ? (
                      <motion.span
                        layoutId="nav-tab-underline"
                        className="absolute inset-x-0 bottom-0 block h-[3px] bg-accent-fg"
                        transition={reduced ? INSTANT : mech(0.32)}
                      />
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:gap-3">
          <span className="hidden sm:block">
            <AccountLink />
          </span>
          <ThemeRocker />

          <div data-accent={siteConfig.cta.accent}>
            <ButtonLink href={siteConfig.cta.href} size="sm">
              {siteConfig.cta.label}
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="flex h-8 w-10 items-center justify-center border-2 border-line bg-surface text-fg lg:hidden"
          >
            <MenuGlyph open={menuOpen} />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </header>
  )
}
