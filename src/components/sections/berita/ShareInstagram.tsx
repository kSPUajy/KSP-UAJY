'use client'

import { InstagramGlyph } from '@/components/ui/InstagramGlyph'
import { useShareInstagram } from '@/lib/hooks/useShareInstagram'

type ShareInstagramProps = {
  slug: string
  judul: string
  excerpt: string
  /** Absolute article URL, for the caption. */
  url: string
}

/**
 * The article drawn as a 1080 × 1350 image (`/berita/<slug>/instagram`)
 * plus a ready caption, handed to the phone's share sheet or downloaded —
 * see `useShareInstagram`.
 */
export function ShareInstagram({ slug, judul, excerpt, url }: ShareInstagramProps) {
  const { state, share } = useShareInstagram()

  const caption = `${judul}\n\n${excerpt}\n\nBaca selengkapnya: ${url}\n\n#KSPUAJY #BahasaC #BelajarNgoding #UAJY`

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => void share({ image: `/berita/${slug}/instagram`, fileName: `kabar-ksp-${slug}.png`, title: judul, caption })}
        disabled={state.kind === 'busy'}
        className="flex h-10 w-full items-center justify-center gap-2 border-2 border-line bg-accent text-[11px] font-bold tracking-[0.08em] text-accent-ink uppercase press-pop hard-shadow-line disabled:opacity-60"
      >
        <InstagramGlyph />
        {state.kind === 'busy' ? 'menyiapkan gambar…' : 'bagikan ke instagram'}
      </button>
      <p role="status" aria-live="polite" className="mt-2 text-[11px] leading-5 text-muted">
        {state.kind === 'done' || state.kind === 'error' ? state.message : ''}
      </p>
    </div>
  )
}
