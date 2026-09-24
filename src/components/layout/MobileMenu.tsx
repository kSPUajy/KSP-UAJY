'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import type { Variants } from 'motion/react'

import { mech } from '@/components/motion/variants'
import { AccountLink } from '@/components/layout/AccountLink'
import { ButtonLink } from '@/components/ui/Button'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
  isActive: (href: string) => boolean
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...mech(0.3), staggerChildren: 0.045, delayChildren: 0.1 },
  },
  exit: { opacity: 0, y: -8, transition: mech(0.2) },
}

const lineVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: mech(0.3) },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

const reducedPanelVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.14, ease: 'linear', staggerChildren: 0 } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'linear' } },
}

const reducedLineVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.14, ease: 'linear' } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: 'linear' } },
}

/**
 * Full-screen overlay menu. Opens like a shell listing: a prompt line, then the
 * routes printing in one after another, then a live cursor waiting for input.
 */
export function MobileMenu({ open, onClose, isActive }: MobileMenuProps) {
  const reduced = useReducedMotion()
  const containerRef = useFocusTrap<HTMLDivElement>(open, onClose)

  const panel = reduced ? reducedPanelVariants : panelVariants
  const line = reduced ? reducedLineVariants : lineVariants

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={containerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 top-16 z-50 flex flex-col overflow-y-auto border-t-2 border-line bg-canvas dot-grid lg:hidden"
        >
          <div className="flex flex-1 flex-col px-4 pt-6 pb-10 sm:px-6">
            <motion.p variants={line} className="text-[11px] text-dim">
              <span className="text-accent-fg">$</span> ls ~/
            </motion.p>

            <nav aria-label="Navigasi utama (mobile)" className="mt-4">
              <ul className="flex flex-col border-t-2 border-line-soft">
                {siteConfig.nav.map((item, index) => {
                  const active = isActive(item.href)
                  return (
                    <motion.li
                      key={item.href}
                      variants={line}
                      data-accent={item.accent}
                      className="border-b-2 border-line-soft"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-baseline gap-3 py-4 transition-colors',
                          active ? 'text-accent-fg' : 'text-fg hover:text-accent-fg',
                        )}
                      >
                        <span className="w-6 shrink-0 text-[11px] text-dim tabular-nums">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="font-display text-[13px] tracking-[0.1em] uppercase">
                          {item.title}
                        </span>
                        <span className="ml-auto truncate pl-3 text-[11px] text-dim">
                          {item.path}
                        </span>
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>

            <motion.div variants={line} className="mt-8" data-accent={siteConfig.cta.accent}>
              <ButtonLink href={siteConfig.cta.href} onClick={onClose} size="lg" className="w-full">
                gabung sekarang
              </ButtonLink>
              <div className="mt-4 sm:hidden">
                <AccountLink size="lg" onNavigate={onClose} />
              </div>
            </motion.div>

            <motion.p variants={line} className="mt-8 text-[11px] text-dim">
              <span className="text-accent-fg">$</span>{' '}
              <span aria-hidden className="cursor-blink inline-block h-[1em] w-[0.6em] translate-y-[0.1em] bg-accent-fg" />
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
