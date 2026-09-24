'use client'

import { useActionState, useId } from 'react'

import { bukaKembali, nilaiTugas } from '@/app/penilaian/actions'
import { AdminForm, FormMessage, SubmitButton, TextArea, TextInput } from '@/components/admin/form'

export function GradeForm({ id, nilai, komentar }: { id: string; nilai: number | null; komentar: string | null }) {
  const [state, action] = useActionState(nilaiTugas, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={id} />
      <TextInput
        id={`${uid}-nilai`}
        name="nilai"
        label="nilai"
        type="number"
        min={0}
        max={100}
        inputMode="numeric"
        defaultValue={nilai ?? ''}
        required
        hint="0–100."
        error={state?.errors?.nilai}
        className="max-w-40"
      />
      <TextArea
        id={`${uid}-komentar`}
        name="komentar"
        label="komentar"
        rows={6}
        defaultValue={komentar ?? ''}
        hint="Tampil di dashboard anggota. Tunjukkan baris yang perlu diperbaiki, bukan hanya salahnya."
        error={state?.errors?.komentar}
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton>{nilai === null ? 'simpan nilai' : 'perbarui nilai'}</SubmitButton>
      </div>
    </AdminForm>
  )
}

export function ReopenForm({ id }: { id: string }) {
  const [state, action] = useActionState(bukaKembali, undefined)
  return (
    <AdminForm action={action} state={state} accent="orange" className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-[12px] leading-6 text-muted">
        Menghapus nilai dan komentar, supaya anggota bisa mengunggah versi yang sudah diperbaiki.
      </p>
      <FormMessage state={state} />
      <div>
        <SubmitButton variant="outline" pendingLabel="membuka…">
          buka kembali
        </SubmitButton>
      </div>
    </AdminForm>
  )
}
