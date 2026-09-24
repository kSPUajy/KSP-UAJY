'use client'

import { useActionState, useId, useState } from 'react'

import { simpanProfilTentor } from '@/app/admin/tentor/actions'
import { AdminForm, FormMessage, SubmitButton, TextArea, TextInput, Toggle } from '@/components/admin/form'
import { ImageUpload } from '@/components/admin/ImageUpload'

export type TentorProfileValues = {
  profileId: string
  foto: string
  keahlian: string[]
  quote: string
  bio: string
  pengalaman: Array<{ tahun: string; judul: string; deskripsi: string }>
  snippetJudul: string
  snippetCode: string
  socials: { github?: string; instagram?: string; linkedin?: string }
  tampil: boolean
}

export function TentorProfileForm({ initial }: { initial: TentorProfileValues }) {
  const [state, action] = useActionState(simpanProfilTentor, undefined)
  const [foto, setFoto] = useState(initial.foto)
  const uid = useId()
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-6">
      <input type="hidden" name="profile_id" value={initial.profileId} />

      <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">foto</legend>
        <TextInput
          id={`${uid}-foto`}
          name="foto"
          label="tautan"
          type="url"
          value={foto}
          onChange={(event) => setFoto(event.target.value)}
          placeholder="kosongkan untuk potret inisial"
          hint="Potret tegak 4:5 paling pas. Tanpa foto, situs memakai potret pixel inisial."
          error={error('foto')}
        />
        <ImageUpload folder="tentor" onUploaded={setFoto} />
      </fieldset>

      <TextInput
        id={`${uid}-keahlian`}
        name="keahlian"
        label="keahlian"
        defaultValue={initial.keahlian.join(', ')}
        placeholder="pointer, rekursi, debugging"
        hint="Pisahkan dengan koma."
        error={error('keahlian')}
      />
      <TextInput id={`${uid}-quote`} name="quote" label="kutipan" defaultValue={initial.quote} hint="Satu kalimat, tampil besar di profil. Boleh kosong." error={error('quote')} />
      <TextArea id={`${uid}-bio`} name="bio" label="bio" rows={5} defaultValue={initial.bio} hint="Kosong = kalimat otomatis dari nama dan modulnya." error={error('bio')} />
      <TextArea
        id={`${uid}-pengalaman`}
        name="pengalaman"
        label="pengalaman"
        rows={4}
        defaultValue={initial.pengalaman.map((row) => [row.tahun, row.judul, row.deskripsi].join(' | ')).join('\n')}
        placeholder="2025 | Tentor modul Flowchart | Memegang dua pertemuan pertama."
        hint="Satu baris per pengalaman: tahun | judul | deskripsi."
        error={error('pengalaman')}
      />

      <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">snippet favorit</legend>
        <TextInput id={`${uid}-snippet-judul`} name="snippet_judul" label="judul" defaultValue={initial.snippetJudul} error={error('snippet_judul')} />
        <TextArea id={`${uid}-snippet-code`} name="snippet_code" label="kode c" rows={10} code defaultValue={initial.snippetCode} hint="Kosongkan kalau tidak ada; bagian ini tidak ditampilkan." error={error('snippet_code')} />
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <TextInput id={`${uid}-github`} name="github" label="github" type="url" defaultValue={initial.socials.github} placeholder="https://github.com/…" error={error('github')} />
        <TextInput id={`${uid}-instagram`} name="instagram" label="instagram" type="url" defaultValue={initial.socials.instagram} placeholder="https://instagram.com/…" error={error('instagram')} />
        <TextInput id={`${uid}-linkedin`} name="linkedin" label="linkedin" type="url" defaultValue={initial.socials.linkedin} placeholder="https://linkedin.com/in/…" error={error('linkedin')} />
      </div>

      <div className="flex flex-col gap-4 border-t-2 border-line-soft pt-6">
        <Toggle name="tampil" label="tampilkan di situs (carousel, /tentor, struktur)" defaultChecked={initial.tampil} />
        <FormMessage state={state} />
        <div>
          <SubmitButton>simpan profil</SubmitButton>
        </div>
      </div>
    </AdminForm>
  )
}
