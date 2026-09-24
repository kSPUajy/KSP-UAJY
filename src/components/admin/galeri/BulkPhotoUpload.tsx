'use client'

import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'

import { tambahFotoGaleri } from '@/app/admin/galeri/actions'
import { Select, TextInput } from '@/components/admin/form'
import { Button } from '@/components/ui/Button'
import { uploadPhoto } from '@/lib/admin/upload'
import { KATEGORI_GALERI } from '@/lib/types'
import type { KategoriGaleri } from '@/lib/types'

type Line = { name: string; status: 'antre' | 'mengunggah' | 'ok' | 'gagal'; note?: string }

const today = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })

/**
 * Many photos of one event at once: pick the date, category and an optional
 * shared caption, then select the files. Each is shrunk in the browser,
 * uploaded, and added to the gallery — one after another, so a slow campus
 * connection never has twenty uploads fighting for it.
 */
export function BulkPhotoUpload() {
  const uid = useId()
  const router = useRouter()
  const [tanggal, setTanggal] = useState(today)
  const [kategori, setKategori] = useState<KategoriGaleri>('kelas')
  const [caption, setCaption] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [busy, setBusy] = useState(false)

  const update = (index: number, line: Partial<Line>): void =>
    setLines((current) => current.map((item, i) => (i === index ? { ...item, ...line } : item)))

  async function start(): Promise<void> {
    if (files.length === 0 || busy) return
    setBusy(true)
    setLines(files.map((file) => ({ name: file.name, status: 'antre' })))
    for (const [index, file] of files.entries()) {
      update(index, { status: 'mengunggah' })
      try {
        const photo = await uploadPhoto('galeri', file)
        const saved = await tambahFotoGaleri({ src: photo.url, width: photo.width, height: photo.height, tanggal, kategori, caption })
        update(index, saved.ok ? { status: 'ok' } : { status: 'gagal', note: saved.error })
      } catch (error) {
        update(index, { status: 'gagal', note: error instanceof Error ? error.message : 'Gagal.' })
      }
    }
    setBusy(false)
    setFiles([])
    router.refresh()
  }

  const done = lines.filter((line) => line.status === 'ok').length

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[11rem_12rem_minmax(0,1fr)]">
        <TextInput id={`${uid}-tanggal`} label="tanggal" type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} />
        <Select
          id={`${uid}-kategori`}
          label="kategori"
          value={kategori}
          onChange={(event) => setKategori(event.target.value as KategoriGaleri)}
          options={KATEGORI_GALERI.map((value) => ({ value, label: value }))}
        />
        <TextInput
          id={`${uid}-caption`}
          label="keterangan"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="mis. Workshop pointer, Lab Komputasi"
          hint="Dipakai untuk semua foto di unggahan ini. Bisa diubah per foto nanti."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={`${uid}-files`}
          className="inline-flex h-11 cursor-pointer items-center border-2 border-line bg-surface px-4 text-xs tracking-[0.08em] text-fg uppercase hover:bg-surface-2"
        >
          pilih foto
        </label>
        <input
          id={`${uid}-files`}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            setFiles([...(event.target.files ?? [])])
            setLines([])
            event.target.value = ''
          }}
        />
        <span className="text-[12px] text-muted">{files.length > 0 ? `${files.length} foto dipilih` : 'JPG, PNG, atau WebP — boleh banyak sekaligus'}</span>
        <Button type="button" size="md" onClick={() => void start()} disabled={busy || files.length === 0}>
          {busy ? 'mengunggah…' : 'unggah ke galeri'}
        </Button>
      </div>

      {lines.length > 0 ? (
        <div role="status" aria-live="polite" className="border-2 border-line-soft bg-code-bg p-3 text-[12px] leading-6">
          <p className="text-muted">
            {done}/{lines.length} selesai
          </p>
          <ul className="mt-1">
            {lines.map((line, index) => (
              <li key={`${line.name}-${index}`} className="flex gap-2">
                <span className={line.status === 'ok' ? 'text-accent-fg' : line.status === 'gagal' ? 'text-fg' : 'text-dim'}>
                  [{line.status === 'ok' ? 'ok' : line.status === 'gagal' ? 'error' : line.status === 'mengunggah' ? '..' : '  '}]
                </span>
                <span className="min-w-0 truncate text-fg">{line.name}</span>
                {line.note ? <span className="text-muted">— {line.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
