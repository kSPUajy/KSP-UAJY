'use client'

import { createClient } from '@supabase/supabase-js'
import { useActionState, useId, useState, useTransition } from 'react'

import { aturTugasUnguided, hapusModul, mulaiUploadModul, simpanModul } from '@/app/admin/modul/actions'
import type { JenisBerkas } from '@/app/admin/modul/actions'
import { AdminForm, FormMessage, SubmitButton, TextArea, TextInput } from '@/components/admin/form'
import { cn } from '@/lib/utils'

export type TentorOption = { id: string; nama: string; npm: string; role: 'anggota' | 'tentor' | 'admin' }

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
  tugasGuidedUrl?: string
  tugasUnguided?: { path: string; terbuka: boolean }
}

const FIELDSET_CLASS = 'flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5'
const LEGEND_CLASS = 'px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase'
const SMALL_BUTTON_CLASS =
  'inline-flex h-10 cursor-pointer items-center border-2 border-line bg-surface px-4 text-xs tracking-[0.08em] text-fg uppercase hover:bg-surface-2 disabled:cursor-default disabled:opacity-60'

/**
 * Uploads a PDF or ZIP for one of the module's files, straight to storage
 * through a one-time URL, and hands back what the form stores: a public
 * link, or for the unguided task the private object's path.
 */
function BerkasUpload({ jenis, onUploaded }: { jenis: JenisBerkas; onUploaded: (value: string) => void }) {
  const id = useId()
  const [status, setStatus] = useState<string>('')

  async function upload(file: File): Promise<void> {
    setStatus('menyiapkan…')
    const start = await mulaiUploadModul(jenis, file.name, file.size)
    if (!start.ok) return setStatus(`error: ${start.error}`)
    setStatus('mengunggah…')
    const zip = file.name.toLowerCase().endsWith('.zip')
    const contentType = zip ? 'application/zip' : 'application/pdf'
    // Storage takes the type from the file itself, and browsers disagree on
    // it (Windows calls a ZIP `application/x-zip-compressed`), so it is
    // restated as one of the two the buckets accept.
    const body = new File([file], file.name, { type: contentType })
    const { error } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    })
      .storage.from(start.bucket)
      .uploadToSignedUrl(start.path, start.token, body, { contentType })
    if (error) return setStatus('error: upload gagal, coba lagi.')
    onUploaded(start.value)
    setStatus(`[ok] ${zip ? 'ZIP' : 'PDF'} terunggah — jangan lupa simpan.`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={id} className={SMALL_BUTTON_CLASS}>
        unggah pdf / zip
      </label>
      <input
        id={id}
        type="file"
        accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
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
 * The unguided task's lock. It saves the moment it is flipped, on its own,
 * so opening the task on class day is one click and never waits on the rest
 * of the form.
 */
function UnguidedSwitch({ moduleId, initial }: { moduleId: string; initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const labelId = useId()

  const flip = (): void => {
    const next = !on
    startTransition(async () => {
      const result = await aturTugasUnguided(moduleId, next)
      if (!result.ok) {
        setMessage(`error: ${result.error}`)
        return
      }
      setOn(next)
      setMessage(next ? '[ok] dibuka — semua orang sudah bisa mengunduh.' : '[ok] dikunci — tidak bisa diunduh lagi.')
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
          Tugas unguided bisa diunduh semua orang
        </span>
        <span aria-hidden className="text-[12px] tracking-[0.08em] text-fg uppercase">
          {on ? 'dibuka' : 'terkunci'}
        </span>
      </button>
      <span role="status" aria-live="polite" className="text-[12px] text-muted">
        {pending ? 'menyimpan…' : message}
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
          Belum ada akun berperan tentor atau admin. Buat di <span className="text-fg">anggota</span>, lalu kembali ke sini.
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
                {tentor.role === 'admin' ? <span className="text-[10px] text-dim">admin</span> : null}
              </label>
            ))}
          </div>
          <p className="text-[11px] leading-5 text-dim">
            {autoMatched
              ? 'Dicentang otomatis dari nama tentor PJ — periksa, lalu simpan untuk memberlakukannya.'
              : 'Tentor yang dicentang bisa melihat dan menilai tugas guided modul ini. Admin bisa menilai semua modul; mencentang admin menandainya sebagai PJ modul ini.'}
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
  const [guided, setGuided] = useState(initial.tugasGuidedUrl ?? '')
  const [unguided, setUnguided] = useState(initial.tugasUnguided?.path ?? '')
  const uid = useId()
  // The preview route reads the saved row, so it only matches the file once saved.
  const unguidedSaved = Boolean(initial.id && unguided && unguided === initial.tugasUnguided?.path)
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

      <fieldset className={FIELDSET_CLASS}>
        <legend className={LEGEND_CLASS}>berkas modul</legend>
        <TextInput
          id={`${uid}-berkas`}
          name="berkas_url"
          label="tautan"
          type="url"
          value={berkas}
          onChange={(event) => setBerkas(event.target.value)}
          placeholder="https://… (Google Drive, atau unggah PDF / ZIP)"
          hint="Maks 20 MB. Langsung bisa diunduh di /modul setelah disimpan, termasuk sebelum tanggal rilis."
          error={error('berkas_url')}
        />
        <BerkasUpload jenis="modul" onUploaded={setBerkas} />
      </fieldset>

      <fieldset className={FIELDSET_CLASS}>
        <legend className={LEGEND_CLASS}>tugas guided</legend>
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
        <TextInput
          id={`${uid}-guided`}
          name="tugas_guided_url"
          label="berkas-tugas"
          type="url"
          value={guided}
          onChange={(event) => setGuided(event.target.value)}
          placeholder="https://… (Google Drive, atau unggah PDF / ZIP)"
          hint="Lembar tugas atau kode awal. Publik seperti berkas modul; kosongkan kalau tidak ada."
          error={error('tugas_guided_url')}
        />
        <BerkasUpload jenis="guided" onUploaded={setGuided} />
      </fieldset>

      <fieldset className={FIELDSET_CLASS}>
        <legend className={LEGEND_CLASS}>tugas unguided</legend>
        <input type="hidden" name="tugas_unguided_path" value={unguided} />
        <p className="text-[12px] leading-6 text-muted">
          {unguided ? (
            <>
              berkas: <span className="text-fg">{unguided.endsWith('.zip') ? 'ZIP' : 'PDF'}</span>
              {unguidedSaved ? ' tersimpan' : ' baru — simpan modul untuk memakainya'}
            </>
          ) : (
            'Belum ada berkas.'
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <BerkasUpload jenis="unguided" onUploaded={setUnguided} />
          {unguidedSaved ? (
            <a href={`/modul/${initial.id}/tugas-unguided`} className={SMALL_BUTTON_CLASS}>
              unduh (pratinjau)
            </a>
          ) : null}
          {unguided ? (
            <button type="button" onClick={() => setUnguided('')} className={SMALL_BUTTON_CLASS}>
              lepas berkas
            </button>
          ) : null}
        </div>
        {error('tugas_unguided_path') ? <p className="text-[12px] text-accent-fg">error: {error('tugas_unguided_path')}</p> : null}
        <div className="flex flex-col gap-2 border-t-2 border-line-soft pt-4">
          <p className="text-[11px] tracking-[0.12em] text-dim uppercase">akses unduh</p>
          {initial.id ? (
            <UnguidedSwitch moduleId={initial.id} initial={initial.tugasUnguided?.terbuka ?? false} />
          ) : (
            <p className="text-[12px] leading-6 text-muted">Mulai terkunci. Buka dari halaman edit setelah modul dibuat.</p>
          )}
          <p className="text-[11px] leading-5 text-dim">
            Terkunci: berkas tidak bisa diunduh siapa pun kecuali admin dan tentor. Dibuka: semua orang bisa mengunduhnya
            dari /modul dan dashboard, tanpa perlu masuk. Tugas unguided tidak dikumpulkan. Switch ini langsung tersimpan,
            tanpa tombol simpan.
          </p>
        </div>
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
