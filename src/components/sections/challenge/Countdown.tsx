'use client'

import { Fragment } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { mech } from '@/components/motion/variants'
import { deadlineToMs } from '@/lib/format'
import { useNowSeconds } from '@/lib/hooks/useNow'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

type CountdownState = 'pending' | 'open' | 'urgent' | 'closed'

type CountdownProps = {
  /** ISO datetime, read as campus local time (WIB). */
  deadline: string
  /** Human form of the deadline, formatted on the server. */
  deadlineLabel: string
  /** Shown in place of the status line once the deadline has passed. */
  closed: React.ReactNode
  /**
   * The deadline had already passed when the page was generated. Time only
   * moves forward, so the closed state is rendered straight away — on the
   * server too — with no pending frame and no clock to wait for.
   */
  closedAtRender?: boolean
  className?: string
}

type CountdownFaceProps = Omit<CountdownProps, 'closedAtRender'> & {
  state: CountdownState
  parts: readonly number[] | null
  reduced: boolean
}

const UNITS = ['hari', 'jam', 'menit', 'detik'] as const

const STATUS: Record<Exclude<CountdownState, 'closed'>, { label: string; className: string }> = {
  pending: { label: 'memuat', className: 'border-line-soft text-dim' },
  open: { label: 'terbuka', className: 'border-accent-fg text-accent-fg' },
  urgent: { label: 'hari terakhir', className: 'border-line bg-accent text-accent-ink' },
}

const DAY = 86_400
const ZERO = [0, 0, 0, 0] as const

function splitSeconds(total: number): [number, number, number, number] {
  return [
    Math.floor(total / DAY),
    Math.floor((total % DAY) / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ]
}

function spoken(state: CountdownState, parts: readonly number[] | null): string {
  if (state === 'pending' || !parts) return 'Menghitung sisa waktu pengumpulan.'
  if (state === 'closed') return 'Waktu pengumpulan sudah habis.'
  const [days = 0, hours = 0, minutes = 0] = parts
  // Seconds are left out on purpose: this text is read on demand, and a value
  // that changes every second is noise when someone lands on it.
  return `Sisa waktu pengumpulan ${days} hari, ${hours} jam, ${minutes} menit.`
}

/**
 * One split-flap tile. On change the old digit tips away and the new one
 * swings down into place — `rotateX` with perspective, transform and opacity
 * only. Reduced motion swaps the character with no movement at all.
 */
function FlipDigit({ value, reduced }: { value: string; reduced: boolean }) {
  return (
    <span className="relative flex h-[1.45em] w-[1.05em] items-center justify-center overflow-hidden border-2 border-line bg-code-bg">
      {reduced ? (
        <span>{value}</span>
      ) : (
        <AnimatePresence initial={false}>
          <motion.span
            key={value}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformPerspective: 320 }}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={mech(0.36)}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      )}
      {/* The hinge every split-flap display has across its middle. */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-canvas/70" />
    </span>
  )
}

/** What the countdown shows in a given state. The clock itself lives in `LiveCountdown`. */
function CountdownFace({ deadline, deadlineLabel, closed, className, state, parts, reduced }: CountdownFaceProps) {
  return (
    <div data-state={state} className={cn('@container', className)}>
      <div role="timer" aria-atomic="true">
        <p className="sr-only">{spoken(state, parts)}</p>

        <div
          aria-hidden
          className={cn(
            'flex items-start gap-[0.2em] font-mono text-[clamp(1.25rem,7.6cqi,2.5rem)] leading-none font-bold tabular-nums',
            state === 'urgent' && 'text-accent-fg',
            state === 'open' && 'text-fg',
            (state === 'closed' || state === 'pending') && 'text-dim',
          )}
        >
          {UNITS.map((unit, index) => {
            const value = parts?.[index]
            const digits =
              value === undefined ? ['–', '–'] : Array.from(value.toString().padStart(2, '0'))

            return (
              <Fragment key={unit}>
                {index > 0 ? (
                  <span className="flex h-[1.45em] w-[0.45em] items-center justify-center text-dim">
                    :
                  </span>
                ) : null}

                <span className="flex flex-col items-center gap-2">
                  <span className="flex gap-[0.12em]">
                    {digits.map((digit, position) => (
                      <FlipDigit key={position} value={digit} reduced={reduced} />
                    ))}
                  </span>
                  <span className="text-[10px] leading-none font-normal tracking-[0.12em] text-dim uppercase">
                    {unit}
                  </span>
                </span>
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="mt-5 text-[11px] leading-5">
        {state === 'closed' ? (
          closed
        ) : (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
            <span
              className={cn(
                'inline-flex h-5 items-center gap-1.5 border-2 px-1.5 font-display text-[9px] tracking-[0.1em] uppercase',
                STATUS[state].className,
              )}
            >
              <span
                aria-hidden
                className={cn('block h-1.5 w-1.5 bg-current', state !== 'pending' && 'cursor-blink')}
              />
              {STATUS[state].label}
            </span>
            <span>
              batas <time dateTime={`${deadline}+07:00`}>{deadlineLabel}</time>
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

function LiveCountdown(props: Omit<CountdownProps, 'closedAtRender'>) {
  const now = useNowSeconds()
  const reduced = useReducedMotion()

  const end = Math.floor(deadlineToMs(props.deadline) / 1000)
  const remaining = now === null ? null : Math.max(0, end - now)

  const state: CountdownState =
    remaining === null ? 'pending' : remaining === 0 ? 'closed' : remaining < DAY ? 'urgent' : 'open'
  const parts = remaining === null ? null : splitSeconds(remaining)

  return <CountdownFace {...props} state={state} parts={parts} reduced={reduced} />
}

/**
 * Live countdown to a challenge deadline: days, hours, minutes, seconds.
 *
 * The server never renders a running time — it cannot know the reader's
 * clock, and a statically built page would freeze whatever the build machine
 * saw. Until the shared clock is available the tiles hold dashes, sized
 * exactly like the digits that replace them, so nothing shifts when they
 * arrive. When the deadline passes while the page is open, it flips to the
 * closed state on its own.
 *
 * A deadline that had passed before the page was generated is the exception:
 * with `closedAtRender` the countdown renders closed from the first byte and
 * never subscribes to the clock.
 */
export function Countdown({ closedAtRender = false, ...props }: CountdownProps) {
  if (closedAtRender) return <CountdownFace {...props} state="closed" parts={ZERO} reduced />
  return <LiveCountdown {...props} />
}
