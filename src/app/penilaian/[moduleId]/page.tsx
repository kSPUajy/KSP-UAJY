import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { RosterGroup } from '@/components/penilaian/RosterGroup'
import { requireProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { formatTanggalWaktu } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { deadlinePassed, getRoster } from '@/lib/tugas/grading'
import { effectiveDeadline, isJenis } from '@/lib/tugas/rules'
import { cn, pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Penilaian modul',
  description: 'Daftar tugas guided dan unguided per modul.',
  path: '/penilaian',
  noindex: true,
})

export default async function PenilaianModulPage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>
  searchParams: Promise<{ jenis?: string | string[] }>
}) {
  const { moduleId } = await params
  const requested = (await searchParams).jenis
  const jenis = isJenis(requested) ? requested : 'guided'
  await requireProfile(`/penilaian/${moduleId}`, ['tentor', 'admin'])

  const [roster, modules] = await Promise.all([getRoster(moduleId, jenis), getModules()])
  const modul = modules.find((item) => item.id === moduleId)
  if (!roster || !modul) notFound()

  const deadline = effectiveDeadline(modul)
  const waiting = roster.filter((row) => row.submission && row.submission.nilai === null)
  const graded = roster.filter((row) => row.submission && row.submission.nilai !== null)
  const missing = roster.filter((row) => !row.submission)

  return (
    <>
      <Link href="/penilaian" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading
          command={`ls ~/tugas/minggu-${pad2(modul.minggu)}`}
          title={`M${pad2(modul.minggu)} · ${modul.judul}`}
          description={`${
            jenis === 'guided'
              ? `Tenggat ${formatTanggalWaktu(deadline)}.`
              : `Tugas unguided, tanpa tenggat. Pengumpulan sedang ${modul.tugasUnguided?.terbuka ? 'dibuka' : 'ditutup'}.`
          } ${roster.length - missing.length} dari ${roster.length} anggota sudah mengumpulkan.`}
        />
      </div>

      <nav aria-label="Jenis tugas" className="mt-6 flex flex-wrap gap-2 text-[12px]">
        {(['guided', 'unguided'] as const).map((item) => (
          <Link
            key={item}
            href={item === 'guided' ? `/penilaian/${moduleId}` : `/penilaian/${moduleId}?jenis=unguided`}
            aria-current={item === jenis ? 'page' : undefined}
            className={cn(
              'border-2 px-3 py-1.5',
              item === jenis ? 'border-accent-fg font-bold text-accent-fg' : 'border-line-soft text-muted hover:text-fg',
            )}
          >
            tugas {item}
          </Link>
        ))}
      </nav>

      <RosterGroup id="menunggu" title="menunggu nilai" rows={waiting} moduleId={moduleId} empty="Tidak ada yang menunggu. Semua tugas yang masuk sudah dinilai." />
      <RosterGroup id="dinilai" title="sudah dinilai" rows={graded} moduleId={moduleId} empty="Belum ada yang dinilai." />
      <RosterGroup
        id="belum"
        title="belum mengumpulkan"
        rows={missing}
        moduleId={moduleId}
        empty="Semua anggota sudah mengumpulkan."
      />
      {jenis === 'guided' && !deadlinePassed(deadline) && missing.length > 0 ? (
        <p className="mt-3 text-[11px] text-dim">Tenggat belum lewat — mereka masih bisa mengumpulkan tepat waktu.</p>
      ) : null}
    </>
  )
}
