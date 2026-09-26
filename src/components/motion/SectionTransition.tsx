'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import type { Variants } from 'motion/react'

import { useMotionMode } from '@/lib/hooks/useReducedMotion'

/**
 * - `crt`: the band opens from a single horizontal line, like a tube TV
 *   switching on.
 */
export type SectionTransitionKind = 'crt'

type SectionTransitionProps = {
  kind: SectionTransitionKind
  children: React.ReactNode
}

const VARIANTS: Record<SectionTransitionKind, Variants> = {
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
 * The outer box is what gets watched: it is never scaled, where the
 * animated inner box starts squashed to a line and would barely register
 * as "in view".
 */
export function SectionTransition({ kind, children }: SectionTransitionProps) {
  const mode = useMotionMode()
  const outer = useRef<HTMLDivElement>(null)
  const inView = useInView(outer, { once: true, amount: 0.15 })

  if (mode === 'reduced') return <div>{children}</div>

  return (
    <div ref={outer}>
      <motion.div
        data-reveal
        style={{ transformOrigin: '50% 50%' }}
        variants={VARIANTS[kind]}
        initial="hidden"
        animate={inView ? 'shown' : 'hidden'}
      >
        {children}
      </motion.div>
    </div>
  )
}
