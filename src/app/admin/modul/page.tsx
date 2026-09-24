import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { requireProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { formatTanggalPendek } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Modul — Admin',
  description: 'Kelola modul mingguan.',
  path: '/admin/modul',
  noindex: true,
})

export default async function AdminModulPage() {
  await requireProfile('/admin/modul', ['admin'])
  const db = await createSupabaseServer()
  const [modules, { data: submissions }, { count: members }] = await Promise.all([
    getModules(),
    db.from('submissions').select('module_id, nilai'),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'anggota'),
  ])

  const perModule = new Map<string, { total: number; graded: number }>()
  for (const row of submissions ?? []) {
    const entry = perModule.get(row.module_id) ?? { total: 0, graded: 0 }
    entry.total += 1
    if (row.nilai !== null) entry.graded += 1
    perModule.set(row.module_id, entry)
  }

  return (
    <>
      <AdminHeading
        command="ls -l ~/modul"
        title="Modul"
        description="Urutan dan status mengikuti tanggal rilis. Perubahan langsung tampil di /modul, hero beranda, dan dashboard anggota."
        actions={
          <ButtonLink href="/admin/modul/baru" size="sm">
            modul baru
          </ButtonLink>
        }
      />

      <ol className="mt-8 border-t-2 border-line">
        {modules.map((modul) => {
          const counts = perModule.get(modul.id) ?? { total: 0, graded: 0 }
          return (
            <li key={modul.id} className="border-b-2 border-line">
              <Link
                href={`/admin/modul/${modul.id}`}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 px-3 py-3.5 transition-colors hover:bg-surface-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_auto]"
              >
                <span className="font-display text-[11px] tracking-[0.12em] text-accent-fg">M{pad2(modul.minggu)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-fg">{modul.judul}</span>
                  <span className="block truncate text-[11px] text-dim">
                    {modul.tentorPj.join(', ') || 'tentor belum diisi'} · {modul.koordinator || '—'}
                  </span>
                </span>
                <span className="col-start-2 text-[11px] text-dim sm:col-start-auto">rilis {formatTanggalPendek(modul.rilis)}</span>
                <span className="col-start-2 text-[11px] text-muted tabular-nums sm:col-start-auto">
                  {modul.status === 'terkunci' ? '—' : `${counts.total}/${members ?? 0} tugas · ${counts.graded} dinilai`}
                </span>
                <span className="col-start-2 sm:col-start-auto">
                  <Badge size="sm" variant={modul.status === 'berjalan' ? 'solid' : 'ghost'}>
                    {modul.status === 'berjalan' ? 'minggu ini' : modul.status}
                  </Badge>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </>
  )
}
