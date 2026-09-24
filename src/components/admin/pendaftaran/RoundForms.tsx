'use client'

import { useActionState, useId } from 'react'

import { bukaGelombang, tutupSekarang, ubahGelombang } from '@/app/admin/pendaftaran/actions'
import { AdminForm, FormMessage, SubmitButton, TextInput } from '@/components/admin/form'

export function NewRoundForm({ suggestBuka, suggestTutup }: { suggestBuka: string; suggestTutup: string }) {
  const [state, action] = useActionState(bukaGelombang, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput id={`${uid}-buka`} name="buka" label="buka" type="datetime-local" defaultValue={suggestBuka} required error={state?.errors?.buka} />
        <TextInput id={`${uid}-tutup`} name="tutup" label="tutup" type="datetime-local" defaultValue={suggestTutup} required error={state?.errors?.tutup} hint="Waktu WIB." />
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton>jadwalkan gelombang</SubmitButton>
      </div>
    </AdminForm>
  )
}

export function EditRoundForm({ id, buka, tutup, running }: { id: number; buka: string; tutup: string; running: boolean }) {
  const [state, action] = useActionState(ubahGelombang, undefined)
  const [closeState, closeAction] = useActionState(tutupSekarang, undefined)
  const uid = useId()
  return (
    <div className="flex flex-col gap-6">
      <AdminForm action={action} state={state} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={id} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput id={`${uid}-buka`} name="buka" label="buka" type="datetime-local" defaultValue={buka} required error={state?.errors?.buka} />
          <TextInput id={`${uid}-tutup`} name="tutup" label="tutup" type="datetime-local" defaultValue={tutup} required error={state?.errors?.tutup} />
        </div>
        <FormMessage state={state} />
        <div>
          <SubmitButton variant="outline">simpan tanggal</SubmitButton>
        </div>
      </AdminForm>
      {running ? (
        <AdminForm action={closeAction} state={closeState} className="flex flex-col gap-3 border-t-2 border-line-soft pt-6">
          <input type="hidden" name="id" value={id} />
          <p className="text-[12px] leading-6 text-muted">
            Menutup pendaftaran menit ini. Tombol &ldquo;daftar sekarang&rdquo; di seluruh situs langsung berganti.
          </p>
          <FormMessage state={closeState} />
          <div>
            <SubmitButton variant="outline" pendingLabel="menutup…">
              tutup sekarang
            </SubmitButton>
          </div>
        </AdminForm>
      ) : null}
    </div>
  )
}
