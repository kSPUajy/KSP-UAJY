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
import { effectiveDeadline } from '@/lib/tugas/rules'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Penilaian modul',
  description: 'Daftar tugas guided per modul.',
  path: '/penilaian',
  noindex: true,
})

export default async function PenilaianModulPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  await requireProfile(`/penilaian/${moduleId}`, ['tentor', 'admin'])

  const [roster, modules] = await Promise.all([getRoster(moduleId), getModules()])
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
          description={`Tenggat ${formatTanggalWaktu(deadline)}. ${roster.length - missing.length} dari ${roster.length} anggota sudah mengumpulkan.`}
        />
      </div>

      <RosterGroup id="menunggu" title="menunggu nilai" rows={waiting} moduleId={moduleId} empty="Tidak ada yang menunggu. Semua tugas yang masuk sudah dinilai." />
      <RosterGroup id="dinilai" title="sudah dinilai" rows={graded} moduleId={moduleId} empty="Belum ada yang dinilai." />
      <RosterGroup
        id="belum"
        title="belum mengumpulkan"
        rows={missing}
        moduleId={moduleId}
        empty="Semua anggota sudah mengumpulkan."
      />
      {!deadlinePassed(deadline) && missing.length > 0 ? (
        <p className="mt-3 text-[11px] text-dim">Tenggat belum lewat — mereka masih bisa mengumpulkan tepat waktu.</p>
      ) : null}
    </>
  )
}
