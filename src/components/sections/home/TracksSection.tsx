import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

type TrackStatus = 'berjalan' | 'genap' | 'segera'

type Track = {
  id: string
  /** Big pixel lettering on the cartridge label. */
  label: string
  nama: string
  deskripsi: string
  status: TrackStatus
  accent: AccentName
}

/** What KSP teaches. C runs now; the rest open later — no dates promised here. */
const TRACKS: readonly Track[] = [
  {
    id: 'c',
    label: 'C',
    nama: 'Bahasa C',
    deskripsi: 'Dasar pemrograman untuk mahasiswa semester 1, dari flowchart sampai array of record.',
    status: 'berjalan',
    accent: 'lime',
  },
  {
    id: 'ml',
    label: 'ML',
    nama: 'Machine Learning',
    deskripsi: 'Mengajari komputer belajar dari data untuk menebak, mengelompokkan, dan mengenali pola.',
    status: 'genap',
    accent: 'cyan',
  },
  {
    id: 'java',
    label: 'JAVA',
    nama: 'Java',
    deskripsi: 'Pemrograman berorientasi objek dengan salah satu bahasa yang paling banyak dipakai di industri.',
    status: 'genap',
    accent: 'orange',
  },
  {
    id: 'blockchain',
    label: '???',
    nama: 'Blockchain',
    deskripsi: 'Teknologi di balik aset kripto: catatan data yang tersambung dan sulit dipalsukan.',
    status: 'segera',
    accent: 'violet',
  },
]

/** The cartridge silhouette: top corners cut like a game cart. */
const CART_SHAPE = 'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%, 0 14px)'

function Padlock() {
  return (
    <svg aria-hidden viewBox="0 0 12 14" className="lock-shake h-4 w-3.5" shapeRendering="crispEdges">
      <path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="1" y="6" width="10" height="8" fill="currentColor" />
      <rect x="5" y="9" width="2" height="2" className="fill-surface" />
    </svg>
  )
}

function Cartridge({ track, level }: { track: Track; level: number }) {
  const playable = track.status === 'berjalan'
  const locked = track.status === 'genap'

  const body = (
    <div
      data-accent={track.accent}
      style={{ clipPath: CART_SHAPE }}
      className="relative flex h-full flex-col border-2 border-line bg-surface"
    >
      {/* Top rim, where the cartridge would slide into the console. */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] tracking-[0.14em] text-dim uppercase">
        <span>ksp</span>
        <span className="tabular-nums">lvl {String(level).padStart(2, '0')}</span>
      </div>

      {/* The label: accent art with huge pixel lettering. Locked labels are
          greyed out and only flash their colour when hovered. */}
      <div
        className={cn(
          'relative mx-3 flex aspect-[4/3] items-center justify-center overflow-hidden border-2 border-line bg-accent transition-[filter] duration-300',
          !playable && 'grayscale group-hover:grayscale-0',
          track.status === 'segera' && 'brightness-75',
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 opacity-25 [background:repeating-linear-gradient(135deg,var(--accent-ink)_0_2px,transparent_2px_10px)]"
        />
        <span
          aria-hidden
          className={cn(
            'relative font-display leading-none text-accent-ink',
            track.label.length <= 2 ? 'text-[clamp(3.5rem,8vw,5.5rem)]' : 'text-[clamp(2rem,4.2vw,3rem)]',
          )}
        >
          {track.label}
        </span>
        {locked ? (
          <span className="absolute top-2 right-2 flex items-center gap-1.5 border-2 border-line bg-surface px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-fg uppercase">
            <Padlock />
            terkunci
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-3">
        <h3 className="font-display text-sm tracking-[0.08em] text-fg uppercase">{track.nama}</h3>
        <p className="mt-2 flex-1 text-[13px] leading-6 text-muted">{track.deskripsi}</p>
        <p className="mt-4 text-[11px] font-bold tracking-[0.12em] uppercase">
          {playable ? (
            <span className="text-accent-fg">
              <span className="cursor-blink inline-block">▶</span> press start
            </span>
          ) : locked ? (
            <span className="text-muted">buka semester genap</span>
          ) : (
            <span className="text-dim">segera dibuka</span>
          )}
        </p>
      </div>

      {/* Contact pins along the bottom edge. */}
      <span
        aria-hidden
        className="mx-5 mb-0 block h-3 border-x-2 border-t-2 border-line [background:repeating-linear-gradient(90deg,var(--line)_0_3px,transparent_3px_9px)]"
      />
    </div>
  )

  // Picked up off the shelf on hover. The drop shadow follows the cut shape,
  // which a box-shadow would not.
  const lift =
    'group block h-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [filter:drop-shadow(5px_5px_0_var(--line))] hover:-translate-y-2 hover:-rotate-1 motion-reduce:transition-none motion-reduce:hover:transform-none'

  return playable ? (
    <Link href="/modul" aria-label={`${track.nama} — sedang berjalan, lihat jadwal modul`} className={lift}>
      {body}
    </Link>
  ) : (
    <div className={lift}>{body}</div>
  )
}

/**
 * Everything KSP teaches, as a level select: each track a game cartridge.
 * C is level one and ready to play; Machine Learning and Java are locked
 * until the even semester (hover to peek at their colours, and watch the
 * padlock refuse); Blockchain is still a mystery cart.
 */
export function TracksSection({ index }: { index: number }) {
  return (
    <SectionShell accent="lime" tone="alt" dots labelledBy="kelas-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="kelas"
          title="Bukan cuma C"
          headingId="kelas-title"
          description="Semester ini KSP membuka kelas bahasa C. Setelahnya, level berikutnya terbuka satu per satu."
        />
      </Reveal>

      <p className="mt-10 font-display text-[11px] tracking-[0.2em] text-accent-fg uppercase sm:mt-12">
        <span aria-hidden className="cursor-blink mr-2 inline-block">▸</span>pilih level
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {TRACKS.map((track, position) => (
          <li key={track.id}>
            <Reveal delay={position * 0.08} className="h-full">
              <Cartridge track={track} level={position + 1} />
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
