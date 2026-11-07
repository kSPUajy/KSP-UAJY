import { modulRelease } from '@/components/sections/modul/modul-format'
import { ModulFiles } from '@/components/sections/modul/ModulFiles'
import { DownloadButton } from '@/components/sections/tugas/DownloadButton'
import { TugasUploader } from '@/components/sections/tugas/TugasUploader'
import { Badge } from '@/components/ui/Badge'
import type { AccentName } from '@/lib/accent'
import { formatBytes, formatTanggalWaktu, namaHari, toWib } from '@/lib/format'
import type { Submission } from '@/lib/tugas/data'
import type { JenisTugas } from '@/lib/tugas/rules'
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

const LABEL_CLASS = 'font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase'

/**
 * One week's tasks: the guided task (what to do, when it is due), then the
 * unguided one when the module has it. Each shows what was handed in, the
 * grade once there is one, and the uploader while handing in is open.
 */
export function TugasPanel({ item }: { item: TugasItem }) {
  const { modul, deadline, state, submission, unguided } = item
  const unguidedOpen = modul.tugasUnguided?.terbuka === true

  if (state === 'terkunci') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[12px] leading-6 text-dim">
          Pengumpulan tugas minggu ini dibuka bersama modulnya, {modulRelease(modul)} pukul 00.00 WIB.
        </p>
        <ModulFiles modul={modul} label="berkas" emptyText="" className="text-[12px] leading-6" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <ModulFiles modul={modul} label="berkas" emptyText="" className="mb-3 text-[12px] leading-6" />
        <p className={LABEL_CLASS}>{'// tugas guided'}</p>
        <p className="mt-2 max-w-prose text-sm leading-7 text-muted">
          {modul.tugasDeskripsi ||
            'Kerjakan latihan terpandu di modul minggu ini, lalu kumpulkan hasilnya di sini: kodenya langsung, atau beberapa berkas yang dijadikan satu arsip.'}
        </p>
        <p className="mt-2 text-[12px] leading-6 text-dim">
          tenggat: <span className="text-fg">{wibLabel(deadline)}</span>
          {state === 'lewat' ? ' — sudah lewat, tapi tugas masih diterima dan ditandai terlambat.' : ''}
        </p>
      </div>

      <HandIn submission={submission} moduleId={modul.id} jenis="guided" open />

      {modul.tugasUnguided || unguided ? (
        <div className="flex flex-col gap-5 border-t-2 border-line-soft pt-5">
          <div>
            <p className={LABEL_CLASS}>{'// tugas unguided'}</p>
            <p className="mt-2 max-w-prose text-[12px] leading-6 text-dim">
              {unguidedOpen
                ? 'Pengumpulan dibuka sampai tentor menutupnya. Tidak ada tenggat dan tanda terlambat.'
                : unguided
                  ? 'Pengumpulan sudah ditutup.'
                  : 'Pengumpulan dibuka bersama berkas tugas unguided, saat tentor membukanya.'}
            </p>
          </div>
          <HandIn submission={unguided} moduleId={modul.id} jenis="unguided" open={unguidedOpen} />
        </div>
      ) : null}
    </div>
  )
}

/** What was handed in for one task, then its grade, or the uploader while the task is open. */
function HandIn({
  submission,
  moduleId,
  jenis,
  open,
}: {
  submission: Submission | null
  moduleId: string
  jenis: JenisTugas
  open: boolean
}) {
  return (
    <>
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
      ) : open ? (
        <TugasUploader moduleId={moduleId} jenis={jenis} replacing={submission !== null} />
      ) : null}
    </>
  )
}
