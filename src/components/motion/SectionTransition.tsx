'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import type { Variants } from 'motion/react'

import type { AccentName } from '@/lib/accent'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'

/**
 * - `scan`: a bright line sweeps down the band once, like a monitor redraw.
 * - `print`: the band is revealed top to bottom in hard steps, like terminal
 *   output arriving line by line.
 * - `crt`: the band opens from a single horizontal line, like a tube TV
 *   switching on.
 */
export type SectionTransitionKind = 'scan' | 'print' | 'crt'

type SectionTransitionProps = {
  kind: SectionTransitionKind
  /** The accent the sweep line glows in; match the section's. */
  accent?: AccentName
  children: React.ReactNode
}

/** Eight hard steps rather than a smooth ease: output, not a curtain. */
const stepped = (t: number): number => Math.floor(t * 8) / 8

const VARIANTS: Record<SectionTransitionKind, Variants> = {
  scan: { hidden: {}, shown: {} },
  print: {
    hidden: { clipPath: 'inset(0 0 100% 0)' },
    shown: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.9, ease: stepped } },
  },
  crt: {
    hidden: { scaleY: 0.006, scaleX: 0.7, opacity: 0.4, filter: 'brightness(2.4)' },
    shown: {
      scaleY: [0.006, 0.006, 1],
      scaleX: [0.7, 1, 1],
      opacity: [0.4, 1, 1],
      filter: ['brightness(2.4)', 'brightness(2.4)', 'brightness(1)'],
      transition: { duration: 0.75, times: [0, 0.35, 1], ease: [0.7, 0, 0.3, 1] },
    },
  },
}

/**
 * A one-off entrance for a whole section, used on a chosen few only — every
 * band doing its own trick would be noise. Runs once, the first time the
 * section scrolls into view; under reduced motion the section is simply
 * there.
 *
 * The outer box is what gets watched: it is never clipped or scaled, where
 * the animated inner box starts clipped to nothing — and a clipped-away
 * element never counts as "in view", so it would wait forever.
 */
export function SectionTransition({ kind, accent, children }: SectionTransitionProps) {
  const mode = useMotionMode()
  const outer = useRef<HTMLDivElement>(null)
  const inView = useInView(outer, { once: true, amount: 0.15 })

  if (mode === 'reduced') return <div>{children}</div>

  return (
    <div ref={outer} className="relative" data-accent={accent}>
      <motion.div
        data-reveal
        style={kind === 'crt' ? { transformOrigin: '50% 50%' } : undefined}
        variants={VARIANTS[kind]}
        initial="hidden"
        animate={inView ? 'shown' : 'hidden'}
      >
        {children}
      </motion.div>
      {kind === 'scan' ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-10 h-[3px] bg-accent shadow-[0_0_24px_6px_var(--accent)]"
          initial={{ top: '0%', opacity: 0 }}
          animate={inView ? { top: ['0%', '100%'], opacity: [0, 1, 1, 0] } : { top: '0%', opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      ) : null}
    </div>
  )
}
