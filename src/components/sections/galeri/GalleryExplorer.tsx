'use client'

import { useRef } from 'react'

import { Lightbox } from '@/components/sections/galeri/Lightbox'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DitherImage } from '@/components/ui/DitherImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommandBar, Flag } from '@/components/ui/Flag'
import { clearLocationHash, replaceLocationHash, useLocationHash } from '@/lib/hooks/useLocationHash'
import { useQueryParams } from '@/lib/hooks/useQueryParams'
import { formatTanggalPendek } from '@/lib/format'
import type { GalleryItem, KategoriGaleri } from '@/lib/types'

type GalleryExplorerProps = {
  /** Newest first. */
  items: readonly GalleryItem[]
  /** Every category at least one item carries, in display order. */
  categories: readonly KategoriGaleri[]
}

const TIPE = { foto: 'image', video: 'video' } as const
type TipeFlag = keyof typeof TIPE

const isTipe = (value: string | null): value is TipeFlag => value === 'foto' || value === 'video'

const FRAME_SIZES = '(min-width: 1440px) 340px, (min-width: 1280px) 24vw, (min-width: 1024px) 31vw, 46vw'

/**
 * The whole archive as a contact sheet, with the lightbox it opens.
 *
 * Each frame is a plain link to its own fragment, `/galeri#g-03`, and the
 * open item is whatever the fragment names. So the home page's film strip can
 * link straight to a photo, a photo can be shared, Back closes the lightbox,
 * and without JavaScript a frame is still a working anchor.
 *
 * The filters live in the query string, like every other archive here. The
 * lightbox steps through what the filter left visible — unless it was opened
 * on something the filter hides, in which case it steps through everything.
 */
export function GalleryExplorer({ items, categories }: GalleryExplorerProps) {
  const { params, setParams } = useQueryParams()
  const fragment = useLocationHash()

  const rawKategori = params.get('kategori')
  const kategori = categories.find((value) => value === rawKategori) ?? null
  const rawTipe = params.get('tipe')
  const tipe = isTipe(rawTipe) ? rawTipe : null

  const visible = items.filter(
    (item) => (kategori === null || item.kategori === kategori) && (tipe === null || item.type === TIPE[tipe]),
  )
  const filtered = kategori !== null || tipe !== null

  const current = items.find((item) => item.id === fragment) ?? null
  const run = current && visible.includes(current) ? visible : items
  const index = current ? run.indexOf(current) : -1

  // Whether this page pushed the entry the lightbox lives on. If it did,
  // closing is Back; if the page was opened on a fragment, closing clears it.
  const pushedEntry = useRef(false)

  const step = (delta: 1 | -1): void => {
    if (index < 0) return
    const next = run[(index + delta + run.length) % run.length]
    if (next) replaceLocationHash(next.id)
  }

  const close = (): void => {
    if (pushedEntry.current) {
      pushedEntry.current = false
      window.history.back()
      return
    }
    clearLocationHash()
  }

  const reset = (): void => setParams({ kategori: null, tipe: null })

  return (
    <div>
      <CommandBar
        command="ls ~/galeri"
        trailing={
          filtered ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              reset
            </Button>
          ) : null
        }
      >
        <Flag
          name="kategori"
          description="kategori kegiatan"
          value={kategori ?? ''}
          onChange={(value) => setParams({ kategori: value || null })}
          options={[{ value: '', label: 'semua' }, ...categories.map((value) => ({ value, label: value }))]}
        />
        <Flag
          name="tipe"
          description="foto atau video"
          value={tipe ?? ''}
          onChange={(value) => setParams({ tipe: value || null })}
          options={[
            { value: '', label: 'semua' },
            { value: 'foto', label: 'foto' },
            { value: 'video', label: 'video' },
          ]}
        />
      </CommandBar>

      <p aria-live="polite" className="mt-6 text-[11px] leading-5 text-dim">
        {`// ${visible.length} dari ${items.length} berkas`}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-3 columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
          {visible.map((item) => (
            <li key={item.id} id={item.id} className="mb-3 scroll-mt-24 break-inside-avoid sm:mb-4">
              <figure className="border-2 border-line bg-surface">
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    // A modified click opens a tab; only a plain one opens the lightbox.
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                    pushedEntry.current = true
                  }}
                  className="group/frame relative block overflow-hidden border-b-2 border-line"
                >
                  <DitherImage
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes={FRAME_SIZES}
                    treatment="soft"
                    bordered={false}
                    imageClassName="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[var(--ease-mech)] motion-safe:group-hover/frame:scale-[1.04]"
                  />
                  {item.type === 'video' ? (
                    <Badge variant="solid" size="sm" className="absolute top-2 left-2">
                      <span aria-hidden>▶</span> video
                    </Badge>
                  ) : null}
                  <span className="sr-only">{item.type === 'video' ? ' — putar video' : ' — buka foto'}</span>
                </a>

                <figcaption className="px-3 py-2.5">
                  <p className="text-[12px] leading-5 text-fg">{item.caption}</p>
                  <p className="mt-1.5 text-[10px] leading-4 text-dim">
                    <time dateTime={item.tanggal}>{formatTanggalPendek(item.tanggal)}</time> · {item.kategori}
                  </p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-6"
          command={`ls ~/galeri${kategori ? ` --kategori=${kategori}` : ''}${tipe ? ` --tipe=${tipe}` : ''}`}
          output="ls: tidak ada berkas yang cocok"
          title="Tidak ada dokumentasi yang cocok"
          description="Belum ada berkas untuk kombinasi ini. Longgarkan kategori atau tipenya."
          action={
            <Button variant="outline" size="sm" onClick={reset}>
              reset filter
            </Button>
          }
        />
      )}

      <Lightbox
        item={current}
        position={index + 1}
        total={run.length}
        onClose={close}
        onStep={step}
      />
    </div>
  )
}
