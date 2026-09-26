'use client'

import { useActionState } from 'react'

import { kirimMasukan } from '@/app/masukan/actions'
import { AdminForm, FormMessage, Select, SubmitButton, TextArea, TextInput } from '@/components/admin/form'

const JENIS = [
  { value: 'saran', label: 'saran' },
  { value: 'kritik', label: 'kritik' },
  { value: 'lainnya', label: 'lainnya' },
] as const

export function FeedbackForm() {
  const [state, action] = useActionState(kirimMasukan, undefined)
  const errors = state && !state.ok && 'errors' in state ? state.errors : undefined

  return (
    <AdminForm action={action} state={state} resetOnSuccess className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <TextInput
          id="masukan-nama"
          name="nama"
          label="nama"
          placeholder="boleh dikosongkan"
          autoComplete="name"
          maxLength={80}
          error={errors?.nama}
        />
        <Select id="masukan-jenis" name="kategori" label="jenis" options={JENIS} defaultValue="saran" error={errors?.kategori} />
      </div>
      <TextArea
        id="masukan-pesan"
        name="pesan"
        label="pesan"
        placeholder="Kelasnya terlalu cepat, modulnya kurang jelas, atau ada ide kegiatan?"
        required
        minLength={10}
        maxLength={2000}
        rows={5}
        error={errors?.pesan}
      />
      {/* Honeypot: invisible to people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="masukan-situs">situs</label>
        <input id="masukan-situs" name="situs" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SubmitButton pendingLabel="mengirim…">kirim masukan</SubmitButton>
        <FormMessage state={state} />
      </div>
    </AdminForm>
  )
}
