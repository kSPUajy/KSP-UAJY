import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { ModulForm } from '@/components/admin/modul/ModulForm'
import { requireProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { addDays } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Modul baru — Admin',
  description: 'Tambah modul mingguan.',
  path: '/admin/modul/baru',
  noindex: true,
})

/** Suggests the week after the last one, released the Monday after it. */
export default async function AdminModulBaruPage() {
  await requireProfile('/admin/modul/baru', ['admin'])
  const db = await createSupabaseServer()
  const [modules, { data: tentors }] = await Promise.all([
    getModules(),
    db.from('profiles').select('id, nama, npm').eq('role', 'tentor').order('nama'),
  ])
  const last = modules[modules.length - 1]

  return (
    <>
      <Link href="/admin/modul" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading command="touch ~/modul/baru" title="Modul baru" />
      </div>
      <div className="mt-8 max-w-3xl">
        <ModulForm
          tentors={tentors ?? []}
          initial={{
            minggu: last ? last.minggu + 1 : 1,
            rilis: last ? addDays(last.rilis, 7) : undefined,
          }}
        />
      </div>
    </>
  )
}
