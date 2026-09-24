import { TentorCard } from '@/components/sections/tentor/TentorCard'
import type { Tentor } from '@/lib/types'

type TentorCarouselProps = {
  tentors: readonly Tentor[]
  /** Seconds each card spends crossing the screen; the loop scales with the roster. */
  secondsPerCard?: number
}

const SIZES = '(min-width: 640px) 272px, 224px'

/** Enough cards (≈296px each) to span a 3500px-wide screen. */
const MIN_CARDS = 12

/**
 * Every tentor on one endlessly scrolling row, bleeding to both edges of the
 * screen past the section's max width — the ticker's CSS loop, so no
 * JavaScript. It pauses under the pointer or keyboard focus, so a card can be
 * read and hovered; under reduced motion it becomes a plain swipeable row.
 *
 * Every copy after the first exists only to fill and close the loop: hidden from assistive tech
 * and `inert`, so screen readers and Tab meet each tentor exactly once.
 */
export function TentorCarousel({ tentors, secondsPerCard = 5 }: TentorCarouselProps) {
  // One half of the loop must be wider than the widest screen, or a gap
  // shows at its seam: repeat a short roster until a half holds MIN_CARDS.
  const repeat = Math.max(1, Math.ceil(MIN_CARDS / Math.max(tentors.length, 1)))
  const copies = Array.from({ length: repeat * 2 }, (_, index) => ({ key: index, clone: index > 0 }))

  return (
    <div className="carousel mx-[calc(50%-50vw)] overflow-hidden py-2">
      <div
        className="carousel-track flex w-max"
        style={{ '--carousel-duration': `${tentors.length * repeat * secondsPerCard}s` } as React.CSSProperties}
      >
        {copies.map((copy) => (
          <ul
            key={copy.key}
            aria-label={copy.clone ? undefined : 'Semua tentor'}
            aria-hidden={copy.clone || undefined}
            inert={copy.clone || undefined}
            data-clone={copy.clone || undefined}
            className="flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6"
          >
            {tentors.map((tentor) => (
              <li key={tentor.id} className="w-56 shrink-0 pb-1.5 sm:w-68">
                <TentorCard tentor={tentor} sizes={SIZES} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
