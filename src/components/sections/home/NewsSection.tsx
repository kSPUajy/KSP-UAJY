import { PaperToss } from '@/components/motion/PaperToss'
import { Reveal } from '@/components/motion/Reveal'
import { listNames, pendaftaranHref } from '@/components/sections/gabung/Registration'
import { NewsSheet } from '@/components/sections/home/NewsSheet'
import type { Brief } from '@/components/sections/home/NewsSheet'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { SectionShell } from '@/components/ui/SectionShell'
import { isChallengeClosed } from '@/lib/data'
import { formatTanggalPendek, formatTanggalWaktu, toWib } from '@/lib/format'
import { KATEGORI_BERITA } from '@/lib/types'
import type { ChallengeMeta, NewsPostMeta, Registration, TimelineEntry } from '@/lib/types'
import { cn, pad2 } from '@/lib/utils'

type NewsSectionProps = {
  index: number
  /** Newest first. */
  posts: readonly NewsPostMeta[]
  /** For the "Sekilas KSP" box: the class schedule, this week's challenge, the next one, registration. */
  schedule: readonly TimelineEntry[]
  current: ChallengeMeta | null
  nextChallenge: ChallengeMeta | null
  registration: Registration
}

/**
 * An older edition under today's, only its edges showing: the same paper,
 * a shade more worn, with the ghost of a masthead and ruled columns where
 * the page peeks out.
 */
function BackIssue({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      data-palette="light"
      className={cn('newsprint absolute inset-0 border-2 border-line bg-canvas-alt hard-shadow', className)}
    >
      <span className="absolute inset-x-6 top-5 h-2 bg-line/15" />
      <span className="absolute inset-x-[30%] top-10 h-5 bg-line/25 sm:h-8" />
      <span className="absolute inset-x-6 top-20 border-t-4 border-double border-line/25 sm:top-24" />
      <span className="absolute inset-x-6 top-24 bottom-6 bg-[repeating-linear-gradient(to_bottom,rgb(16_18_26/0.1)_0_1px,transparent_1px_12px)] sm:top-28" />
    </div>
  )
}

/**
 * The three things a member checks every week, read off live data the way a
 * paper prints the weather: the class, the challenge, registration. A
 * challenge that is not out yet shows its module and date, never its title.
 */
function briefs({
  schedule,
  current,
  nextChallenge,
  registration,
}: Omit<NewsSectionProps, 'index' | 'posts'>): Brief[] {
  const running = schedule.find((entry) => entry.status === 'berjalan')
  const upcoming = schedule.find((entry) => entry.status === 'terkunci')
  // A module is current from the Wednesday it opens, before its class.
  const kelas: Brief = running
    ? running.jenis === 'modul'
      ? {
          label: 'modul minggu ini',
          value: `M${pad2(running.minggu)} ${running.judul}`,
          note: `kelas Senin, ${formatTanggalPendek(running.mulai)}`,
          href: '/modul',
        }
      : {
          label: 'kelas minggu ini',
          value: running.judul,
          note: `sampai ${formatTanggalPendek(running.sampai)}`,
          href: '/modul',
        }
    : {
        label: 'kelas',
        value: 'sedang libur',
        note: upcoming
          ? `berikutnya ${upcoming.judul}, ${formatTanggalPendek(upcoming.mulai)}`
          : 'jadwal berikutnya menyusul',
        href: '/modul',
      }

  const modulFor = (minggu: number): string | undefined =>
    schedule.find((entry) => entry.jenis === 'modul' && entry.minggu === minggu)?.judul
  const challenge: Brief =
    current && !isChallengeClosed(current)
      ? {
          label: 'challenge',
          value: current.judul,
          note: `tutup ${formatTanggalWaktu(current.deadline)}`,
          href: `/challenge/${current.slug}`,
        }
      : nextChallenge
        ? {
            label: 'challenge berikutnya',
            value: `soal modul ${modulFor(nextChallenge.minggu) ?? pad2(nextChallenge.minggu)}`,
            note: `terbit ${formatTanggalPendek(nextChallenge.tanggalRilis)}, 08.00`,
            href: '/challenge',
          }
        : {
            label: 'challenge',
            value: 'belum ada soal',
            note: 'pantau halaman challenge',
            href: '/challenge',
          }

  const pendaftaran: Brief = registration.open[0]
    ? {
        label: 'pendaftaran',
        value: 'dibuka',
        note: `kelas ${listNames(registration.open.map((track) => track.nama))}`,
        href: pendaftaranHref(registration.open[0].id),
      }
    : {
        label: 'pendaftaran',
        value: 'tidak ada yang dibuka',
        note: 'info berikutnya diumumkan di sini',
        href: '/gabung',
      }

  return [kelas, challenge, pendaftaran]
}

/**
 * The front page's running order. Announcements still valid today (WIB)
 * lead, newest first, and stay put; expired ones are left off the front
 * page (the archive keeps them); the rest is for the sheet to deal at
 * random. The page regenerates hourly, so an announcement drops off within
 * an hour of its last day ending.
 */
function frontPage(posts: readonly NewsPostMeta[]): { pinned: NewsPostMeta[]; pool: NewsPostMeta[] } {
  const today = toWib(new Date().toISOString()).slice(0, 10)
  const until = (post: NewsPostMeta): string | null => (post.kategori === 'pengumuman' ? post.berlakuSampai : null)
  const pinned = posts.filter((post) => {
    const last = until(post)
    return last !== null && last >= today
  })
  const pool = posts.filter((post) => until(post) === null)
  // Only expired announcements left: better an old paper than a blank one.
  return pinned.length + pool.length > 0 ? { pinned, pool } : { pinned: [], pool: [...posts] }
}

/**
 * The news as a front page — a cream broadsheet tossed onto the band: a
 * masthead whose rubric line is a live index, a "terkini" ticker, the lead
 * story across two thirds, a side column of more stories plus a "Sekilas
 * KSP" box of live figures, and more headlines along the foot. Valid
 * announcements take the first slots; the other stories are dealt at random
 * per page load (see `frontPage` and `NewsSheet`).
 * Deliberately not the text-left / box-right layout used elsewhere.
 */
export function NewsSection({ index, posts, ...live }: NewsSectionProps) {
  const rubrik = KATEGORI_BERITA.map((kategori) => ({
    kategori,
    count: posts.filter((post) => post.kategori === kategori).length,
  })).filter((item) => item.count > 0)

  return (
    <SectionShell accent="amber" tone="alt" labelledBy="berita-title">
      <Reveal>
        <SectionMarker index={index} label="berita" className="justify-center" />
      </Reveal>

      {posts.length > 0 ? (
        // The pile: two older editions lie on the table, and today's lands on top.
        <div className="relative mx-auto mt-6 max-w-6xl sm:mt-10">
          <BackIssue className="translate-x-1 translate-y-2.5 rotate-[1.7deg] sm:translate-x-4 sm:translate-y-3 sm:rotate-[2.6deg]" />
          <BackIssue className="-translate-x-1 translate-y-1 -rotate-[1.2deg] sm:-translate-x-3 sm:translate-y-1.5 sm:-rotate-[1.8deg]" />
          <PaperToss className="relative">
            {/* The sheet: always paper, whatever the theme. */}
            <NewsSheet posts={posts} {...frontPage(posts)} briefs={briefs(live)} rubrik={rubrik} />
          </PaperToss>
        </div>
      ) : (
        <Reveal className="mt-10">
          <h2 id="berita-title" className="sr-only">
            Kabar KSP
          </h2>
          <EmptyState
            command="git log berita/"
            output="fatal: belum ada commit"
            title="Belum ada berita"
            description="Pengumuman pertama biasanya terbit bersamaan dengan pembukaan pendaftaran anggota baru."
            action={
              <ButtonLink href="/gabung" variant="outline" size="sm">
                cara bergabung
              </ButtonLink>
            }
          />
        </Reveal>
      )}
    </SectionShell>
  )
}
