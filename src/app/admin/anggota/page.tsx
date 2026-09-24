import type { Metadata } from 'next'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { CipherName } from '@/components/admin/anggota/CipherName'
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

/**
 * The account of whoever built this site. Its row is an unreadable cipher —
 * name, NPM and year — and stays that way: only the shape of each value is
 * sent to the browser, never the value, and the row has no edit forms (they
 * would carry the values). The account is still an admin.
 */
const CREATOR_NPM = '240712841'
/** The name's shape: two words, 5 and 11 letters. */
const CREATOR_NAME_SHAPE = 'xxxxx xxxxxxxxxxx'
const shapeOf = (value: string): string => value.replace(/\S/g, 'x')

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
                  <span className="text-[12px] text-muted tabular-nums">
                    {member.npm === CREATOR_NPM ? <CipherName shape={shapeOf(member.npm)} alphabet="digits" look="blur" label="NPM disembunyikan" /> : member.npm}
                  </span>
                  <span className="col-start-1 row-start-2 min-w-0 truncate text-sm font-bold text-fg sm:col-start-auto sm:row-start-auto">
                    {member.npm === CREATOR_NPM ? <CipherName shape={CREATOR_NAME_SHAPE} label="nama disembunyikan" /> : member.nama}
                    {member.id === profile.id ? (
                      <span className="ml-2 font-normal text-accent-fg">
                        <span aria-hidden>&lt;| I&apos;am Here!</span>
                        <span className="sr-only">(akunmu)</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="row-span-2 sm:row-span-1">
                    <Badge size="sm" variant={member.role === 'anggota' ? 'ghost' : 'solid'}>
                      {member.npm === CREATOR_NPM ? (
                        // Still an admin; the badge just reads as corrupted.
                        <>
                          <span aria-hidden className="glitch glitch-sharp" data-text="???">
                            ???
                          </span>
                          <span className="sr-only">peran tidak diketahui</span>
                        </>
                      ) : (
                        member.role
                      )}
                    </Badge>
                  </span>
                  <span className="hidden text-[11px] text-dim sm:inline">
                    {member.npm === CREATOR_NPM && !member.mustChangePassword && member.angkatan ? (
                      <>
                        angkatan{' '}
                        <CipherName
                          shape={shapeOf(String(member.angkatan))}
                          reveal={String(member.angkatan)}
                          alphabet="digits"
                          look="blur"
                          label={`angkatan ${member.angkatan}`}
                        />
                      </>
                    ) : member.mustChangePassword ? (
                      'belum login pertama'
                    ) : member.angkatan ? (
                      `angkatan ${member.angkatan}`
                    ) : (
                      ''
                    )}
                  </span>
                </summary>
                <div className="border-t-2 border-line-soft bg-surface px-3 py-6 sm:px-6">
                  {member.npm === CREATOR_NPM ? (
                    // No edit forms here: they would carry the real name, NPM
                    // and year to the browser. Manage this account with
                    // `npm run akun` instead.
                    <p className="font-mono text-[12px] leading-6 text-muted">
                      <span className="text-accent-fg">$</span> cat ~/.akun
                      <br />
                      cat: ~/.akun: Permission denied
                    </p>
                  ) : (
                    <MemberActions member={member} isSelf={member.id === profile.id} />
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
