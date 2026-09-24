'use client'

import { AnimatePresence, motion } from 'motion/react'

import { CALM, mech } from '@/components/motion/variants'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { AccentName } from '@/lib/accent'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'

type DrawerProps = {
  open: boolean
  onClose: () => void
  /** Id of the heading inside that names the dialog. */
  labelledBy: string
  /** Window title — the path of whatever is open. */
  title: string
  accent?: AccentName
  children: React.ReactNode
}

/** The one real control in a title bar full of drawn ones. */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-6 items-center gap-1.5 border-2 border-line-soft px-2 text-[10px] tracking-[0.08em] text-muted uppercase transition-colors hover:border-line hover:text-accent-fg"
    >
      tutup <span aria-hidden>✕</span>
    </button>
  )
}

/**
 * A modal panel: a bottom sheet on phones, a full-height panel on the right
 * edge from `md` up. Focus moves in, Tab stays in, Escape and the backdrop
 * close it, the page behind stops scrolling, and focus goes back to whatever
 * opened it — all through `useFocusTrap`.
 *
 * It slides in from whichever edge it lives on; under reduced motion it only
 * fades. The edge is only known on the client, which is fine: a drawer never
 * exists until someone opens it.
 */
export function Drawer({ open, onClose, labelledBy, title, accent, children }: DrawerProps) {
  const mode = useMotionMode()
  const wide = useMediaQuery('(min-width: 768px)')
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose)

  const offscreen = mode === 'reduced' ? { opacity: 0 } : wide ? { x: '100%' } : { y: '100%' }
  const onscreen = mode === 'reduced' ? { opacity: 1 } : { x: 0, y: 0 }
  const transition = mode === 'reduced' ? CALM : mech(0.38)

  return (
    <AnimatePresence>
      {open ? (
        <div key="drawer" data-accent={accent} className="fixed inset-0 z-60">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-canvas/80"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={mode === 'reduced' ? CALM : mech(0.25)}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[30rem]"
            initial={offscreen}
            animate={onscreen}
            exit={offscreen}
            transition={transition}
          >
            <TerminalWindow
              title={title}
              shadow={false}
              actions={<CloseButton onClick={onClose} />}
              className="flex min-h-0 flex-1 flex-col border-b-0 md:border-r-0"
              bodyClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6"
            >
              {children}
            </TerminalWindow>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
