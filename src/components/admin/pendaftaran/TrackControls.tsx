'use client'

import { useActionState, useId, useState, useTransition } from 'react'

import { aturPendaftaran, simpanHalamanKelas, simpanTautanPendaftaran } from '@/app/admin/pendaftaran/actions'
import { AdminForm, FormMessage, SubmitButton, TextArea, TextInput } from '@/components/admin/form'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MdxEditor } from '@/components/admin/MdxEditor'
import { cn } from '@/lib/utils'

/**
 * A class's registration switch. It saves the moment it is flipped, and the
 * site announces the change at once.
 */
export function TrackSwitch({ id, nama, initial }: { id: string; nama: string; initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const labelId = useId()

  const flip = (): void => {
    const next = !on
    startTransition(async () => {
      const result = await aturPendaftaran(id, next)
      if (!result.ok) {
        setMessage(`error: ${result.error}`)
        return
      }
      setOn(next)
      setMessage(next ? `[ok] dibuka: situs mengumumkan pendaftaran kelas ${nama}.` : '[ok] ditutup.')
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        disabled={pending}
        onClick={flip}
        className="inline-flex items-center gap-3 disabled:opacity-60"
      >
        <span aria-hidden className={cn('relative block h-7 w-13 border-2 border-line transition-colors', on ? 'bg-accent' : 'bg-canvas')}>
          <span
            className={cn(
              'absolute top-0.5 block h-5 w-5 border-2 border-line transition-[left]',
              on ? 'left-[calc(100%-1.375rem)] bg-surface' : 'left-0.5 bg-line-soft',
            )}
          />
        </span>
        {/* The name stays put; aria-checked carries the state. */}
        <span id={labelId} className="sr-only">
          Pendaftaran kelas {nama} dibuka
        </span>
        <span aria-hidden className="text-[12px] tracking-[0.08em] text-fg uppercase">
          {on ? 'dibuka' : 'ditutup'}
        </span>
      </button>
      <span role="status" aria-live="polite" className="text-[12px] text-muted">
        {pending ? 'menyimpan…' : message}
      </span>
    </div>
  )
}

/** The class's sign-up form link, behind its "daftar" button. */
export function TrackLinkForm({ id, initial, className }: { id: string; initial: string | null; className?: string }) {
  const [state, action] = useActionState(simpanTautanPendaftaran, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} className={cn('flex flex-col gap-4', className)}>
      <input type="hidden" name="id" value={id} />
      <TextInput
        id={`${uid}-link`}
        name="link"
        label="tautan formulir"
        type="url"
        placeholder="https://…"
        defaultValue={initial ?? ''}
        error={state?.errors?.link}
        hint="Tujuan tombol daftar. Kosongkan kalau belum ada: kelasnya tetap diumumkan, tanpa tombol."
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline">simpan tautan</SubmitButton>
      </div>
    </AdminForm>
  )
}

export type KelasPageValues = {
  id: string
  ringkasan: string
  syarat: string[]
  isiMdx: string
  poster: string | null
}

/** A class's own registration page, /gabung/<id>: pitch, requirements, poster, details. */
export function KelasPageForm({ initial }: { initial: KelasPageValues }) {
  const [state, action] = useActionState(simpanHalamanKelas, undefined)
  const [poster, setPoster] = useState(initial.poster ?? '')
  const uid = useId()
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={initial.id} />
      <TextArea
        id={`${uid}-ringkasan`}
        name="ringkasan"
        label="ringkasan"
        rows={3}
        defaultValue={initial.ringkasan}
        error={error('ringkasan')}
        hint="Satu–dua kalimat di bawah judul halaman dan di kartu share."
      />
      <TextArea
        id={`${uid}-syarat`}
        name="syarat"
        label="syarat"
        rows={4}
        defaultValue={initial.syarat.join('\n')}
        error={error('syarat')}
        hint="Satu syarat per baris."
      />

      <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
        <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">poster</legend>
        <TextInput
          id={`${uid}-poster`}
          name="poster"
          label="tautan"
          type="url"
          value={poster}
          onChange={(event) => setPoster(event.target.value)}
          placeholder="https://…"
          error={error('poster')}
          hint="Tampil utuh di samping syarat. Kosongkan kalau tidak ada."
        />
        <ImageUpload folder="kelas" onUploaded={setPoster} />
      </fieldset>

      <MdxEditor
        name="isi_mdx"
        label="isi (mdx): materi, jadwal, biaya, dan lain-lain"
        rows={20}
        defaultValue={initial.isiMdx}
        error={error('isi_mdx')}
      />

      <div className="flex flex-col gap-4 border-t-2 border-line-soft pt-6">
        <FormMessage state={state} />
        <div>
          <SubmitButton>simpan halaman</SubmitButton>
        </div>
      </div>
    </AdminForm>
  )
}
