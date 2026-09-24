'use client'

import { useActionState, useId } from 'react'

import { buatAnggota, hapusAnggota, imporAnggota, resetAnggota, ubahAnggota } from '@/app/admin/anggota/actions'
import type { IssuedPassword } from '@/app/admin/anggota/actions'
import { IssuedPasswords } from '@/components/admin/anggota/IssuedPasswords'
import { AdminForm, FormMessage, Select, SubmitButton, TextArea, TextInput } from '@/components/admin/form'

const ROLE_OPTIONS = [
  { value: 'anggota', label: 'anggota' },
  { value: 'tentor', label: 'tentor' },
  { value: 'admin', label: 'admin' },
] as const

const issuedFrom = (data: unknown): IssuedPassword[] | null => (Array.isArray(data) ? (data as IssuedPassword[]) : null)

export function CreateMemberForm() {
  const [state, action] = useActionState(buatAnggota, undefined)
  const uid = useId()
  const issued = issuedFrom(state?.data)
  const error = (field: string): string | undefined => state?.errors?.[field]

  return (
    <AdminForm action={action} state={state} resetOnSuccess className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput id={`${uid}-npm`} name="npm" label="npm" inputMode="numeric" required error={error('npm')} />
        <TextInput id={`${uid}-angkatan`} name="angkatan" label="angkatan" inputMode="numeric" placeholder="2024" error={error('angkatan')} />
      </div>
      <TextInput id={`${uid}-nama`} name="nama" label="nama" required autoComplete="off" error={error('nama')} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select id={`${uid}-peran`} name="peran" label="peran" options={ROLE_OPTIONS} defaultValue="anggota" error={error('peran')} />
        <TextInput
          id={`${uid}-password`}
          name="password"
          label="password-awal"
          autoComplete="off"
          placeholder="kosongkan = dibuat acak"
          error={error('password')}
        />
      </div>
      <FormMessage state={state} />
      {issued ? <IssuedPasswords rows={issued} /> : null}
      <div>
        <SubmitButton pendingLabel="membuat…">buat akun</SubmitButton>
      </div>
    </AdminForm>
  )
}

export function ImportMembersForm() {
  const [state, action] = useActionState(imporAnggota, undefined)
  const uid = useId()
  const issued = issuedFrom(state?.data)

  return (
    <AdminForm action={action} state={state} resetOnSuccess className="flex flex-col gap-5">
      <TextArea
        id={`${uid}-daftar`}
        name="daftar"
        label="daftar"
        code
        rows={8}
        placeholder={'240712841\tNama Lengkap\t2024\n240712842\tNama Lain\t2024'}
        hint="Satu anggota per baris: NPM, Nama, Angkatan. Boleh ditempel langsung dari spreadsheet (tiga kolom). Baris judul dilewati. Semua dibuat sebagai anggota."
      />
      <FormMessage state={state} />
      {issued ? <IssuedPasswords rows={issued} /> : null}
      <div>
        <SubmitButton pendingLabel="mengimpor…">impor</SubmitButton>
      </div>
    </AdminForm>
  )
}

export type MemberRowData = {
  id: string
  npm: string
  nama: string
  angkatan: number | null
  role: 'anggota' | 'tentor' | 'admin'
  mustChangePassword: boolean
}

/** Edit, reset, delete — three small forms for one member. */
export function MemberActions({ member, isSelf }: { member: MemberRowData; isSelf: boolean }) {
  const [editState, editAction] = useActionState(ubahAnggota, undefined)
  const [resetState, resetAction] = useActionState(resetAnggota, undefined)
  const [deleteState, deleteAction] = useActionState(hapusAnggota, undefined)
  const uid = useId()
  const issued = issuedFrom(resetState?.data)

  return (
    <div className="flex flex-col gap-8">
      <AdminForm action={editAction} state={editState} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={member.id} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_8rem_10rem]">
          <TextInput id={`${uid}-nama`} name="nama" label="nama" defaultValue={member.nama} required error={editState?.errors?.nama} />
          <TextInput
            id={`${uid}-angkatan`}
            name="angkatan"
            label="angkatan"
            inputMode="numeric"
            defaultValue={member.angkatan ?? ''}
            error={editState?.errors?.angkatan}
          />
          <Select id={`${uid}-peran`} name="peran" label="peran" options={ROLE_OPTIONS} defaultValue={member.role} />
        </div>
        <FormMessage state={editState} />
        <div>
          <SubmitButton variant="outline">simpan</SubmitButton>
        </div>
      </AdminForm>

      <AdminForm action={resetAction} state={resetState} className="flex flex-col gap-3 border-t-2 border-line-soft pt-6">
        <input type="hidden" name="id" value={member.id} />
        <p className="text-[12px] leading-6 text-muted">
          Lupa password? Buat password sekali pakai baru. Password lama langsung tidak berlaku.
        </p>
        <FormMessage state={resetState} />
        {issued ? <IssuedPasswords rows={issued} /> : null}
        <div>
          <SubmitButton variant="outline" pendingLabel="mereset…">
            reset password
          </SubmitButton>
        </div>
      </AdminForm>

      {isSelf ? null : (
        <AdminForm action={deleteAction} state={deleteState} className="flex flex-col gap-3 border-t-2 border-line-soft pt-6" accent="orange">
          <input type="hidden" name="id" value={member.id} />
          <TextInput
            id={`${uid}-konfirmasi`}
            name="konfirmasi"
            label="hapus-akun"
            inputMode="numeric"
            autoComplete="off"
            placeholder={member.npm}
            hint={`Menghapus akun beserta semua tugas yang pernah dikumpulkan. Tidak bisa dibatalkan. Ketik NPM ${member.npm} untuk mengonfirmasi.`}
            error={deleteState?.errors?.konfirmasi}
          />
          <FormMessage state={deleteState} />
          <div>
            <SubmitButton variant="outline" pendingLabel="menghapus…">
              hapus akun
            </SubmitButton>
          </div>
        </AdminForm>
      )}
    </div>
  )
}
