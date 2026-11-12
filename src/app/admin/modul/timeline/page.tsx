import type { Metadata } from 'next'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { TimelineGeser } from '@/components/admin/modul/TimelineGeser'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { requireProfile } from '@/lib/auth/session'
import { getTimeline } from '@/lib/data'
import { formatTanggalPendek } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Timeline — Admin',
  description: 'Atur urutan modul dan sesi.',
  path: '/admin/modul/timeline',
  noindex: true,
})

export default async function AdminTimelinePage() {
  await requireProfile('/admin/modul/timeline', ['admin'])
  const timeline = await getTimeline()

  return (
    <>
      <AdminHeading
        command="ls ~/modul --timeline"
        title="Timeline"
        description="Panah naik atau turun menukar minggu kelas dengan baris di sebelahnya. Modul membawa challenge dan tenggat tugas guided-nya ikut pindah, dan status terlambat dihitung ulang. Dua modul tidak bisa ditukar; untuk mengganti tanggal satu per satu, buka form modul atau sesinya."
        actions={
          <ButtonLink href="/admin/modul" size="sm" variant="outline">
            kembali
          </ButtonLink>
        }
      />

      <ol className="mt-8 max-w-4xl border-t-2 border-line">
        {timeline.map((entry, index) => (
          <li
            key={entry.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b-2 border-line px-3 py-3 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto]"
          >
            <span className="col-span-full text-[11px] text-dim tabular-nums sm:col-span-1">kelas {formatTanggalPendek(entry.mulai)}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-fg">
                {entry.jenis === 'modul' ? <span className="font-display text-[11px] tracking-[0.12em] text-accent-fg">M{pad2(entry.minggu)} </span> : null}
                {entry.judul}
                {entry.status === 'berjalan' ? (
                  <Badge size="sm" variant="solid" className="ml-2 align-middle">
                    minggu ini
                  </Badge>
                ) : null}
              </span>
              <span className="block truncate text-[11px] text-dim">
                {entry.jenis === 'modul' ? entry.tentorPj.join(', ') || 'tentor belum diisi' : `sesi · pj ${entry.pj || '—'}`}
              </span>
            </span>
            <TimelineGeser id={entry.id} judul={entry.judul} pertama={index === 0} terakhir={index === timeline.length - 1} />
          </li>
        ))}
      </ol>
    </>
  )
}
