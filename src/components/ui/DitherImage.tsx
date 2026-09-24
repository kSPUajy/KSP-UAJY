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
  className?: string
  imageClassName?: string
}

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
  className,
  imageClassName,
}: DitherImageProps) {
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
        loading={eager ? 'eager' : undefined}
        fetchPriority={eager ? 'high' : undefined}
        className={cn(
          'block h-full w-full object-cover',
          treatment !== 'none' && 'grayscale contrast-[1.12]',
          imageClassName,
        )}
      />

      {treatment !== 'none' ? (
        <span
          aria-hidden
          className={cn('absolute inset-0 bg-accent mix-blend-color', OVERLAY_OPACITY[treatment])}
        />
      ) : null}

      <span aria-hidden className="dither absolute inset-0 opacity-[0.14]" />
    </span>
  )
}
