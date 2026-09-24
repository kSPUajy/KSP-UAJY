import type { Transition, Variants } from 'motion/react'

import type { MotionMode } from '@/lib/hooks/useReducedMotion'

/**
 * Global easing. Everything mechanical uses this curve — fast out of the gate,
 * hard settle, no overshoot. Springs are reserved for the theme rocker and
 * button presses.
 */
export const EASE_MECH: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * `delay` is only written when it is non-zero, and that matters. Motion builds
 * each value's transition as `{ delay: orchestratedDelay, ...variantTransition }`,
 * so an explicit `delay: 0` inside a variant silently cancels the delay a
 * parent's `staggerChildren` or `delayChildren` handed it.
 */
export const mech = (duration = 0.4, delay = 0): Transition =>
  delay > 0 ? { duration, delay, ease: EASE_MECH } : { duration, ease: EASE_MECH }

/** Zero-length transition, for anything that should jump rather than glide. */
export const INSTANT: Transition = { duration: 0 }

/**
 * The reduced-motion transition: a linear opacity fade under 150ms, with
 * every transform snapping straight to its target.
 */
export const CALM: Transition = {
  duration: 0.14,
  ease: 'linear',
  x: INSTANT,
  y: INSTANT,
  scale: INSTANT,
  scaleX: INSTANT,
}

/**
 * Variant label an entrance should be at, given the motion mode.
 *
 * While the preference is still `pending` (SSR and hydration) everything
 * holds at `hidden`, and only then moves to `show` or its reduced twin,
 * `calm`. The hold is load-bearing: Motion compares target *values* to decide
 * whether to re-animate, and `show` and `calm` end at identical values, so an
 * entrance that had already been scheduled as `show` could never be switched
 * to `calm` afterwards. See `useMotionMode`.
 */
export const enterLabel = (mode: MotionMode): 'hidden' | 'calm' | 'show' =>
  mode === 'pending' ? 'hidden' : mode === 'reduced' ? 'calm' : 'show'

/** Reveals fire once, 80px before the element reaches the viewport edge. */
export const REVEAL_VIEWPORT = { once: true, margin: '-80px' } as const

/**
 * Scroll reveal: 16px rise plus a fade. `show` takes an optional delay through
 * Motion's `custom` prop — a component's own `transition` prop never reaches a
 * variant that declares a transition of its own, so this is the only way to
 * hold one reveal back. Stagger children pass nothing and keep the delay their
 * parent hands them.
 */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay?: number) => ({ opacity: 1, y: 0, transition: mech(0.45, delay) }),
  calm: { opacity: 1, y: 0, transition: CALM },
}

export const staggerParent = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
  calm: {},
})

/** The one place a spring is allowed besides button presses. */
export const ROCKER_SPRING: Transition = {
  type: 'spring',
  stiffness: 700,
  damping: 26,
  mass: 0.6,
}
