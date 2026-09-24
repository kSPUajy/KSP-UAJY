import type { Metadata } from 'next'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { CreateMemberForm, ImportMembersForm, MemberActions } from '@/components/admin/anggota/MemberForms'
import type { MemberRowData } from '@/components/admin/anggota/MemberForms'
import { Badge } from '@/components/ui/Badge'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Anggota — Admin',
  description: 'Kelola akun anggota KSP.',
  path: '/admin/anggota',
  noindex: true,
})

const ROLE_ORDER = { admin: 0, tentor: 1, anggota: 2 } as const

export default async function AdminAnggotaPage() {
  const profile = await requireProfile('/admin/anggota', ['admin'])
  const db = await createSupabaseServer()
  const { data, error } = await db.from('profiles').select('id, npm, nama, angkatan, role, must_change_password')
  if (error) throw new Error(`Gagal membaca anggota: ${error.message}`)

  const members: MemberRowData[] = data
    .map((row) => ({
      id: row.id,
      npm: row.npm,
      nama: row.nama,
      angkatan: row.angkatan,
      role: row.role,
      mustChangePassword: row.must_change_password,
    }))
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.nama.localeCompare(b.nama, 'id'))

  return (
    <>
      <AdminHeading
        command="cat /etc/passwd"
        title="Anggota"
        description="Akun dibuat di sini, bukan didaftarkan sendiri. Setiap akun baru mendapat password sekali pakai yang wajib diganti saat pertama masuk."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TerminalWindow title="~/admin/anggota/baru" tone="canvas" shadow={false}>
          <h2 className="mb-5 text-sm font-bold text-fg">Tambah satu akun</h2>
          <CreateMemberForm />
        </TerminalWindow>
        <TerminalWindow title="~/admin/anggota/impor" tone="canvas" shadow={false}>
          <h2 className="mb-5 text-sm font-bold text-fg">Impor dari daftar</h2>
          <ImportMembersForm />
        </TerminalWindow>
      </div>

      <section aria-labelledby="daftar-anggota" className="mt-12">
        <h2 id="daftar-anggota" className="text-[11px] tracking-[0.12em] text-dim uppercase">
          {`// ${members.length} akun`}
        </h2>
        <ul className="mt-3 border-t-2 border-line">
          {members.map((member) => (
            <li key={member.id} className="border-b-2 border-line">
              <details className="group">
                <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-3 py-3.5 transition-colors hover:bg-surface-2 sm:grid-cols-[9rem_minmax(0,1fr)_auto_auto] [&::-webkit-details-marker]:hidden">
                  <span className="text-[12px] text-muted tabular-nums">{member.npm}</span>
                  <span className="col-start-1 row-start-2 min-w-0 truncate text-sm font-bold text-fg sm:col-start-auto sm:row-start-auto">
                    {member.nama}
                    {member.id === profile.id ? <span className="ml-2 font-normal text-dim">(kamu)</span> : null}
                  </span>
                  <span className="row-span-2 sm:row-span-1">
                    <Badge size="sm" variant={member.role === 'anggota' ? 'ghost' : 'solid'}>
                      {member.role}
                    </Badge>
                  </span>
                  <span className="hidden text-[11px] text-dim sm:inline">
                    {member.mustChangePassword ? 'belum login pertama' : member.angkatan ? `angkatan ${member.angkatan}` : ''}
                  </span>
                </summary>
                <div className="border-t-2 border-line-soft bg-surface px-3 py-6 sm:px-6">
                  <MemberActions member={member} isSelf={member.id === profile.id} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
