import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { DeleteSesiForm, SesiForm } from '@/components/admin/modul/SesiForms'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { requireProfile } from '@/lib/auth/session'
import { getModules, getSesi } from '@/lib/data'
import { formatTanggal, formatTanggalPendek } from '@/lib/format'
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
  const [modules, sessions, { data: submissions }, { count: members }] = await Promise.all([
    getModules(),
    getSesi(),
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
            // The whole row opens the module (its title link is stretched over
            // it); the count is its own link, to the names behind the number.
            <li
              key={modul.id}
              className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b-2 border-line px-3 py-3.5 transition-colors hover:bg-surface-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_7rem_11rem_auto]"
            >
              <span className="font-display text-[11px] tracking-[0.12em] text-accent-fg">M{pad2(modul.minggu)}</span>
              <span className="min-w-0">
                <Link href={`/admin/modul/${modul.id}`} className="block truncate text-sm font-bold text-fg after:absolute after:inset-0">
                  {modul.judul}
                </Link>
                <span className="block truncate text-[11px] text-dim">
                  {modul.tentorPj.join(', ') || 'tentor belum diisi'} · {modul.koordinator || '—'}
                  {modul.tugasUnguided ? ` · unguided ${modul.tugasUnguided.terbuka ? 'dibuka' : 'terkunci'}` : ''}
                </span>
              </span>
              <span className="col-start-2 text-[11px] text-dim sm:col-start-auto">rilis {formatTanggalPendek(modul.rilis)}</span>
              <span className="col-start-2 text-[11px] text-muted tabular-nums sm:col-start-auto">
                {modul.status === 'terkunci' ? (
                  '—'
                ) : (
                  <Link
                    href={`/penilaian/${modul.id}`}
                    title="Lihat siapa saja yang sudah mengumpulkan"
                    className="relative z-10 underline decoration-accent-fg decoration-2 underline-offset-4 hover:text-fg"
                  >
                    {counts.total}/{members ?? 0} mengumpulkan <span aria-hidden>-&gt;</span>
                    <span className="sr-only"> — lihat siapa saja</span>
                  </Link>
                )}
                {modul.status !== 'terkunci' && counts.graded > 0 ? <span className="block text-dim">{counts.graded} dinilai</span> : null}
              </span>
              <span className="col-start-2 sm:col-start-auto">
                <Badge size="sm" variant={modul.status === 'berjalan' ? 'solid' : 'ghost'}>
                  {modul.status === 'berjalan' ? 'minggu ini' : modul.status}
                </Badge>
              </span>
            </li>
          )
        })}
      </ol>

      <section aria-labelledby="sesi-tanpa-modul" className="mt-14 max-w-4xl">
        <h2 id="sesi-tanpa-modul" className="font-display text-[11px] tracking-[0.16em] text-accent-fg uppercase">
          {'// sesi tanpa modul'}
        </h2>
        <p className="mt-3 max-w-prose text-[13px] leading-6 text-muted">
          Games, Review Materi, dan sesi lain yang tampil di timeline tanpa berkas, tugas guided, atau penilaian.
        </p>
        <ul className="mt-6 border-t-2 border-line">
          {sessions.map((item) => (
            <li key={item.id} className="border-b-2 border-line">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 px-3 py-3.5 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-bold text-fg">{item.judul}</span>
                  <span className="text-[11px] text-dim">mulai {formatTanggal(item.rilis)}</span>
                  <span className="text-[11px] text-dim">pj {item.pj || '—'}</span>
                </summary>
                <div className="flex flex-col gap-6 border-t-2 border-line-soft bg-surface px-3 py-5 sm:px-6">
                  <SesiForm sesi={item} />
                  <DeleteSesiForm id={item.id} />
                </div>
              </details>
            </li>
          ))}
        </ul>
        <div className="mt-8 border-2 border-line-soft p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-bold text-fg">Tambah sesi</h3>
          <SesiForm />
        </div>
      </section>
    </>
  )
}
