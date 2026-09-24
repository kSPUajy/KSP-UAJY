import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

type MarqueeProps = {
  items: readonly string[]
  separator?: string
  /** Seconds for one full loop. Longer reads calmer. */
  duration?: number
  reverse?: boolean
  accent?: AccentName
  className?: string
}

/**
 * Infinite ticker of C tokens.
 *
 * A server component — the loop is a CSS transform on a duplicated track, so
 * it costs no JavaScript, pauses on hover, and stops completely under
 * `prefers-reduced-motion` (see globals.css). Purely decorative, so the whole
 * strip is hidden from assistive technology.
 */
export function Marquee({
  items,
  separator = '//',
  duration = 38,
  reverse = false,
  accent,
  className,
}: MarqueeProps) {
  // Exactly two copies: the keyframe translates by -50% of the track's own
  // width, which lands the seam on an identical glyph.
  const track = [...items, ...items]

  return (
    <div
      aria-hidden
      data-accent={accent}
      className={cn(
        'marquee relative flex overflow-hidden border-y-2 border-line bg-surface py-2.5',
        className,
      )}
    >
      <div
        className="marquee-track flex w-max shrink-0 items-center"
        data-direction={reverse ? 'reverse' : undefined}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        {track.map((item, index) => (
          <span key={index} className="flex items-center gap-5 pr-5 whitespace-nowrap">
            <span
              className={cn(
                'text-[11px] tracking-[0.08em]',
                index % 3 === 1 ? 'text-accent-fg' : 'text-muted',
              )}
            >
              {item}
            </span>
            <span className="text-[11px] text-dim">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
