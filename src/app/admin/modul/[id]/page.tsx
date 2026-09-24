import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { DeleteModulForm, ModulForm } from '@/components/admin/modul/ModulForm'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'
import { toModul } from '@/lib/supabase/rows'
import { createSupabaseServer } from '@/lib/supabase/server'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Edit modul — Admin',
  description: 'Edit modul mingguan.',
  path: '/admin/modul',
  noindex: true,
})

export default async function AdminModulEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireProfile(`/admin/modul/${id}`, ['admin'])

  // Read fresh under the admin's session, never from the public cache.
  const db = await createSupabaseServer()
  const [{ data }, { data: tentorRows }, { data: assignmentRows }] = await Promise.all([
    db.from('modules').select('*').eq('id', id).maybeSingle(),
    db.from('profiles').select('id, nama, npm, role').in('role', ['tentor', 'admin']).order('nama'),
    db.from('module_tentors').select('profile_id').eq('module_id', id),
  ])
  if (!data) notFound()
  const modul = toModul(data)
  const tentors = tentorRows ?? []

  // Nothing assigned yet: tick the tentor accounts whose first name matches a
  // name in the schedule's "tentor PJ", for the admin to confirm.
  const firstName = (value: string): string => value.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  const scheduled = new Set(modul.tentorPj.map(firstName))
  const current = (assignmentRows ?? []).map((row) => row.profile_id)
  const autoMatched = current.length === 0
  const assigned = autoMatched ? tentors.filter((tentor) => scheduled.has(firstName(tentor.nama))).map((tentor) => tentor.id) : current

  return (
    <>
      <Link href="/admin/modul" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading command={`vim ~/modul/minggu-${pad2(modul.minggu)}`} title={modul.judul} />
      </div>

      <div className="mt-8 max-w-3xl">
        <ModulForm initial={modul} tentors={tentors} assigned={assigned} autoMatched={autoMatched && assigned.length > 0} />
      </div>

      <div className="mt-12 max-w-3xl">
        <TerminalWindow title="~/admin/modul/hapus" tone="canvas" shadow={false} accent="orange">
          <DeleteModulForm id={modul.id} judul={modul.judul} />
        </TerminalWindow>
      </div>
    </>
  )
}
