'use client'

import { useState } from 'react'

type ShareInstagramProps = {
  slug: string
  judul: string
  excerpt: string
  /** Absolute article URL, for the caption. */
  url: string
}

type State = { kind: 'idle' } | { kind: 'busy' } | { kind: 'done'; message: string } | { kind: 'error'; message: string }

/**
 * Instagram has no share link a website can open, so this hands over the
 * two pieces a post needs: the article drawn as a 1080 × 1350 image
 * (`/berita/<slug>/instagram`) and a ready caption. On a phone the image
 * goes to the share sheet, where Instagram is one of the targets; elsewhere
 * it downloads. The caption is copied either way, because Instagram ignores
 * text passed alongside an image.
 */
export function ShareInstagram({ slug, judul, excerpt, url }: ShareInstagramProps) {
  const [state, setState] = useState<State>({ kind: 'idle' })

  const caption = `${judul}\n\n${excerpt}\n\nBaca selengkapnya: ${url}\n\n#KSPUAJY #BahasaC #BelajarNgoding #UAJY`

  const share = async (): Promise<void> => {
    setState({ kind: 'busy' })
    let copied = false
    try {
      await navigator.clipboard.writeText(caption)
      copied = true
    } catch {
      // Clipboard blocked; the image still goes out, the message says so.
    }

    try {
      const response = await fetch(`/berita/${slug}/instagram`)
      if (!response.ok) throw new Error(String(response.status))
      const blob = await response.blob()
      const file = new File([blob], `kabar-ksp-${slug}.png`, { type: 'image/png' })
      const captionNote = copied ? 'Caption sudah tersalin, tinggal tempel.' : 'Caption belum bisa disalin otomatis.'

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: judul, text: caption })
          setState({ kind: 'done', message: `Pilih Instagram di menu bagikan. ${captionNote}` })
        } catch (error) {
          // Closing the share sheet is not an error worth reporting.
          if (error instanceof DOMException && error.name === 'AbortError') setState({ kind: 'idle' })
          else throw error
        }
        return
      }

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = file.name
      link.click()
      URL.revokeObjectURL(link.href)
      setState({ kind: 'done', message: `Gambar terunduh. ${captionNote} Unggah lewat aplikasi Instagram.` })
    } catch {
      setState({ kind: 'error', message: 'Gambar gagal disiapkan. Coba lagi sebentar lagi.' })
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={share}
        disabled={state.kind === 'busy'}
        className="flex h-10 w-full items-center justify-center gap-2 border-2 border-line bg-accent text-[11px] font-bold tracking-[0.08em] text-accent-ink uppercase press-pop hard-shadow-line disabled:opacity-60"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
        {state.kind === 'busy' ? 'menyiapkan gambar…' : 'bagikan ke instagram'}
      </button>
      <p role="status" aria-live="polite" className="mt-2 text-[11px] leading-5 text-muted">
        {state.kind === 'done' || state.kind === 'error' ? state.message : ''}
      </p>
    </div>
  )
}
