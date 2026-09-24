import Image from 'next/image'

import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

type DitherImageProps = {
  src: string
  /** Meaningful Indonesian alt text. Empty string only for pure decoration. */
  alt: string
  width: number
  height: number
  accent?: AccentName
  sizes?: string
  /**
   * Above-the-fold images only: loads immediately at high fetch priority.
   * Next 16 deprecated `priority`; `loading="eager"` plus `fetchPriority` is
   * what its docs recommend in its place for most cases.
   */
  eager?: boolean
  /** How hard the duotone bites. */
  treatment?: 'full' | 'soft' | 'none'
  /** Own 2px frame. Off when the image sits flush inside a window that has one. */
  bordered?: boolean
  /**
   * Hovering or focusing the surrounding group wipes the duotone away top to
   * bottom behind a scanline, and the photo comes back in its real colours.
   * `true` answers to an interactive `TerminalWindow` (`group/window`);
   * `'row'` to a `group/row` — a line inside a window, which must not light up
   * every other line when the window itself is hovered.
   */
  reveal?: boolean | 'row'
  className?: string
  imageClassName?: string
}

/** Tailwind needs every class spelled out, so each group gets its own set. */
const REVEAL = {
  window: {
    image:
      'transition-[filter,scale] duration-700 ease-out group-focus-within/window:scale-[1.06] group-focus-within/window:contrast-100 group-focus-within/window:grayscale-0 group-hover/window:scale-[1.06] group-hover/window:contrast-100 group-hover/window:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover/window:scale-100 motion-reduce:group-focus-within/window:scale-100',
    overlay:
      '[clip-path:inset(0_0_0_0)] transition-[clip-path] duration-700 ease-[steps(10,end)] group-focus-within/window:[clip-path:inset(100%_0_0_0)] group-hover/window:[clip-path:inset(100%_0_0_0)] motion-reduce:transition-none',
    dither: 'transition-opacity duration-700 group-focus-within/window:opacity-0 group-hover/window:opacity-0',
    scanline:
      'group-focus-within/window:top-full group-focus-within/window:opacity-100 group-hover/window:top-full group-hover/window:opacity-100',
  },
  row: {
    image:
      'transition-[filter,scale] duration-700 ease-out group-focus-visible/row:scale-[1.06] group-focus-visible/row:contrast-100 group-focus-visible/row:grayscale-0 group-hover/row:scale-[1.06] group-hover/row:contrast-100 group-hover/row:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover/row:scale-100 motion-reduce:group-focus-visible/row:scale-100',
    overlay:
      '[clip-path:inset(0_0_0_0)] transition-[clip-path] duration-700 ease-[steps(10,end)] group-focus-visible/row:[clip-path:inset(100%_0_0_0)] group-hover/row:[clip-path:inset(100%_0_0_0)] motion-reduce:transition-none',
    dither: 'transition-opacity duration-700 group-focus-visible/row:opacity-0 group-hover/row:opacity-0',
    scanline:
      'group-focus-visible/row:top-full group-focus-visible/row:opacity-100 group-hover/row:top-full group-hover/row:opacity-100',
  },
} as const

const OVERLAY_OPACITY: Record<'full' | 'soft', string> = {
  full: 'opacity-100',
  soft: 'opacity-55',
}

/**
 * Photography, duotoned into the section's accent and dusted with a 4px
 * checkerboard so it reads as printed rather than photographic.
 *
 * The duotone is `mix-blend-color` over a desaturated image: the accent
 * supplies hue and saturation, the photo keeps its own luminosity. `isolate`
 * on the frame keeps the blend from reaching the page behind it.
 *
 * `width` and `height` are always required — every image on this site declares
 * its intrinsic size so nothing shifts as it loads. Until the file arrives the
 * frame shows a flat surface under the same checkerboard, which is the
 * designed loading state rather than an empty hole.
 */
export function DitherImage({
  src,
  alt,
  width,
  height,
  accent,
  sizes,
  eager = false,
  treatment = 'full',
  bordered = true,
  reveal = false,
  className,
  imageClassName,
}: DitherImageProps) {
  const duotone = treatment !== 'none'
  const motion = reveal === 'row' ? REVEAL.row : reveal ? REVEAL.window : null
  return (
    <span
      data-accent={accent}
      className={cn(
        'relative isolate block overflow-hidden bg-surface-2',
        bordered && 'border-2 border-line',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        // Generated stand-ins (`pixelPortrait`) are inline SVG: nothing to optimise.
        unoptimized={src.startsWith('data:')}
        loading={eager ? 'eager' : undefined}
        fetchPriority={eager ? 'high' : undefined}
        className={cn(
          'block h-full w-full object-cover',
          duotone && 'grayscale contrast-[1.12]',
          duotone && motion?.image,
          imageClassName,
        )}
      />

      {duotone ? (
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 bg-accent mix-blend-color',
            OVERLAY_OPACITY[treatment],
            // Stepped, so the colour leaves in bands like a slow CRT redraw.
            motion?.overlay,
          )}
        />
      ) : null}

      <span
        aria-hidden
        className={cn(
          'dither absolute inset-0 opacity-[0.14]',
          motion?.dither,
        )}
      />

      {motion && duotone ? (
        // The scanline riding the edge of the wipe, gone once it reaches the bottom.
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-accent opacity-0 shadow-[0_0_12px_2px_var(--accent)] transition-[top,opacity] duration-700 ease-[steps(10,end)] motion-reduce:hidden',
            motion.scanline,
          )}
        />
      ) : null}
    </span>
  )
}
