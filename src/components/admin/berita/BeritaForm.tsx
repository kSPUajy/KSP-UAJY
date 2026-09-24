'use client'

import { useActionState, useId, useState } from 'react'

import { hapusBerita, simpanBerita } from '@/app/admin/berita/actions'
import { AdminForm, FormMessage, Select, SubmitButton, TextArea, TextInput, Toggle } from '@/components/admin/form'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MdxEditor } from '@/components/admin/MdxEditor'
import { KATEGORI_BERITA } from '@/lib/types'

export type BeritaFormValues = {
  id?: string
  judul?: string
  slug?: string
  tanggal?: string
  kategori?: string
  penulis?: string
  cover?: string
  excerpt?: string
  tags?: string[]
  bodyMdx?: string
  published?: boolean
}

export function BeritaForm({ initial }: { initial: BeritaFormValues }) {
  const [state, action] = useActionState(simpanBerita, undefined)
  const [cover, setCover] = useState(initial.cover ?? '')
  const uid = useId()
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-6">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <TextInput id={`${uid}-judul`} name="judul" label="judul" defaultValue={initial.judul} required error={error('judul')} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_11rem_12rem]">
        <TextInput
          id={`${uid}-slug`}
          name="slug"
          label="slug"
          defaultValue={initial.slug}
          placeholder="dibuat dari judul"
          hint={initial.id ? 'Mengganti slug mengganti URL berita.' : 'Kosongkan untuk dibuat otomatis.'}
          error={error('slug')}
        />
        <TextInput id={`${uid}-tanggal`} name="tanggal" label="tanggal" type="date" defaultValue={initial.tanggal} required error={error('tanggal')} />
        <Select
          id={`${uid}-kategori`}
          name="kategori"
          label="kategori"
          defaultValue={initial.kategori ?? 'pengumuman'}
          options={KATEGORI_BERITA.map((value) => ({ value, label: value }))}
          error={error('kategori')}
        />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput id={`${uid}-penulis`} name="penulis" label="penulis" defaultValue={initial.penulis} required error={error('penulis')} hint="Nama persis tentor/pengurus akan tertaut ke profilnya." />
        <TextInput id={`${uid}-tags`} name="tags" label="tag" defaultValue={initial.tags?.join(', ')} hint="Pisahkan dengan koma. Tag “pendaftaran” menandai pengumuman pendaftaran." />
      </div>
      <TextArea id={`${uid}-excerpt`} name="excerpt" label="ringkasan" rows={3} defaultValue={initial.excerpt} required error={error('excerpt')} hint="Dua–tiga kalimat, tampil di daftar berita dan kartu share." />

      <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">sampul</legend>
        <TextInput
          id={`${uid}-cover`}
          name="cover"
          label="tautan"
          type="url"
          value={cover}
          onChange={(event) => setCover(event.target.value)}
          placeholder="https://…"
          error={error('cover')}
        />
        <ImageUpload folder="berita" onUploaded={setCover} />
      </fieldset>

      <MdxEditor name="body_mdx" label="isi (mdx)" rows={22} defaultValue={initial.bodyMdx} error={error('body_mdx')} />

      <div className="flex flex-col gap-4 border-t-2 border-line-soft pt-6">
        <Toggle name="published" label="terbitkan (kalau tidak dicentang, tersimpan sebagai draf)" defaultChecked={initial.published ?? false} />
        <FormMessage state={state} />
        <div>
          <SubmitButton>{initial.id ? 'simpan berita' : 'buat berita'}</SubmitButton>
        </div>
      </div>
    </AdminForm>
  )
}

export function DeleteBeritaForm({ id, slug }: { id: string; slug: string }) {
  const [state, action] = useActionState(hapusBerita, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-3" accent="orange">
      <input type="hidden" name="id" value={id} />
      <TextInput
        id={`${uid}-konfirmasi`}
        name="konfirmasi"
        label="hapus-berita"
        autoComplete="off"
        placeholder={slug}
        hint={`Tidak bisa dibatalkan. Kalau hanya ingin menyembunyikannya, jadikan draf. Ketik "${slug}" untuk mengonfirmasi.`}
        error={state?.errors?.konfirmasi}
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline" pendingLabel="menghapus…">
          hapus berita
        </SubmitButton>
      </div>
    </AdminForm>
  )
}
