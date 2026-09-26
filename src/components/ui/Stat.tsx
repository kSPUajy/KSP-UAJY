'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'

import { EASE_MECH, REVEAL_VIEWPORT } from '@/components/motion/variants'
import type { AccentName } from '@/lib/accent'
import { formatCount } from '@/lib/format'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

type CountUpProps = {
  value: number
  /** Seconds. */
  duration?: number
  /**
   * Seconds to hold at zero before counting. Only for numbers that are still
   * hidden while they wait — the hero's stats strip, which fades in on its own
   * beat — otherwise the reader watches a zero sit there.
   */
  delay?: number
  className?: string
}

/**
 * Counts up once, when it enters the viewport.
 *
 * The motion value starts AT the final number, so the server-rendered HTML and
 * a JavaScript-disabled browser both show the real figure; entering the
 * viewport resets it to zero and animates, inside the same frame the animation
 * begins, so the reset is never painted.
 *
 * The animating span is hidden from assistive tech and shadowed by a static
 * one — a number changing sixty times a second is noise in a screen reader.
 */
export function CountUp({ value, duration = 1.2, delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, REVEAL_VIEWPORT)
  const mode = useMotionMode()
  // The delay belongs to the page's entrance, not to the moment the number
  // scrolls into view — on a short screen the hero's stats arrive late.
  const [mountedAt] = useState(() => performance.now())

  const count = useMotionValue(value)
  const display = useTransform(count, (latest) => formatCount(Math.round(latest)))

  useEffect(() => {
    // Nothing counts until the preference is known. Reduced motion pins the
    // real figure — which also repairs a count that was interrupted halfway.
    if (!inView || mode === 'pending') return
    if (mode === 'reduced') {
      count.set(value)
      return
    }
    count.set(0)
    const remaining = Math.max(0, delay - (performance.now() - mountedAt) / 1000)
    const controls = animate(count, value, { duration, delay: remaining, ease: EASE_MECH })
    return () => controls.stop()
  }, [inView, mode, value, duration, delay, count, mountedAt])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      <span className="sr-only">{formatCount(value)}</span>
      <motion.span aria-hidden>{display}</motion.span>
    </span>
  )
}

type StatProps = {
  value: number
  label: string
  /** Trails the number: `+`, `%`, `ms`. */
  suffix?: string
  accent?: AccentName
  /** Seconds to hold before counting — see `CountUp`. */
  delay?: number
  className?: string
}

export function Stat({ value, label, suffix, accent, delay, className }: StatProps) {
  return (
    <div data-accent={accent} className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span className="font-display text-[clamp(1.375rem,3.6vw,2rem)] leading-none text-accent-fg">
        <CountUp value={value} delay={delay} />
        {suffix ? <span aria-hidden>{suffix}</span> : null}
      </span>
      <span className="text-[10px] leading-4 tracking-[0.1em] text-muted uppercase">{label}</span>
    </div>
  )
}
