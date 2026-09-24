'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'

import { INSTANT, mech } from '@/components/motion/variants'
import type { AccentName } from '@/lib/accent'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export type TabItem = {
  id: string
  label: string
  /** Printed dim before the label and hidden from assistive tech, e.g. `--view=`. */
  prefix?: string
  content: React.ReactNode
}

type TabsProps = {
  items: readonly TabItem[]
  defaultId?: string
  accent?: AccentName
  /** Names the tablist for screen readers, e.g. "Solusi atau pendekatan". */
  ariaLabel: string
  /**
   * `label` is the uppercase tab strip. `flag` sets the labels as lowercase
   * command-line flags, for switching between views of the same content.
   */
  variant?: 'label' | 'flag'
  className?: string
  panelClassName?: string
}

const TAB_TEXT: Record<NonNullable<TabsProps['variant']>, string> = {
  label: 'text-[11px] tracking-[0.08em] uppercase',
  flag: 'text-xs',
}

/**
 * WAI-ARIA tabs with automatic activation: arrows move and select in one go,
 * Home/End jump to the ends. The sliding indicator is the same `layoutId`
 * trick the nav uses, so the two read as one system.
 */
export function Tabs({
  items,
  defaultId,
  accent,
  ariaLabel,
  variant = 'label',
  className,
  panelClassName,
}: TabsProps) {
  const uid = useId()
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id ?? '')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const tabDomId = (id: string): string => `${uid}-tab-${id}`
  const panelDomId = (id: string): string => `${uid}-panel-${id}`

  const focusTab = useCallback(
    (index: number) => {
      const bounded = (index + items.length) % items.length
      const next = items[bounded]
      if (!next) return
      setActiveId(next.id)
      tabRefs.current[bounded]?.focus()
    },
    [items],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        focusTab(index + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        focusTab(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(items.length - 1)
        break
      default:
        break
    }
  }

  return (
    <div data-accent={accent} className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex items-stretch border-b-2 border-line"
      >
        {items.map((item, index) => {
          const selected = item.id === activeId
          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              role="tab"
              id={tabDomId(item.id)}
              aria-selected={selected}
              aria-controls={panelDomId(item.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'relative border-r-2 border-line-soft px-4 py-3 transition-colors last:border-r-0',
                TAB_TEXT[variant],
                selected ? 'bg-surface text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {item.prefix ? (
                <span aria-hidden className="text-dim">
                  {item.prefix}
                </span>
              ) : null}
              {item.label}
              {selected ? (
                <motion.span
                  layoutId={`${uid}-tab-indicator`}
                  className="absolute inset-x-0 -bottom-[2px] block h-[3px] bg-accent-fg"
                  transition={reduced ? INSTANT : mech(0.3)}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={panelDomId(item.id)}
          aria-labelledby={tabDomId(item.id)}
          hidden={item.id !== activeId}
          tabIndex={0}
          className={cn('focus-visible:outline-offset-4', panelClassName)}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
