import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { MeterBar } from '@/components/ui/MeterBar'
import { requireProfile } from '@/lib/auth/session'
import { formatTanggalWaktu } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getGradableModules } from '@/lib/tugas/grading'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Penilaian',
  description: 'Penilaian tugas guided.',
  path: '/penilaian',
  noindex: true,
})

export default async function PenilaianPage() {
  const profile = await requireProfile('/penilaian', ['tentor', 'admin'])
  const db = await createSupabaseServer()
  const [modules, { count: members }] = await Promise.all([
    getGradableModules(profile),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'anggota'),
  ])
  const waiting = modules.reduce((total, modul) => total + modul.masuk - modul.dinilai, 0)

  return (
    <>
      <AdminHeading
        command="grep -r TODO ~/tugas"
        title="Penilaian"
        description={
          profile.role === 'admin'
            ? `Sebagai admin kamu bisa menilai semua modul. ${waiting} tugas menunggu nilai.`
            : `Modul yang ditugaskan kepadamu. ${waiting} tugas menunggu nilai.`
        }
      />

      {modules.length === 0 ? (
        <EmptyState
          className="mt-10"
          command="ls ~/tugas"
          output="0 modul"
          title="Belum ada modul untukmu"
          description="Admin menugaskan tentor ke modul di panel admin → modul. Minta admin menambahkan namamu di modul yang kamu pegang."
        />
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((modul) => {
            const pending = modul.masuk - modul.dinilai
            return (
              <li key={modul.id}>
                <Link href={`/penilaian/${modul.id}`} className="block h-full border-2 border-line bg-surface p-5 press-in hard-shadow">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[11px] tracking-[0.12em] text-accent-fg">M{pad2(modul.minggu)}</span>
                    <span className={pending > 0 ? 'text-[11px] text-accent-fg' : 'text-[11px] text-dim'}>
                      {pending > 0 ? `${pending} menunggu nilai` : modul.masuk > 0 ? 'semua dinilai' : 'belum ada tugas'}
                    </span>
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-fg">{modul.judul}</span>
                    {profile.role === 'admin' && modul.pjKamu ? (
                      <Badge size="sm" variant="solid">
                        pj kamu
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-[11px] text-dim">tenggat {formatTanggalWaktu(modul.deadline)}</span>
                  <span className="mt-4 block">
                    <MeterBar value={modul.dinilai} max={Math.max(members ?? 0, 1)} label={`${modul.dinilai} dari ${members ?? 0} dinilai`} striped />
                  </span>
                  <span className="mt-2 block text-[11px] text-muted tabular-nums">
                    {modul.masuk}/{members ?? 0} masuk · {modul.dinilai} dinilai · {modul.terlambat} terlambat
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
