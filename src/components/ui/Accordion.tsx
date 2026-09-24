'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { mech } from '@/components/motion/variants'
import type { AccentName } from '@/lib/accent'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { cn, pad2 } from '@/lib/utils'

export type AccordionItem = {
  id: string
  title: string
  content: React.ReactNode
  /** Rendered small, to the right of the title — a topic, a cost, a count. */
  meta?: React.ReactNode
}

type AccordionProps = {
  items: readonly AccordionItem[]
  allowMultiple?: boolean
  defaultOpenIds?: readonly string[]
  /** Prefixes each row with 01, 02, 03… */
  numbered?: boolean
  /** Replaces the default chevron with a lock that opens — used for hints. */
  variant?: 'default' | 'unlock'
  accent?: AccentName
  className?: string
}

/** A plus that becomes a minus. Two bars, one of them rotating. */
function ToggleGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-3 w-3 shrink-0">
      <span className="absolute top-[5px] left-0 block h-[2px] w-3 bg-current" />
      <span
        className={cn(
          'absolute top-[5px] left-0 block h-[2px] w-3 bg-current transition-transform duration-200 ease-[var(--ease-mech)]',
          open ? 'rotate-0' : 'rotate-90',
        )}
      />
    </span>
  )
}

/**
 * Height is the one property here allowed to animate outside transform and
 * opacity — an accordion genuinely cannot be expressed any other way. Under
 * reduced motion the same transition collapses to 120ms, which reads as
 * instant while keeping the panel from popping.
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  numbered = false,
  variant = 'default',
  accent,
  className,
}: AccordionProps) {
  const uid = useId()
  const reduced = useReducedMotion()
  const [openIds, setOpenIds] = useState<string[]>(() => [...defaultOpenIds])

  const toggle = (id: string): void => {
    setOpenIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id)
      return allowMultiple ? [...current, id] : [id]
    })
  }

  return (
    <div data-accent={accent} className={cn('border-t-2 border-line', className)}>
      {items.map((item, index) => {
        const open = openIds.includes(item.id)
        const buttonId = `${uid}-button-${item.id}`
        const panelId = `${uid}-panel-${item.id}`

        return (
          <div key={item.id} className="border-b-2 border-line">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
                  open ? 'bg-surface-2 text-accent-fg' : 'text-fg hover:bg-surface-2',
                )}
              >
                {numbered ? (
                  <span className="w-6 shrink-0 text-[11px] text-dim tabular-nums">
                    {pad2(index + 1)}
                  </span>
                ) : null}

                <span className="min-w-0 flex-1 text-sm leading-6">{item.title}</span>

                {item.meta ? (
                  <span className="shrink-0 text-[11px] text-dim">{item.meta}</span>
                ) : null}

                {variant === 'unlock' && !open ? (
                  <span className="shrink-0 text-[10px] tracking-[0.1em] text-accent-fg uppercase">
                    buka
                  </span>
                ) : (
                  <ToggleGlyph open={open} />
                )}
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0.12, ease: 'linear' } : mech(0.3)}
                  className="overflow-hidden"
                >
                  <div
                    role="region"
                    id={panelId}
                    aria-labelledby={buttonId}
                    className="px-4 pt-1 pb-5 text-sm leading-7 text-muted"
                  >
                    {item.content}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
