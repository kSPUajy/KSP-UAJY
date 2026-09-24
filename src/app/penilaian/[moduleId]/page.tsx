import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { DownloadButton } from '@/components/sections/tugas/DownloadButton'
import { Badge } from '@/components/ui/Badge'
import { requireProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { formatTanggalWaktu, toWib } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { deadlinePassed, getRoster } from '@/lib/tugas/grading'
import type { RosterRow } from '@/lib/tugas/grading'
import { effectiveDeadline } from '@/lib/tugas/rules'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Penilaian modul',
  description: 'Daftar tugas guided per modul.',
  path: '/penilaian',
  noindex: true,
})

function Group({ id, title, rows, moduleId, empty }: { id: string; title: string; rows: RosterRow[]; moduleId: string; empty: string }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-[11px] tracking-[0.12em] text-dim uppercase">
        {`// ${title} (${rows.length})`}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-[12px] text-dim">{empty}</p>
      ) : (
        <ul className="mt-3 border-t-2 border-line">
          {rows.map((row) => (
            <li
              key={row.profileId}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b-2 border-line px-3 py-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto_auto_auto]"
            >
              <span className="text-[12px] text-muted tabular-nums">{row.npm}</span>
              <span className="col-start-1 row-start-2 min-w-0 truncate text-sm font-bold text-fg sm:col-start-auto sm:row-start-auto">{row.nama}</span>
              {row.submission ? (
                <>
                  <span className="hidden text-[11px] text-dim sm:inline">{formatTanggalWaktu(toWib(row.submission.submittedAt))}</span>
                  <span className="flex items-center gap-2">
                    {row.submission.terlambat ? (
                      <Badge size="sm" variant="outline" accent="orange">
                        terlambat
                      </Badge>
                    ) : null}
                    {row.submission.nilai !== null ? (
                      <Badge size="sm" variant="solid">
                        {row.submission.nilai}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-3 text-[12px]">
                    <DownloadButton submissionId={row.submission.id} fileName={row.submission.fileName} />
                    <Link href={`/penilaian/${moduleId}/${row.submission.id}`} className="font-bold text-accent-fg hover:underline">
                      {row.submission.nilai === null ? 'nilai' : 'lihat'} <span aria-hidden>-&gt;</span>
                    </Link>
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-dim sm:col-span-3">belum mengumpulkan</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

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

      <Group id="menunggu" title="menunggu nilai" rows={waiting} moduleId={moduleId} empty="Tidak ada yang menunggu. Semua tugas yang masuk sudah dinilai." />
      <Group id="dinilai" title="sudah dinilai" rows={graded} moduleId={moduleId} empty="Belum ada yang dinilai." />
      <Group
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
