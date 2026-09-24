import { modulRelease } from '@/components/sections/modul/modul-format'
import { DownloadButton } from '@/components/sections/tugas/DownloadButton'
import { TugasUploader } from '@/components/sections/tugas/TugasUploader'
import { Badge } from '@/components/ui/Badge'
import type { AccentName } from '@/lib/accent'
import { formatBytes, formatTanggalWaktu, namaHari, toWib } from '@/lib/format'
import { STATE_LABEL } from '@/lib/tugas/status'
import type { TugasItem, TugasState } from '@/lib/tugas/status'

/** Late work reads orange everywhere; everything else keeps the section's accent. */
const STATE_ACCENT: Partial<Record<TugasState, AccentName>> = { terlambat: 'orange', lewat: 'orange' }

export function StateBadge({ state }: { state: TugasState }) {
  const variant = state === 'dinilai' ? 'solid' : state === 'terkumpul' || state === 'terlambat' ? 'outline' : 'ghost'
  return (
    <Badge variant={variant} size="sm" accent={STATE_ACCENT[state]}>
      {STATE_LABEL[state]}
    </Badge>
  )
}

const wibLabel = (wall: string): string => `${namaHari(wall)}, ${formatTanggalWaktu(wall)}`

/**
 * One week's task: what to do, when it is due, what was handed in, the
 * grade once there is one, and the uploader while handing in is still open.
 */
export function TugasPanel({ item }: { item: TugasItem }) {
  const { modul, deadline, state, submission } = item

  if (state === 'terkunci') {
    return (
      <p className="text-[12px] leading-6 text-dim">
        Tugas minggu ini dibuka bersama modulnya, {modulRelease(modul)}.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="max-w-prose text-sm leading-7 text-muted">
          {modul.tugasDeskripsi ||
            'Kerjakan latihan terpandu di modul minggu ini, lalu kumpulkan kodemu di sini — satu berkas .c, atau satu folder berisi beberapa berkas yang di-zip.'}
        </p>
        <p className="mt-2 text-[12px] leading-6 text-dim">
          tenggat: <span className="text-fg">{wibLabel(deadline)}</span>
          {state === 'lewat' ? ' — sudah lewat, tapi tugas masih diterima dan ditandai terlambat.' : ''}
        </p>
      </div>

      {submission ? (
        <div className="border-2 border-line-soft bg-code-bg px-4 py-3 text-[12px] leading-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-bold break-all text-fg">{submission.fileName}</span>
            <span className="text-dim">{formatBytes(submission.fileSize)}</span>
            {submission.terlambat ? (
              <Badge variant="outline" size="sm" accent="orange">
                terlambat
              </Badge>
            ) : null}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-3 text-dim">
            <span>dikumpulkan {wibLabel(toWib(submission.submittedAt))}</span>
            <DownloadButton submissionId={submission.id} fileName={submission.fileName} />
          </p>
        </div>
      ) : null}

      {submission?.nilai != null ? (
        <div className="border-l-4 border-accent pl-4">
          <p className="flex items-baseline gap-3">
            <span className="font-display text-3xl leading-none text-accent-fg tabular-nums">{submission.nilai}</span>
            <span className="text-[11px] tracking-[0.1em] text-dim uppercase">/ 100</span>
            {submission.penilai ? <span className="text-[11px] text-dim">dinilai {submission.penilai}</span> : null}
          </p>
          {submission.komentar ? (
            <p className="mt-3 max-w-prose text-sm leading-7 whitespace-pre-line text-fg">
              <span aria-hidden className="text-syn-comment">
                {'// '}
              </span>
              {submission.komentar}
            </p>
          ) : null}
        </div>
      ) : (
        <TugasUploader moduleId={modul.id} replacing={submission !== null} />
      )}
    </div>
  )
}
