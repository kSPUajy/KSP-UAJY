import { DotGrid, Scanlines } from '@/components/overlays/Overlays'
import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

export type SectionTone =
  /** Page background. */
  | 'canvas'
  /** One step off the page background. */
  | 'alt'
  /** Page background mixed with 9% of the section's accent. */
  | 'tint'
  /** The opposite of the page theme: cream on a dark page, dark on a cream one. */
  | 'inverse'
  /** Always cream, whatever the page theme is. */
  | 'paper'
  /** Always dark, whatever the page theme is. */
  | 'void'

type SectionShellProps = {
  /** The one accent this section owns. */
  accent: AccentName
  tone?: SectionTone
  id?: string
  /** Id of the heading that names this section, making it a labelled region. */
  labelledBy?: string
  /** Hard rule along the top edge. Off for the first band under the nav. */
  divider?: boolean
  dots?: boolean
  scanlines?: boolean
  /** Drops the default vertical rhythm for sections that manage their own. */
  bare?: boolean
  className?: string
  containerClassName?: string
  children: React.ReactNode
}

const TONE_BG: Record<SectionTone, string> = {
  canvas: 'bg-canvas',
  alt: 'bg-canvas-alt',
  tint: 'tint-bg',
  inverse: 'bg-canvas',
  paper: 'bg-canvas',
  void: 'bg-canvas',
}

const TONE_PALETTE: Partial<Record<SectionTone, string>> = {
  inverse: 'inverse',
  paper: 'light',
  void: 'dark',
}

/**
 * A full-bleed band. This is where the colour in this design actually comes
 * from — alternating backgrounds, one accent each, rather than tinting every
 * element on the page.
 *
 * `paper`, `void` and `inverse` set the band's own palette, so every token
 * underneath flips to match. `inverse` is the one to reach for when a page
 * wants a contrasting band: it keeps the dark ↔ cream rhythm in both themes,
 * where `paper` would vanish into a cream page.
 */
export function SectionShell({
  accent,
  tone = 'canvas',
  id,
  labelledBy,
  divider = true,
  dots = false,
  scanlines = false,
  bare = false,
  className,
  containerClassName,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-accent={accent}
      data-palette={TONE_PALETTE[tone]}
      // `overflow-x-clip`, not `overflow-hidden`: clip still stops a full-bleed
      // band from spilling sideways, but it does not turn the section into a
      // scroll container — which would silently break every `sticky` inside.
      className={cn(
        'relative overflow-x-clip',
        divider && 'border-t-2 border-line',
        TONE_BG[tone],
        className,
      )}
    >
      {dots ? <DotGrid /> : null}
      {scanlines ? <Scanlines /> : null}

      <div
        className={cn(
          'relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8',
          !bare && 'py-16 sm:py-20 lg:py-24',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
