import { cn } from '@/lib/utils'

type Slot = {
  /** Percent of the field's width and height. */
  x: number
  y: number
  /** Which breakpoints show it — the field thins out as the text widens. */
  from: 'base' | 'sm' | 'lg'
}

/**
 * Hand-placed rather than scattered: every slot sits clear of where the
 * prompt, the wordmark, the tagline and the buttons land at that breakpoint,
 * so no token ever passes behind text someone is reading. On phones the text
 * spans the full width and only the gap beside the wordmark stays free.
 */
const SLOTS: readonly Slot[] = [
  { x: 84, y: 8, from: 'base' },
  { x: 80, y: 27, from: 'base' },
  { x: 86, y: 37, from: 'base' },
  { x: 66, y: 6, from: 'sm' },
  { x: 90, y: 14, from: 'sm' },
  { x: 72, y: 40, from: 'lg' },
  { x: 86, y: 47, from: 'sm' },
  { x: 64, y: 55, from: 'lg' },
  { x: 94, y: 60, from: 'sm' },
  { x: 76, y: 66, from: 'lg' },
  { x: 88, y: 76, from: 'sm' },
  { x: 68, y: 84, from: 'lg' },
  { x: 82, y: 91, from: 'lg' },
  { x: 56, y: 9, from: 'lg' },
  { x: 96, y: 88, from: 'lg' },
  { x: 60, y: 72, from: 'lg' },
]

const VISIBILITY: Record<Slot['from'], string> = {
  base: 'block',
  sm: 'hidden sm:block',
  lg: 'hidden lg:block',
}

/** Small deterministic PRNG (mulberry32): the same field on every build. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Motion = {
  duration: number
  fade: number
  delay: number
  dx: number
  dy: number
  opacity: number
}

/**
 * Per-slot timing, computed once at module load. Periods are deliberately
 * unrelated so the field never falls into step, and the negative delays start
 * every token somewhere in the middle of its cycle.
 */
const MOTION: readonly Motion[] = (() => {
  const random = seeded(0x6b7370)
  const between = (min: number, max: number): number => min + random() * (max - min)

  return SLOTS.map(() => ({
    duration: between(14, 26),
    fade: between(9, 17),
    delay: -between(0, 20),
    dx: between(-18, 18),
    dy: -between(14, 38),
    opacity: between(0.35, 0.75),
  }))
})()

const round = (value: number): string => value.toFixed(2)

/**
 * The hero's backdrop: a slow drift of dim C tokens and hex addresses.
 *
 * A server component: the whole effect is CSS keyframes (`.drift-field` in
 * globals.css) fed by per-token custom properties, so it costs no JavaScript,
 * runs before hydration, and stops dead under reduced motion. Decoration only —
 * inert and hidden from assistive tech.
 */
export function DriftField({ tokens, className }: { tokens: readonly string[]; className?: string }) {
  if (tokens.length === 0) return null

  return (
    <div
      aria-hidden
      className={cn(
        'drift-field pointer-events-none absolute inset-0 overflow-hidden select-none',
        className,
      )}
    >
      {SLOTS.map((slot, index) => {
        const motion = MOTION[index]
        if (!motion) return null
        const token = tokens[index % tokens.length]

        return (
          <span
            key={index}
            className={cn(
              'absolute text-[11px] leading-none whitespace-nowrap text-dim sm:text-xs',
              VISIBILITY[slot.from],
            )}
            style={
              {
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                translate: '-50% 0',
                '--drift-duration': `${round(motion.duration)}s`,
                '--drift-fade': `${round(motion.fade)}s`,
                '--drift-delay': `${round(motion.delay)}s`,
                '--drift-x': `${round(motion.dx)}px`,
                '--drift-y': `${round(motion.dy)}px`,
                '--drift-opacity': round(motion.opacity),
              } as React.CSSProperties
            }
          >
            {token}
          </span>
        )
      })}
    </div>
  )
}
