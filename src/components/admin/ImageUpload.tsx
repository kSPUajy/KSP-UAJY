'use client'

import { createClient } from '@supabase/supabase-js'
import { useId, useState } from 'react'

import { mulaiUploadGambar } from '@/app/admin/shared-actions'

/**
 * Uploads a JPG/PNG/WebP straight to the public `media` bucket and hands the
 * public URL back, to fill a link field in the form around it.
 */
export function ImageUpload({ folder, onUploaded }: { folder: 'berita' | 'pemenang' | 'tentor'; onUploaded: (url: string) => void }) {
  const id = useId()
  const [status, setStatus] = useState('')

  async function upload(file: File): Promise<void> {
    setStatus('menyiapkan…')
    const start = await mulaiUploadGambar(folder, file.type, file.size)
    if (!start.ok) return setStatus(`error: ${start.error}`)
    setStatus('mengunggah…')
    const { error } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    })
      .storage.from('media')
      .uploadToSignedUrl(start.path, start.token, file, { contentType: file.type })
    if (error) return setStatus('error: upload gagal, coba lagi.')
    onUploaded(start.publicUrl)
    setStatus('[ok] gambar terunggah — jangan lupa simpan')
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
