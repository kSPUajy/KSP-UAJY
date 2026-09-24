'use client'

import { useActionState, useId } from 'react'

import { hapusSesi, simpanSesi } from '@/app/admin/modul/actions'
import { AdminForm, FormMessage, SubmitButton, TextArea, TextInput } from '@/components/admin/form'
import type { Sesi } from '@/lib/types'

/** Create (no `sesi`) or edit one session. */
export function SesiForm({ sesi }: { sesi?: Sesi }) {
  const [state, action] = useActionState(simpanSesi, undefined)
  const uid = useId()
  return (
    <AdminForm action={action} state={state} resetOnSuccess={!sesi} className="flex flex-col gap-4">
      {sesi ? <input type="hidden" name="id" value={sesi.id} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_11rem_8rem]">
        <TextInput id={`${uid}-judul`} name="judul" label="judul" defaultValue={sesi?.judul} required placeholder="Games" error={state?.errors?.judul} />
        <TextInput id={`${uid}-rilis`} name="rilis" label="mulai" type="date" defaultValue={sesi?.rilis} required error={state?.errors?.rilis} />
        <TextInput id={`${uid}-pj`} name="pj" label="pj" defaultValue={sesi?.pj} placeholder="PH" />
      </div>
      <TextArea id={`${uid}-ringkasan`} name="ringkasan" label="ringkasan" rows={2} defaultValue={sesi?.ringkasan} />
      <FormMessage state={state} />
      <div>
        <SubmitButton variant={sesi ? 'outline' : undefined}>{sesi ? 'simpan sesi' : 'tambah sesi'}</SubmitButton>
      </div>
    </AdminForm>
  )
}

export function DeleteSesiForm({ id }: { id: string }) {
  const [state, action] = useActionState(hapusSesi, undefined)
  return (
    <AdminForm action={action} state={state} accent="orange" className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="outline" pendingLabel="menghapus…">
        hapus sesi
      </SubmitButton>
      <FormMessage state={state} />
    </AdminForm>
  )
}
