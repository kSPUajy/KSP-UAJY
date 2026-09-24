'use client'

import { useActionState, useId, useState } from 'react'

import { hapusGaleri, simpanGaleri } from '@/app/admin/galeri/actions'
import { AdminForm, FormMessage, Select, SubmitButton, TextInput } from '@/components/admin/form'
import { measureImage, uploadPhoto, uploadVideo } from '@/lib/admin/upload'
import { KATEGORI_GALERI } from '@/lib/types'

export type GaleriFormValues = {
  id?: string
  type?: 'image' | 'video'
  src?: string
  videoUrl?: string
  alt?: string
  caption?: string
  tanggal?: string
  kategori?: string
  width?: number
  height?: number
}

const today = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })

function FilePick({ label, accept, onPick }: { label: string; accept: string; onPick: (file: File) => void }) {
  const id = useId()
  return (
    <>
      <label
        htmlFor={id}
        className="inline-flex h-10 cursor-pointer items-center border-2 border-line bg-surface px-4 text-xs tracking-[0.08em] text-fg uppercase hover:bg-surface-2"
      >
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onPick(file)
        }}
      />
    </>
  )
}

export function GaleriForm({ initial }: { initial: GaleriFormValues }) {
  const [state, action] = useActionState(simpanGaleri, undefined)
  const uid = useId()
  const [type, setType] = useState(initial.type ?? 'image')
  const [src, setSrc] = useState(initial.src ?? '')
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl ?? '')
  const [size, setSize] = useState({ width: initial.width ?? 0, height: initial.height ?? 0 })
  const [status, setStatus] = useState('')
  const error = (field: string): string | undefined => state?.errors?.[field]

  async function pickPhoto(file: File): Promise<void> {
    setStatus('memperkecil & mengunggah gambar…')
    try {
      const photo = await uploadPhoto('galeri', file)
      setSrc(photo.url)
      setSize({ width: photo.width, height: photo.height })
      setStatus('[ok] gambar terunggah — jangan lupa simpan')
    } catch (problem) {
      setStatus(`error: ${problem instanceof Error ? problem.message : 'upload gagal'}`)
    }
  }

  async function pickVideo(file: File): Promise<void> {
    setStatus('mengunggah video… (bisa lama)')
    try {
      setVideoUrl(await uploadVideo(file))
      setStatus('[ok] video terunggah — jangan lupa simpan')
    } catch (problem) {
      setStatus(`error: ${problem instanceof Error ? problem.message : 'upload gagal'}`)
    }
  }

  async function measure(url: string): Promise<void> {
    if (!/^https:\/\//.test(url)) return
    try {
      setSize(await measureImage(url))
    } catch {
      setStatus('error: gambar tidak bisa dimuat dari tautan itu.')
    }
  }

  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-6">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="width" value={size.width || ''} />
      <input type="hidden" name="height" value={size.height || ''} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Select
          id={`${uid}-type`}
          name="type"
          label="jenis"
          value={type}
          onChange={(event) => setType(event.target.value as 'image' | 'video')}
          options={[
            { value: 'image', label: 'foto' },
            { value: 'video', label: 'video' },
          ]}
        />
        <TextInput id={`${uid}-tanggal`} name="tanggal" label="tanggal" type="date" defaultValue={initial.tanggal ?? today()} required error={error('tanggal')} />
        <Select
          id={`${uid}-kategori`}
          name="kategori"
          label="kategori"
          defaultValue={initial.kategori ?? 'kelas'}
          options={KATEGORI_GALERI.map((value) => ({ value, label: value }))}
          error={error('kategori')}
        />
      </div>

      <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">{type === 'video' ? 'gambar sampul video' : 'foto'}</legend>
        <TextInput
          id={`${uid}-src`}
          name="src"
          label="tautan"
          type="url"
          value={src}
          onChange={(event) => setSrc(event.target.value)}
          onBlur={(event) => void measure(event.target.value)}
          placeholder="https://…"
          hint={size.width ? `${size.width} × ${size.height} px` : 'Ukuran terbaca otomatis setelah unggah atau tempel tautan.'}
          error={error('src') ?? error('width')}
        />
        <div className="flex flex-wrap items-center gap-3">
          <FilePick label="unggah gambar" accept="image/jpeg,image/png,image/webp" onPick={(file) => void pickPhoto(file)} />
        </div>
      </fieldset>

      {type === 'video' ? (
        <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
          <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">video</legend>
          <TextInput
            id={`${uid}-video`}
            name="video_url"
            label="tautan-mp4"
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://…/klip.mp4"
            hint="File MP4/WebM maksimal 50 MB. Tautan YouTube tidak bisa diputar di sini."
            error={error('video_url')}
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilePick label="unggah video" accept="video/mp4,video/webm" onPick={(file) => void pickVideo(file)} />
          </div>
        </fieldset>
      ) : null}

      <p role="status" aria-live="polite" className="text-[12px] text-muted empty:hidden">
        {status}
      </p>

      <TextInput
        id={`${uid}-alt`}
        name="alt"
        label="deskripsi-gambar"
        defaultValue={initial.alt}
        required
        hint="Apa yang terlihat di gambar, untuk pembaca layar. Mis. “Peserta menyimak tentor di Lab Komputasi”."
        error={error('alt')}
      />
      <TextInput id={`${uid}-caption`} name="caption" label="keterangan" defaultValue={initial.caption} hint="Tampil di bawah foto saat dibuka." error={error('caption')} />

      <div className="flex flex-col gap-4 border-t-2 border-line-soft pt-6">
        <FormMessage state={state} />
        <div>
          <SubmitButton>{initial.id ? 'simpan' : 'tambahkan ke galeri'}</SubmitButton>
        </div>
      </div>
    </AdminForm>
  )
}

export function DeleteGaleriForm({ id }: { id: string }) {
  const [state, action] = useActionState(hapusGaleri, undefined)
  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-3" accent="orange">
      <input type="hidden" name="id" value={id} />
      <p className="text-[12px] leading-5 text-muted">
        Menghapus item dari galeri. Foto atau video yang diunggah lewat panel ini ikut dihapus dari penyimpanan.
      </p>
      <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-fg">
        <input type="checkbox" name="yakin" required className="h-4 w-4 accent-(--accent)" />
        ya, hapus item ini
      </label>
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline" pendingLabel="menghapus…">
          hapus dari galeri
        </SubmitButton>
      </div>
    </AdminForm>
  )
}
