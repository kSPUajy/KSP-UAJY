import { Reveal } from '@/components/motion/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

type TrackStatus = 'berjalan' | 'genap' | 'segera'

type Track = {
  id: string
  nama: string
  deskripsi: string
  status: TrackStatus
  accent: AccentName
  /** One line that says what the field is about, not a claim about the syllabus. */
  cuplikan: string
}

/** What KSP teaches. C runs now; the rest open later — no dates promised here. */
const TRACKS: readonly Track[] = [
  {
    id: 'c',
    nama: 'Bahasa C',
    deskripsi: 'Dasar pemrograman untuk mahasiswa semester 1, dari flowchart sampai array of record.',
    status: 'berjalan',
    accent: 'lime',
    cuplikan: 'printf("Hello, KSP!\\n");',
  },
  {
    id: 'ml',
    nama: 'Machine Learning',
    deskripsi: 'Mengajari komputer belajar dari data untuk menebak, mengelompokkan, dan mengenali pola.',
    status: 'genap',
    accent: 'cyan',
    cuplikan: 'model.fit(data, label)',
  },
  {
    id: 'java',
    nama: 'Java',
    deskripsi: 'Pemrograman berorientasi objek dengan salah satu bahasa yang paling banyak dipakai di industri.',
    status: 'genap',
    accent: 'orange',
    cuplikan: 'System.out.println("Hello, KSP!");',
  },
  {
    id: 'blockchain',
    nama: 'Blockchain',
    deskripsi: 'Teknologi di balik aset kripto: catatan data yang tersambung dan sulit dipalsukan.',
    status: 'segera',
    accent: 'violet',
    cuplikan: 'block.hash = sha256(prev + data)',
  },
]

const STATUS: Record<TrackStatus, { label: string; dot: string }> = {
  berjalan: { label: 'sedang berjalan', dot: 'rec-blink bg-[#3ddc5b]' },
  genap: { label: 'buka semester genap', dot: 'bg-[#ffb020]' },
  segera: { label: 'segera dibuka', dot: 'border border-dim' },
}

/**
 * Everything KSP teaches, side by side: C now, Machine Learning and Java in
 * the even semester, Blockchain soon. Four cards in a row rather than the
 * text-and-box split, each with a status lamp and one line of the field's
 * flavour. Cards that are not open yet are drawn quieter.
 */
export function TracksSection({ index }: { index: number }) {
  return (
    <SectionShell accent="lime" tone="alt" labelledBy="kelas-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="kelas"
          title="Bukan cuma C"
          headingId="kelas-title"
          description="Semester ini KSP membuka kelas bahasa C. Setelahnya, ada jalur lain yang bisa kamu ikuti."
        />
      </Reveal>

      <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
        {TRACKS.map((track, position) => {
          const open = track.status === 'berjalan'
          const status = STATUS[track.status]
          return (
            <li key={track.id}>
              <Reveal delay={position * 0.06} className="h-full">
                <div
                  data-accent={track.accent}
                  className={cn(
                    'flex h-full flex-col border-2 bg-surface',
                    open ? 'border-line hard-shadow' : 'border-line-soft',
                    track.status === 'segera' && 'border-dashed',
                  )}
                >
                  {/* Status bar, like a tab showing whether the process is up. */}
                  <div
                    className={cn(
                      'flex items-center gap-2 border-b-2 px-4 py-2.5',
                      open ? 'border-line' : 'border-line-soft',
                    )}
                  >
                    <span aria-hidden className={cn('inline-block h-2 w-2 shrink-0', status.dot)} />
                    <span className="text-[11px] tracking-[0.08em] text-muted uppercase">{status.label}</span>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3
                      className={cn(
                        'font-display text-sm tracking-[0.08em] uppercase',
                        open ? 'text-accent-fg' : 'text-fg',
                      )}
                    >
                      {track.nama}
                    </h3>
                    <p className="mt-3 flex-1 text-[13px] leading-6 text-muted">{track.deskripsi}</p>
                    <code
                      aria-hidden
                      className={cn(
                        'mt-5 block truncate border-l-2 bg-code-bg px-3 py-2 font-mono text-[12px]',
                        open ? 'border-accent text-fg' : 'border-line-soft text-dim',
                      )}
                    >
                      {track.cuplikan}
                    </code>
                  </div>
                </div>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </SectionShell>
  )
}
