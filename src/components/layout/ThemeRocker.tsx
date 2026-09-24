'use client'

import { motion } from 'motion/react'

import { useTheme } from '@/components/layout/ThemeProvider'
import { ROCKER_SPRING } from '@/components/motion/variants'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

/** Pixel crescent, drawn on an 8x8 cell grid so it stays crisp at any size. */
function PixelMoon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges" aria-hidden focusable="false">
      <g fill="currentColor">
        <rect x="6" y="0" width="4" height="2" />
        <rect x="4" y="2" width="4" height="2" />
        <rect x="2" y="4" width="4" height="8" />
        <rect x="4" y="12" width="4" height="2" />
        <rect x="6" y="14" width="4" height="2" />
      </g>
    </svg>
  )
}

function PixelSun() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges" aria-hidden focusable="false">
      <g fill="currentColor">
        <rect x="5" y="5" width="6" height="6" />
        <rect x="7" y="1" width="2" height="3" />
        <rect x="7" y="12" width="2" height="3" />
        <rect x="1" y="7" width="3" height="2" />
        <rect x="12" y="7" width="3" height="2" />
      </g>
    </svg>
  )
}

/**
 * Physical rocker switch. The key snaps between two seats on a stiff spring —
 * one of only two places in the system allowed to overshoot — and takes a
 * short squash on press so it reads as an audible click.
 *
 * `initial={false}` keeps it from sliding across on load when hydration
 * corrects the server's dark-by-default assumption.
 */
export function ThemeRocker() {
  const { theme, toggleTheme } = useTheme()
  const reduced = useReducedMotion()

  const isLight = theme === 'light'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Mode terang"
      onClick={toggleTheme}
      className="relative h-7 w-14 shrink-0 border-2 border-line bg-surface-2"
    >
      {/* Seat markings, so the empty half never reads as a dead area. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-[5px] text-dim"
      >
        <PixelMoon />
        <PixelSun />
      </span>

      {/* `whileTap` makes Motion give the element `tabindex="0"` for keyboard
          presses. The button already takes those, and a focusable node inside
          `aria-hidden` is invisible to screen readers yet still a Tab stop. */}
      <motion.span
        aria-hidden
        tabIndex={-1}
        className="absolute top-0 left-0 flex h-6 w-6 items-center justify-center bg-accent text-accent-ink"
        initial={false}
        animate={{ x: isLight ? 28 : 0 }}
        whileTap={reduced ? undefined : { scaleY: 0.82 }}
        transition={reduced ? { duration: 0.12, ease: 'linear' } : ROCKER_SPRING}
      >
        {isLight ? <PixelSun /> : <PixelMoon />}
      </motion.span>
    </button>
  )
}
