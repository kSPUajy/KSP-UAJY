'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

import { INSTANT, REVEAL_VIEWPORT, mech } from '@/components/motion/variants'
import type { AccentName } from '@/lib/accent'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

type MeterBarProps = {
  value: number
  max: number
  /** Spoken description, e.g. "7 dari 12 kemenangan". */
  label: string
  accent?: AccentName
  /** Seconds to hold before filling — stagger a leaderboard with this. */
  delay?: number
  /** Fill drawn as vertical bars, like the `[||||||   ]` gauges in htop. */
  striped?: boolean
  /** A taller gauge, for rows with room to spare. */
  thick?: boolean
  className?: string
}

/**
 * The bar meters behind the leaderboard, filling like a `htop` gauge.
 *
 * Animates `scaleX` rather than width, so the whole table can fill at once
 * without triggering layout. The fill target stays at zero until the motion
 * preference is known, so the first fill that runs is already the right one —
 * a 0.65s sweep, or under reduced motion an instant jump.
 *
 * Visibility is read from the track, never the fill: at `scaleX(0)` the fill
 * has no area, and a zero-area target is not reliably reported as visible.
 */
export function MeterBar({ value, max, label, accent, delay = 0, striped = false, thick = false, className }: MeterBarProps) {
  const mode = useMotionMode()
  const trackRef = useRef<HTMLDivElement>(null)
  const inView = useInView(trackRef, REVEAL_VIEWPORT)
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0

  return (
    <div
      ref={trackRef}
      data-accent={accent}
      role="img"
      aria-label={label}
      className={cn('w-full border-2 border-line-soft', thick ? 'h-4' : 'h-2', className)}
    >
      {/* The stripes are a mask on this static layer rather than a pattern on
          the fill: a pattern would be squeezed along with the fill's scaleX. */}
      <span
        aria-hidden
        className={cn(
          'block h-full',
          striped && '[mask-image:repeating-linear-gradient(90deg,#000_0_3px,transparent_3px_5px)]',
        )}
      >
        <motion.span
          className="block h-full origin-left bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView && mode !== 'pending' ? ratio : 0 }}
          transition={mode === 'reduced' ? INSTANT : mech(0.65, delay)}
        />
      </span>
    </div>
  )
}
