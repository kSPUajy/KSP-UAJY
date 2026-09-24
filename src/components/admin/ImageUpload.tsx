'use client'

import { useId, useState } from 'react'

import { uploadPhoto } from '@/lib/admin/upload'

/**
 * Shrinks a JPG/PNG/WebP in the browser, uploads it to the public `media`
 * bucket and hands the public URL back, to fill a link field in the form
 * around it. A full-size phone photo is fine: it is made small enough first.
 */
export function ImageUpload({
  folder,
  onUploaded,
}: {
  folder: 'berita' | 'pemenang' | 'tentor' | 'galeri'
  onUploaded: (url: string) => void
}) {
  const id = useId()
  const [status, setStatus] = useState('')

  async function upload(file: File): Promise<void> {
    setStatus('memperkecil & mengunggah…')
    try {
      const photo = await uploadPhoto(folder, file)
      onUploaded(photo.url)
      setStatus('[ok] gambar terunggah — jangan lupa simpan')
    } catch (error) {
      setStatus(`error: ${error instanceof Error ? error.message : 'upload gagal, coba lagi.'}`)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor={id}
        className="inline-flex h-10 cursor-pointer items-center border-2 border-line bg-surface px-4 text-xs tracking-[0.08em] text-fg uppercase hover:bg-surface-2"
      >
        unggah gambar
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void upload(file)
        }}
      />
      <span role="status" aria-live="polite" className="text-[12px] text-muted">
        {status}
      </span>
    </div>
  )
}
