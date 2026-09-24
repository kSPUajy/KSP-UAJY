'use client'

import { createClient } from '@supabase/supabase-js'
import { useActionState, useId, useState } from 'react'

import { hapusModul, mulaiUploadModul, simpanModul } from '@/app/admin/modul/actions'
import { AdminForm, FormMessage, SubmitButton, TextArea, TextInput } from '@/components/admin/form'

export type TentorOption = { id: string; nama: string; npm: string }

export type ModulFormValues = {
  id?: string
  minggu?: number
  judul?: string
  rilis?: string
  tentorPj?: string[]
  koordinator?: string
  ringkasan?: string
  tugasDeskripsi?: string
  tenggat?: string
  berkasUrl?: string
}

/** Uploads a PDF straight to the public `modul` bucket and fills the link field. */
function PdfUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const id = useId()
  const [status, setStatus] = useState<string>('')

  async function upload(file: File): Promise<void> {
    setStatus('menyiapkan…')
    const start = await mulaiUploadModul(file.name, file.size)
    if (!start.ok) return setStatus(`error: ${start.error}`)
    setStatus('mengunggah…')
    const { error } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    })
      .storage.from('modul')
      .uploadToSignedUrl(start.path, start.token, file, { contentType: 'application/pdf' })
    if (error) return setStatus('error: upload gagal, coba lagi.')
    onUploaded(start.publicUrl)
    setStatus('[ok] PDF terunggah — jangan lupa simpan.')
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor={id}
        className="inline-flex h-10 cursor-pointer items-center border-2 border-line bg-surface px-4 text-xs tracking-[0.08em] text-fg uppercase hover:bg-surface-2"
      >
        unggah pdf
      </label>
      <input
        id={id}
        type="file"
        accept="application/pdf,.pdf"
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

/**
 * Which tentor accounts grade this module. Ticked boxes are the whole set:
 * saving replaces whatever was assigned before.
 */
function GraderPicker({ tentors, assigned, autoMatched }: { tentors: readonly TentorOption[]; assigned: readonly string[]; autoMatched: boolean }) {
  return (
    <fieldset className="flex flex-col gap-3 border-2 border-line-soft p-4 sm:p-5">
      <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">tentor penilai</legend>
      <input type="hidden" name="tentor_assign" value="1" />
      {tentors.length === 0 ? (
        <p className="text-[12px] leading-6 text-muted">
          Belum ada akun berperan tentor. Buat di <span className="text-fg">anggota</span> dengan peran tentor, lalu kembali ke sini.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {tentors.map((tentor) => (
              <label
                key={tentor.id}
                className="inline-flex cursor-pointer items-center gap-2 border-2 border-line-soft px-2.5 py-1.5 text-[12px] text-muted has-checked:border-accent-fg has-checked:text-fg"
              >
                <input type="checkbox" name="tentor_ids" value={tentor.id} defaultChecked={assigned.includes(tentor.id)} className="accent-(--accent)" />
                {tentor.nama}
              </label>
            ))}
          </div>
          <p className="text-[11px] leading-5 text-dim">
            {autoMatched
              ? 'Dicentang otomatis dari nama tentor PJ — periksa, lalu simpan untuk memberlakukannya.'
              : 'Tentor yang dicentang bisa melihat dan menilai tugas guided modul ini.'}
          </p>
        </>
      )}
    </fieldset>
  )
}

export function ModulForm({
  initial,
  tentors = [],
  assigned = [],
  autoMatched = false,
}: {
  initial: ModulFormValues
  tentors?: readonly TentorOption[]
  assigned?: readonly string[]
  autoMatched?: boolean
}) {
  const [state, action] = useActionState(simpanModul, undefined)
  const [berkas, setBerkas] = useState(initial.berkasUrl ?? '')
  const uid = useId()
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-6">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[8rem_minmax(0,1fr)_12rem]">
        <TextInput id={`${uid}-minggu`} name="minggu" label="minggu" type="number" min={1} defaultValue={initial.minggu} required error={error('minggu')} />
        <TextInput id={`${uid}-judul`} name="judul" label="judul" defaultValue={initial.judul} required error={error('judul')} />
        <TextInput id={`${uid}-rilis`} name="rilis" label="rilis" type="date" defaultValue={initial.rilis} required hint="Senin modul dibagikan." error={error('rilis')} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput
          id={`${uid}-tentor`}
          name="tentor_pj"
          label="tentor-pj"
          defaultValue={initial.tentorPj?.join(', ')}
          hint="Pisahkan dengan koma."
          error={error('tentor_pj')}
        />
        <TextInput id={`${uid}-koordinator`} name="koordinator" label="koordinator" defaultValue={initial.koordinator} error={error('koordinator')} />
      </div>

      <GraderPicker tentors={tentors} assigned={assigned} autoMatched={autoMatched} />

      <TextArea id={`${uid}-ringkasan`} name="ringkasan" label="ringkasan" rows={3} defaultValue={initial.ringkasan} hint="Satu–dua kalimat, tampil di /modul dan dashboard." error={error('ringkasan')} />

      <fieldset className="flex flex-col gap-5 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">tugas guided</legend>
        <TextArea
          id={`${uid}-tugas`}
          name="tugas_deskripsi"
          label="instruksi"
          rows={5}
          defaultValue={initial.tugasDeskripsi}
          hint="Kosongkan untuk instruksi umum."
          error={error('tugas_deskripsi')}
        />
        <TextInput
          id={`${uid}-tenggat`}
          name="tenggat"
          label="tenggat"
          type="datetime-local"
          defaultValue={initial.tenggat}
          hint="WIB. Kosongkan = Minggu 23.59 di minggu modul."
          error={error('tenggat')}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">berkas modul</legend>
        <TextInput
          id={`${uid}-berkas`}
          name="berkas_url"
          label="tautan"
          type="url"
          value={berkas}
          onChange={(event) => setBerkas(event.target.value)}
          placeholder="https://… (Google Drive, atau unggah PDF)"
          hint="Tautan baru tampil di situs setelah tanggal rilis."
          error={error('berkas_url')}
        />
        <PdfUpload onUploaded={setBerkas} />
      </fieldset>

      <FormMessage state={state} />
      <div>
        <SubmitButton>{initial.id ? 'simpan modul' : 'buat modul'}</SubmitButton>
      </div>
    </AdminForm>
  )
}

export function DeleteModulForm({ id, judul }: { id: string; judul: string }) {
  const [state, action] = useActionState(hapusModul, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-3" accent="orange">
      <input type="hidden" name="id" value={id} />
      <TextInput
        id={`${uid}-konfirmasi`}
        name="konfirmasi"
        label="hapus-modul"
        autoComplete="off"
        placeholder={judul}
        hint={`Menghapus modul beserta semua tugas guided yang sudah dikumpulkan untuknya. Ketik "${judul}" untuk mengonfirmasi.`}
        error={state?.errors?.konfirmasi}
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline" pendingLabel="menghapus…">
          hapus modul
        </SubmitButton>
      </div>
    </AdminForm>
  )
}
