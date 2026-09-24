import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { DitherImage } from '@/components/ui/DitherImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { AccentName } from '@/lib/accent'
import { formatTanggalPendek } from '@/lib/format'
import type { GalleryItem } from '@/lib/types'
import { pad2 } from '@/lib/utils'

const ACCENT: AccentName = 'lime'

type GalleryStripProps = {
  index: number
  /** Newest first; the strip shows as many as it is given. */
  items: readonly GalleryItem[]
}

const FRAME_SIZES = '(min-width: 1440px) 220px, (min-width: 1024px) 16vw, (min-width: 640px) 31vw, 46vw'

/**
 * The newest photos as a strip of 35mm film: sprocket holes along both edges,
 * frame numbers and a stock name printed in the rebate, every frame cut to
 * the same 3:2. On phones the strip folds into a contact sheet of two columns.
 *
 * The film is always dark, so the band under it is always cream — in either
 * theme the strip reads as an object lying on paper, and the holes show the
 * paper through.
 *
 * Pinning a palette resets the accent to the brand default (see the palette
 * blocks in globals.css), so the strip restates its section's accent.
 */
function FilmStrip({ items, accent }: { items: readonly GalleryItem[]; accent: AccentName }) {
  return (
    <div data-palette="dark" data-accent={accent} className="[--film:var(--color-ink)]">
      <div aria-hidden className="sprockets" />

      <ul className="grid grid-cols-2 gap-x-2 gap-y-3 bg-(--film) px-2 pb-3 sm:grid-cols-3 sm:gap-x-3 sm:px-3 lg:grid-cols-6">
        {items.map((item, position) => (
          <li key={item.id} className="min-w-0">
            {/* The rebate: what the lab prints between the holes and the frame. */}
            <p
              aria-hidden
              className="flex items-center justify-between gap-2 pt-1 pb-1.5 font-display text-[9px] leading-none tracking-[0.14em] uppercase"
            >
              <span className="text-accent-fg">▸ {pad2(position + 1)}A</span>
              <span className="truncate text-dim">KSP 400</span>
            </p>

            <Link
              href={`/galeri#${item.id}`}
              className="group/frame relative block overflow-hidden"
            >
              <DitherImage
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes={FRAME_SIZES}
                treatment="soft"
                bordered={false}
                className="aspect-[3/2]"
                imageClassName="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--ease-mech)] motion-safe:group-hover/frame:scale-[1.04]"
              />

              {item.type === 'video' ? (
                <Badge variant="solid" size="sm" className="absolute top-2 left-2">
                  <span aria-hidden>▶</span> video
                </Badge>
              ) : null}

              {/* Caption slides up over the frame on hover or keyboard focus. */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 translate-y-full border-t-2 border-line bg-canvas px-2 py-1.5 text-[11px] leading-4 text-fg transition-transform duration-300 ease-[var(--ease-mech)] group-hover/frame:translate-y-0 group-focus-visible/frame:translate-y-0 motion-reduce:transition-none"
              >
                <span className="line-clamp-2">{item.caption}</span>
              </span>
            </Link>

            <p className="mt-1.5 truncate text-[10px] leading-4 text-dim">
              <time dateTime={item.tanggal}>{formatTanggalPendek(item.tanggal)}</time> · {item.kategori}
            </p>
          </li>
        ))}
      </ul>

      <div aria-hidden className="sprockets" />
    </div>
  )
}

export function GalleryStrip({ index, items }: GalleryStripProps) {
  return (
    <SectionShell accent={ACCENT} tone="paper" labelledBy="galeri-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="galeri"
          title="Dari ruang kelas dan sekitarnya"
          headingId="galeri-title"
          description="Kelas Jumat sore, workshop, kompetisi, dan sesi-sesi malam sebelum deadline."
          actions={
            items.length > 0 ? (
              <ButtonLink href="/galeri" variant="outline" size="sm">
                buka galeri
              </ButtonLink>
            ) : undefined
          }
        />
      </Reveal>

      <Reveal className="mt-10 sm:mt-12">
        {items.length > 0 ? (
          <FilmStrip items={items} accent={ACCENT} />
        ) : (
          <EmptyState
            command="ls ~/galeri/*.jpg"
            output="ls: tidak ada berkas yang cocok"
            title="Roll pertama belum dicuci"
            description="Dokumentasi kegiatan diunggah divisi media setelah setiap acara. Kelas pertama semester ini tinggal menunggu jadwal."
          />
        )}
      </Reveal>
    </SectionShell>
  )
}
