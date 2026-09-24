'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

let mediaQueryList: MediaQueryList | null = null

function mediaQuery(): MediaQueryList {
  mediaQueryList ??= window.matchMedia(QUERY)
  return mediaQueryList
}

function subscribe(onChange: () => void): () => void {
  const list = mediaQuery()
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

/**
 * Hydration-safe stand-in for Motion's `useReducedMotion`, for choosing what
 * to *render*.
 *
 * Motion's hook returns `null` on the server but reads `matchMedia` during the
 * client's very first render, so any component that renders different markup
 * for reduced motion hydrates against the wrong tree — for exactly the
 * visitors who asked for less motion. This one reports `false` through SSR and
 * hydration so the markup matches, then re-renders with the real preference
 * straight after. It also follows the OS setting live, which Motion's does not.
 *
 * ESLint forbids importing the Motion version anywhere in this codebase.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => mediaQuery().matches,
    () => false,
  )
}

/**
 * `pending` until the preference is actually known, then `full` or `reduced`.
 *
 * For choosing what to *animate*. An entrance must not start until this
 * resolves: Motion decides whether to re-animate by comparing target values,
 * not variant labels, so switching a scheduled `show` to `calm` after the fact
 * is silently ignored whenever both end at the same values — which, for an
 * entrance, they always do. Holding at `hidden` while `pending` means the first
 * animation anything runs is already the right one.
 *
 * One store for both facts, so they can never resolve in separate renders.
 */
export type MotionMode = 'pending' | 'full' | 'reduced'

export function useMotionMode(): MotionMode {
  return useSyncExternalStore(
    subscribe,
    () => (mediaQuery().matches ? 'reduced' : 'full'),
    () => 'pending',
  )
}
