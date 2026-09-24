'use client'

import { useActionState, useId, useState } from 'react'

import { hapusChallenge, hapusPemenang, simpanChallenge, simpanPemenang } from '@/app/admin/challenge/actions'
import { AdminForm, CheckboxGroup, FormMessage, Select, SubmitButton, TextArea, TextInput } from '@/components/admin/form'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MdxEditor } from '@/components/admin/MdxEditor'
import { Button } from '@/components/ui/Button'
import { DIFFICULTIES, TOPIK } from '@/lib/types'
import type { SampleIO } from '@/lib/types'
import { pad2 } from '@/lib/utils'

export type ChallengeFormValues = {
  id?: string
  minggu?: number
  judul?: string
  slug?: string
  tanggalRilis?: string
  deadline?: string
  difficulty?: string
  topik?: string[]
  totalPeserta?: number
  tags?: string[]
  constraints?: string[]
  hintTerkunci?: string[]
  deskripsiMdx?: string
  sampleIO?: SampleIO[]
}

/**
 * Sample I/O as a list of cards that can grow and shrink. Each card submits
 * three repeated fields; the server zips them back into objects in order.
 */
function SampleIOEditor({ initial, error }: { initial: SampleIO[]; error?: string }) {
  const uid = useId()
  const [rows, setRows] = useState(() =>
    (initial.length > 0 ? initial : [{ input: '', output: '', penjelasan: '' }]).map((sample, index) => ({ key: index, ...sample })),
  )
  const [nextKey, setNextKey] = useState(rows.length)

  return (
    <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
      <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">contoh masukan &amp; keluaran</legend>
      {rows.map((row, index) => (
        <div key={row.key} className="border-2 border-line-soft bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] text-dim">contoh {pad2(index + 1)}</span>
            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                className="text-[11px] text-muted underline underline-offset-4 hover:text-accent-fg"
              >
                hapus contoh
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextArea id={`${uid}-in-${row.key}`} name="sample_input" label="input" code rows={4} defaultValue={row.input} />
            <TextArea id={`${uid}-out-${row.key}`} name="sample_output" label="output" code rows={4} defaultValue={row.output} hint="Persis, termasuk spasi." />
          </div>
          <TextArea id={`${uid}-why-${row.key}`} name="sample_penjelasan" label="penjelasan" rows={2} defaultValue={row.penjelasan} className="mt-4" />
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setRows((current) => [...current, { key: nextKey, input: '', output: '', penjelasan: '' }])
            setNextKey((key) => key + 1)
          }}
        >
          + tambah contoh
        </Button>
      </div>
      {error ? (
        <p className="text-[12px] text-fg">
          <span className="text-accent-fg">error:</span> {error}
        </p>
      ) : null}
    </fieldset>
  )
}

export function ChallengeForm({ initial }: { initial: ChallengeFormValues }) {
  const [state, action] = useActionState(simpanChallenge, undefined)
  const uid = useId()
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-6">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <TextInput id={`${uid}-minggu`} name="minggu" label="minggu" type="number" min={1} defaultValue={initial.minggu} required error={error('minggu')} />
        <TextInput id={`${uid}-judul`} name="judul" label="judul" defaultValue={initial.judul} required error={error('judul')} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_11rem_13rem_11rem]">
        <TextInput id={`${uid}-slug`} name="slug" label="slug" defaultValue={initial.slug} placeholder="dibuat dari judul" error={error('slug')} />
        <TextInput id={`${uid}-rilis`} name="tanggal_rilis" label="rilis" type="date" defaultValue={initial.tanggalRilis} required error={error('tanggal_rilis')} />
        <TextInput id={`${uid}-deadline`} name="deadline" label="deadline" type="datetime-local" defaultValue={initial.deadline} required hint="WIB" error={error('deadline')} />
        <Select
          id={`${uid}-difficulty`}
          name="difficulty"
          label="tingkat"
          defaultValue={initial.difficulty ?? 'MUDAH'}
          options={DIFFICULTIES.map((value) => ({ value, label: value }))}
          error={error('difficulty')}
        />
      </div>

      <CheckboxGroup name="topik" legend="topik" options={TOPIK} defaultValues={initial.topik} />

      <MdxEditor name="deskripsi_mdx" label="soal (mdx)" defaultValue={initial.deskripsiMdx} error={error('deskripsi_mdx')} rows={16} hint="Paragraf pertama otomatis jadi teaser di beranda dan arsip. ## Format masukan, ## Format keluaran, ## Catatan." />

      <SampleIOEditor initial={initial.sampleIO ?? []} error={error('sample_io')} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextArea id={`${uid}-constraints`} name="constraints" label="batasan" code rows={5} defaultValue={initial.constraints?.join('\n')} hint="Satu batasan per baris." />
        <TextArea id={`${uid}-hints`} name="hint_terkunci" label="petunjuk-terkunci" rows={5} defaultValue={initial.hintTerkunci?.join('\n')} hint="Satu petunjuk per baris, dari yang paling samar." />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <TextInput id={`${uid}-tags`} name="tags" label="tag" defaultValue={initial.tags?.join(', ')} hint="Pisahkan dengan koma." />
        <TextInput id={`${uid}-peserta`} name="total_peserta" label="peserta" type="number" min={0} defaultValue={initial.totalPeserta ?? 0} error={error('total_peserta')} />
      </div>

      <FormMessage state={state} />
      <div>
        <SubmitButton>{initial.id ? 'simpan challenge' : 'buat challenge'}</SubmitButton>
      </div>
    </AdminForm>
  )
}

export type WinnerFormValues = {
  nama?: string
  slug?: string
  foto?: string
  angkatan?: number
  waktuSubmit?: string
  runtimeMs?: number
  totalMenang?: number
  pendekatan?: string
  kodeSolusi?: string
  quote?: string
}

export function WinnerForm({ challengeId, initial, exists }: { challengeId: string; initial: WinnerFormValues; exists: boolean }) {
  const [state, action] = useActionState(simpanPemenang, undefined)
  const [removeState, removeAction] = useActionState(hapusPemenang, undefined)
  const [foto, setFoto] = useState(initial.foto ?? '')
  const uid = useId()
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <div className="flex flex-col gap-8">
      <AdminForm action={action} state={state} className="flex flex-col gap-6">
        <input type="hidden" name="challenge_id" value={challengeId} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem]">
          <TextInput id={`${uid}-nama`} name="nama" label="nama" defaultValue={initial.nama} required error={error('nama')} />
          <TextInput
            id={`${uid}-slug`}
            name="slug"
            label="slug-orang"
            defaultValue={initial.slug}
            placeholder="dibuat dari nama"
            hint="Sama untuk orang yang sama di setiap kemenangan."
            error={error('slug')}
          />
          <TextInput id={`${uid}-angkatan`} name="angkatan" label="angkatan" inputMode="numeric" defaultValue={initial.angkatan} required error={error('angkatan')} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <TextInput id={`${uid}-submit`} name="waktu_submit" label="waktu-submit" type="datetime-local" defaultValue={initial.waktuSubmit} required error={error('waktu_submit')} />
          <TextInput id={`${uid}-runtime`} name="runtime_ms" label="runtime-ms" inputMode="numeric" defaultValue={initial.runtimeMs} error={error('runtime_ms')} />
          <TextInput
            id={`${uid}-total`}
            name="total_menang"
            label="total-menang"
            type="number"
            min={1}
            defaultValue={initial.totalMenang ?? 1}
            hint="Sepanjang masa, termasuk kemenangan ini."
            error={error('total_menang')}
          />
        </div>
        <fieldset className="flex flex-col gap-4 border-2 border-line-soft p-4 sm:p-5">
          <legend className="px-2 text-[11px] tracking-[0.12em] text-accent-fg uppercase">foto potret (4:5)</legend>
          <TextInput
            id={`${uid}-foto`}
            name="foto"
            label="tautan"
            type="url"
            value={foto}
            onChange={(event) => setFoto(event.target.value)}
            placeholder="https://…"
            error={error('foto')}
          />
          <ImageUpload folder="pemenang" onUploaded={setFoto} />
        </fieldset>
        <TextInput id={`${uid}-quote`} name="quote" label="kutipan" defaultValue={initial.quote} required error={error('quote')} />
        <TextArea id={`${uid}-pendekatan`} name="pendekatan" label="pendekatan" rows={5} defaultValue={initial.pendekatan} required error={error('pendekatan')} />
        <TextArea id={`${uid}-kode`} name="kode_solusi" label="kode-solusi" code rows={16} defaultValue={initial.kodeSolusi} required error={error('kode_solusi')} />
        <FormMessage state={state} />
        <div>
          <SubmitButton>{exists ? 'simpan pemenang' : 'umumkan pemenang'}</SubmitButton>
        </div>
      </AdminForm>

      {exists ? (
        <AdminForm action={removeAction} state={removeState} className="flex flex-col gap-3 border-t-2 border-line-soft pt-6" accent="orange">
          <input type="hidden" name="challenge_id" value={challengeId} />
          <FormMessage state={removeState} />
          <div>
            <SubmitButton variant="outline" pendingLabel="menghapus…">
              hapus pemenang
            </SubmitButton>
          </div>
        </AdminForm>
      ) : null}
    </div>
  )
}

export function DeleteChallengeForm({ id, slug }: { id: string; slug: string }) {
  const [state, action] = useActionState(hapusChallenge, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-3" accent="orange">
      <input type="hidden" name="id" value={id} />
      <TextInput
        id={`${uid}-konfirmasi`}
        name="konfirmasi"
        label="hapus-challenge"
        autoComplete="off"
        placeholder={slug}
        hint={`Menghapus soal beserta pemenangnya. Tidak bisa dibatalkan. Ketik "${slug}" untuk mengonfirmasi.`}
        error={state?.errors?.konfirmasi}
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline" pendingLabel="menghapus…">
          hapus challenge
        </SubmitButton>
      </div>
    </AdminForm>
  )
}
