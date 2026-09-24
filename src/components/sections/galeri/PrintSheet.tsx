import Image from 'next/image'

import type { GalleryItem } from '@/lib/types'
import { cn } from '@/lib/utils'

const stamp = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

type PrintSheetProps = {
  item: GalleryItem
  /** `sizes` for the photo, given the width the sheet is laid out at. */
  sizes: string
  /** Keep the photo's own proportions (a wall of prints) instead of 4:3 (the printer). */
  natural?: boolean
  /** The photo's alt text is read here; off where the sheet is decoration. */
  describe?: boolean
  /**
   * Hovering or focusing the surrounding `group/print` brings the photo back
   * in its own colours, the ink dots fading away (/galeri).
   */
  reveal?: boolean
  className?: string
}

/**
 * A photo as it comes off the KSP-9 dot-matrix printer: continuous-form paper
 * with tractor holes down both edges, a header line, the picture in black ink
 * dots, and the caption typed underneath. The home page prints these; /galeri
 * pins them to the wall — the same sheet in both places.
 *
 * The paper is always paper, whatever the theme.
 */
export function PrintSheet({ item, sizes, natural = false, describe = true, reveal = false, className }: PrintSheetProps) {
  return (
    <div
      className={cn(
        'relative bg-[#fbf8ee] px-5 pt-2.5 pb-3.5 text-[#1b1d24]',
        "before:absolute before:inset-y-0 before:left-1 before:w-2 before:bg-[radial-gradient(circle,#e3dcc8_2.5px,transparent_3px)] before:bg-[length:8px_12px] before:content-['']",
        "after:absolute after:inset-y-0 after:right-1 after:w-2 after:bg-[radial-gradient(circle,#e3dcc8_2.5px,transparent_3px)] after:bg-[length:8px_12px] after:content-['']",
        className,
      )}
    >
      <p aria-hidden className="flex justify-between font-mono text-[9px] leading-4 tracking-[0.12em] uppercase">
        <span>ksp_galeri.prn</span>
        <span>{stamp(item.tanggal)}</span>
      </p>
      <div
        className={cn('relative mt-1.5 overflow-hidden bg-[#fbf8ee]', !natural && 'aspect-[4/3]')}
        style={natural ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
      >
        <Image
          src={item.src}
          alt={describe ? item.alt : ''}
          fill
          sizes={sizes}
          className={cn(
            'object-cover [filter:grayscale(1)_contrast(1.5)_brightness(1.05)] mix-blend-multiply',
            reveal &&
              'transition-[filter] duration-500 ease-out group-hover/print:mix-blend-normal group-hover/print:[filter:none] group-focus-visible/print:mix-blend-normal group-focus-visible/print:[filter:none] motion-reduce:transition-none',
          )}
        />
        {/* Ink dots: the print is a pattern, not a photo. */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 bg-[radial-gradient(circle,transparent_1px,#fbf8ee_1.4px)] bg-[length:3px_3px] opacity-45',
            reveal && 'transition-opacity duration-500 group-hover/print:opacity-0 group-focus-visible/print:opacity-0',
          )}
        />
        {item.type === 'video' ? (
          <span className="absolute top-1.5 left-1.5 bg-[#1b1d24] px-1.5 py-0.5 font-mono text-[9px] leading-none tracking-[0.1em] text-[#fbf8ee] uppercase">
            ▶ video
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 line-clamp-3 font-mono text-[10px] leading-4">{item.caption || item.alt}</p>
      <p className="mt-0.5 font-mono text-[9px] leading-4 tracking-[0.1em] text-[#6b6a63] uppercase">
        # {item.kategori} · {item.id}
      </p>
    </div>
  )
}
