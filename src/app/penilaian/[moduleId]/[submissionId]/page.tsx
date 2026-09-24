import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { GradeForm, ReopenForm } from '@/components/penilaian/GradeForms'
import { DownloadButton } from '@/components/sections/tugas/DownloadButton'
import { Badge } from '@/components/ui/Badge'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { formatBytes, formatTanggalWaktu, toWib } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { getRoster, getSubmissionForGrading } from '@/lib/tugas/grading'

export const metadata: Metadata = pageMetadata({
  title: 'Nilai tugas',
  description: 'Menilai satu tugas guided.',
  path: '/penilaian',
  noindex: true,
})

const isC = (path: string): boolean => /\.(c|h)$/i.test(path)

export default async function NilaiTugasPage({ params }: { params: Promise<{ moduleId: string; submissionId: string }> }) {
  const { moduleId, submissionId } = await params
  await requireProfile(`/penilaian/${moduleId}/${submissionId}`, ['tentor', 'admin'])

  const [view, roster] = await Promise.all([getSubmissionForGrading(submissionId), getRoster(moduleId)])
  if (!view || view.moduleId !== moduleId) notFound()

  // The next submission still waiting for a grade, in roster order.
  const waiting = (roster ?? []).flatMap((row) =>
    row.submission && row.submission.nilai === null && row.submission.id !== submissionId ? [row.submission.id] : [],
  )
  const next = waiting[0]

  return (
    <>
      <Link href={`/penilaian/${moduleId}`} className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading
          command={`cat ${view.fileName}`}
          title={view.student.nama}
          description={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{view.student.npm}</span>
              <span className="text-dim">·</span>
              <span>dikumpulkan {formatTanggalWaktu(toWib(view.submittedAt))}</span>
              {view.terlambat ? (
                <Badge size="sm" variant="outline" accent="orange">
                  terlambat
                </Badge>
              ) : null}
            </span>
          }
          actions={
            next ? (
              <Link href={`/penilaian/${moduleId}/${next}`} className="text-xs text-accent-fg underline underline-offset-4">
                tugas berikutnya <span aria-hidden>-&gt;</span>
              </Link>
            ) : null
          }
        />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="flex flex-wrap items-center gap-3 text-[12px] text-dim">
            <span className="text-fg">{view.fileName}</span>
            <span>{formatBytes(view.fileSize)}</span>
            <DownloadButton submissionId={view.id} fileName={view.fileName} />
          </p>

          {view.content.kind === 'c' ? (
            <CodeBlock code={view.content.code} filename={view.fileName} />
          ) : view.content.kind === 'zip' ? (
            view.content.entries.map((entry) =>
              entry.text !== undefined && isC(entry.path) ? (
                <CodeBlock key={entry.path} code={entry.text} filename={entry.path} />
              ) : entry.text !== undefined ? (
                <TerminalWindow key={entry.path} title={entry.path} tone="code" shadow={false} bodyClassName="p-0">
                  <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-6 text-fg" tabIndex={0}>
                    {entry.text}
                  </pre>
                </TerminalWindow>
              ) : (
                <p key={entry.path} className="border-2 border-line-soft px-4 py-2.5 text-[12px] text-muted">
                  {entry.path} <span className="text-dim">· {formatBytes(entry.size)}{entry.note ? ` · ${entry.note}` : ''}</span>
                </p>
              ),
            )
          ) : (
            <p className="text-sm text-fg">
              <span className="text-accent-fg">error:</span> berkas tidak ditemukan di penyimpanan.
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-24">
          <TerminalWindow title="~/penilaian/nilai" shadow={false}>
            {view.nilai !== null && view.penilai ? (
              <p className="mb-5 text-[12px] text-dim">
                dinilai oleh <span className="text-fg">{view.penilai}</span>
              </p>
            ) : null}
            <GradeForm id={view.id} nilai={view.nilai} komentar={view.komentar} />
          </TerminalWindow>
          {view.nilai !== null ? (
            <TerminalWindow title="~/penilaian/buka-kembali" tone="canvas" shadow={false} accent="orange">
              <ReopenForm id={view.id} />
            </TerminalWindow>
          ) : null}
        </aside>
      </div>
    </>
  )
}
