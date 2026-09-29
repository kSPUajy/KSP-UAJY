'use client'

import { useState } from 'react'

export type ShareInstagramRequest = {
  /** Same-origin route that renders the 1080 × 1350 PNG. */
  image: string
  fileName: string
  title: string
  /** Copied to the clipboard, because Instagram ignores text passed with an image. */
  caption: string
}

/** Every state but idle names the image it is about, so a caller that shows several items can tell whose message it is. */
export type ShareInstagramState =
  | { kind: 'idle' }
  | { kind: 'busy'; image: string }
  | { kind: 'done'; image: string; message: string }
  | { kind: 'error'; image: string; message: string }

/**
 * Instagram has no share link a website can open, so posting means handing
 * over two pieces: the image and a ready caption. On a phone the image goes
 * to the share sheet, where Instagram is one of the targets; elsewhere, or
 * when the browser refuses the sheet, it downloads. The caption is copied
 * either way.
 */
export function useShareInstagram(): {
  state: ShareInstagramState
  share: (request: ShareInstagramRequest) => Promise<void>
} {
  const [state, setState] = useState<ShareInstagramState>({ kind: 'idle' })

  const share = async ({ image, fileName, title, caption }: ShareInstagramRequest): Promise<void> => {
    setState({ kind: 'busy', image })
    let copied = false
    try {
      await navigator.clipboard.writeText(caption)
      copied = true
    } catch {
      // Clipboard blocked; the image still goes out, the message says so.
    }
    const captionNote = copied ? 'Caption sudah tersalin, tinggal tempel.' : 'Caption belum bisa disalin otomatis.'

    try {
      const response = await fetch(image)
      if (!response.ok) throw new Error(String(response.status))
      const blob = await response.blob()
      const file = new File([blob], fileName, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title, text: caption })
          setState({ kind: 'done', image, message: `Pilih Instagram di menu bagikan. ${captionNote}` })
          return
        } catch (error) {
          // Closing the share sheet is not an error worth reporting.
          if (error instanceof DOMException && error.name === 'AbortError') {
            setState({ kind: 'idle' })
            return
          }
          // Safari refuses a share that comes too long after the tap; the download below still works.
          if (!(error instanceof DOMException && error.name === 'NotAllowedError')) throw error
        }
      }

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = file.name
      link.click()
      URL.revokeObjectURL(link.href)
      setState({ kind: 'done', image, message: `Gambar terunduh. ${captionNote} Unggah lewat aplikasi Instagram.` })
    } catch {
      setState({ kind: 'error', image, message: 'Gambar gagal disiapkan. Coba lagi sebentar lagi.' })
    }
  }

  return { state, share }
}
