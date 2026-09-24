'use client'

import { useRef } from 'react'

import { Lightbox } from '@/components/sections/galeri/Lightbox'
import { PrintSheet } from '@/components/sections/galeri/PrintSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommandBar, Flag } from '@/components/ui/Flag'
import { clearLocationHash, replaceLocationHash, useLocationHash } from '@/lib/hooks/useLocationHash'
import { useQueryParams } from '@/lib/hooks/useQueryParams'
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

const FRAME_SIZES = '(min-width: 1440px) 300px, (min-width: 1280px) 22vw, (min-width: 1024px) 29vw, 46vw'

const PIN_COLORS = ['#ff3d8b', '#2fd5e0', '#8fe34f', '#ffb020', '#9b7bff'] as const

/**
 * How a print hangs, from its id: a small tilt, and either a push pin (in one
 * of the accents) or a strip of tape. Deterministic, so the wall looks the
 * same on every visit and server and client agree.
 */
function pinOf(id: string): { tilt: number; kind: 'pin' | 'tape'; color: string; tape: number } {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return {
    tilt: ((hash % 9) - 4) * 0.75,
    kind: hash % 3 === 0 ? 'tape' : 'pin',
    color: PIN_COLORS[hash % PIN_COLORS.length] ?? PIN_COLORS[0],
    tape: ((hash >>> 4) % 7) - 3,
  }
}

/**
 * The whole archive as a wall of prints — the sheets the home page's printer
 * turns out, pinned or taped up at a slight angle — with the lightbox it
 * opens, where the photo shows in its real colours.
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
        <ul className="mt-8 columns-2 gap-4 sm:gap-8 lg:columns-3 xl:columns-4">
          {visible.map((item) => {
            const pin = pinOf(item.id)
            return (
              <li key={item.id} id={item.id} className="mb-8 scroll-mt-24 break-inside-avoid pt-3 sm:mb-10">
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    // A modified click opens a tab; only a plain one opens the lightbox.
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                    pushedEntry.current = true
                  }}
                  style={{ '--tilt': `${pin.tilt}deg` } as React.CSSProperties}
                  className="group/print relative block rotate-(--tilt) transition-[rotate,translate,box-shadow] duration-300 ease-[var(--ease-mech)] hover:-translate-y-1 hover:rotate-0 focus-visible:-translate-y-1 focus-visible:rotate-0 motion-reduce:transition-none"
                >
                  {pin.kind === 'pin' ? (
                    <span
                      aria-hidden
                      className="absolute -top-2.5 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#1b1d24]/70 shadow-[2px_3px_0_0_rgb(0_0_0/0.25)] transition-transform duration-300 group-hover/print:-rotate-12"
                      style={{ background: pin.color }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 bg-[#e9e1c8]/85 shadow-[0_1px_0_rgb(0_0_0/0.08)]"
                      style={{ rotate: `${pin.tape}deg` }}
                    />
                  )}
                  <PrintSheet
                    item={item}
                    sizes={FRAME_SIZES}
                    natural
                    reveal
                    className="shadow-[3px_5px_0_0_rgb(0_0_0/0.16)] transition-shadow duration-300 group-hover/print:shadow-[6px_12px_0_0_rgb(0_0_0/0.2)]"
                  />
                  <span className="sr-only">{item.type === 'video' ? ' — putar video' : ' — buka foto'}</span>
                </a>
              </li>
            )
          })}
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
