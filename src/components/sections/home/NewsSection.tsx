import Link from 'next/link'

import { PaperToss } from '@/components/motion/PaperToss'
import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { DitherImage } from '@/components/ui/DitherImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionShell } from '@/components/ui/SectionShell'
import { isChallengeClosed } from '@/lib/data'
import { formatTanggal, formatTanggalPendek, formatTanggalWaktu } from '@/lib/format'
import { COVER, KATEGORI_BERITA } from '@/lib/types'
import type { ChallengeMeta, NewsPostMeta, Registration, TimelineEntry } from '@/lib/types'
import { pad2 } from '@/lib/utils'

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

const LEAD_SIZES = '(min-width: 1024px) 760px, 92vw'
/** Stories in the side column, then one-line headlines along the foot. */
const SIDE = 3
const FOOT = 4

type Brief = { label: string; value: string; note: string; href: string }

/** A story's category, as a newspaper kicker. */
function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.16em] text-accent-fg uppercase">{children}</p>
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
  const kelas: Brief = running
    ? {
        label: 'kelas minggu ini',
        value: running.jenis === 'modul' ? `M${pad2(running.minggu)} ${running.judul}` : running.judul,
        note: `sampai ${formatTanggalPendek(running.sampai)}`,
        href: '/modul',
      }
    : {
        label: 'kelas',
        value: 'sedang libur',
        note: upcoming
          ? `berikutnya ${upcoming.judul}, ${formatTanggalPendek(upcoming.rilis)}`
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

  const pendaftaran: Brief =
    registration.status === 'buka'
      ? {
          label: 'pendaftaran',
          value: 'dibuka',
          note: `tutup ${formatTanggalPendek(registration.tutup)}`,
          href: '/gabung',
        }
      : registration.status === 'segera'
        ? {
            label: 'pendaftaran',
            value: 'segera dibuka',
            note: `mulai ${formatTanggalPendek(registration.buka)}`,
            href: '/gabung',
          }
        : {
            label: 'pendaftaran',
            value: 'ditutup',
            note: 'gelombang berikutnya diumumkan di sini',
            href: '/gabung',
          }

  return [kelas, challenge, pendaftaran]
}

/**
 * The news as a front page — a cream broadsheet tossed onto the band: a
 * masthead whose rubric line is a live index, a "terkini" ticker, the lead
 * story across two thirds, a side column of the next few plus a "Sekilas
 * KSP" box of live figures, and older headlines along the foot.
 * Deliberately not the text-left / box-right layout used elsewhere.
 */
export function NewsSection({ index, posts, ...live }: NewsSectionProps) {
  const [lead, ...rest] = posts
  const side = rest.slice(0, SIDE)
  const foot = rest.slice(SIDE, SIDE + FOOT)
  const rubrik = KATEGORI_BERITA.map((kategori) => ({
    kategori,
    count: posts.filter((post) => post.kategori === kategori).length,
  })).filter((item) => item.count > 0)

  return (
    <SectionShell accent="amber" tone="alt" labelledBy="berita-title">
      <Reveal>
        <p className="text-center font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
          {`// ${pad2(index)} — berita`}
        </p>
      </Reveal>

      {lead ? (
        <PaperToss className="mx-auto mt-6 max-w-6xl">
          {/* The sheet: always paper, whatever the theme. */}
          <div
            data-palette="light"
            data-accent="amber"
            className="relative overflow-hidden border-2 border-line bg-surface px-4 py-6 text-fg hard-shadow sm:px-8 sm:py-8"
          >
            {/* The fold down the middle, where the paper was creased. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(0_0_0/0.05)_45%,rgb(255_255_255/0.35)_55%,transparent)] lg:block"
            />

            {/* Masthead. */}
            <header className="relative text-center">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-2 text-[10px] tracking-[0.08em] text-muted uppercase sm:text-[11px]">
                <span>Yogyakarta</span>
                <span className="hidden sm:inline">Edisi {formatTanggal(lead.tanggal)}</span>
                <span>No. {posts.length}</span>
              </div>
              <h2
                id="berita-title"
                className="py-4 font-display text-[clamp(2.25rem,9vw,5.5rem)] leading-none tracking-[0.06em] uppercase sm:py-5"
              >
                Kabar KSP
              </h2>
              {/* The rubric line is the index: each desk, how many stories, and a way in. */}
              <nav aria-label="Rubrik berita" className="border-y-4 border-double border-line py-1.5">
                <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] tracking-[0.14em] uppercase sm:text-[11px]">
                  {rubrik.map((item) => (
                    <li key={item.kategori}>
                      <Link
                        href={`/berita?kategori=${item.kategori}`}
                        className="text-muted decoration-accent decoration-2 underline-offset-2 hover:text-fg hover:underline"
                      >
                        {item.kategori} <span className="text-accent-fg tabular-nums">{item.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </header>

            {/* Terkini: the newest headlines, running. */}
            <div aria-hidden className="relative mt-4 flex items-stretch border-2 border-line">
              <span className="flex shrink-0 items-center bg-accent px-3 text-[10px] font-bold tracking-[0.14em] text-accent-ink uppercase">
                terkini
              </span>
              <div className="marquee flex min-w-0 flex-1 overflow-hidden py-1.5">
                <div
                  className="marquee-track flex w-max shrink-0 items-center"
                  style={{ '--marquee-duration': '48s' } as React.CSSProperties}
                >
                  {[...posts.slice(0, 6), ...posts.slice(0, 6)].map((post, position) => (
                    <span
                      key={`${post.id}-${position}`}
                      className="flex items-center gap-4 pr-4 text-[12px] whitespace-nowrap"
                    >
                      <span className="text-dim tabular-nums">{formatTanggalPendek(post.tanggal)}</span>
                      <span className="font-bold">{post.judul}</span>
                      <span className="text-accent-fg">■</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
              {/* Lead story. */}
              <article className="group relative lg:border-r lg:border-line lg:pr-8">
                <Kicker>{lead.kategori}</Kicker>
                <h3 className="mt-2 text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.15] font-bold tracking-tight text-balance">
                  <Link
                    href={`/berita/${lead.slug}`}
                    className="decoration-accent decoration-4 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
                  >
                    {lead.judul}
                  </Link>
                </h3>
                <p className="mt-3 text-[11px] tracking-[0.04em] text-muted">
                  oleh <span className="font-bold text-fg">{lead.penulis}</span> ·{' '}
                  <time dateTime={lead.tanggal}>{formatTanggal(lead.tanggal)}</time>
                </p>
                <DitherImage
                  src={lead.cover}
                  alt={`Sampul berita: ${lead.judul}`}
                  width={COVER.width}
                  height={COVER.height}
                  sizes={LEAD_SIZES}
                  className="mt-5 aspect-video w-full"
                />
                <p className="mt-5 font-sans text-[15px] leading-7 text-fg first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.9] first-letter:text-accent-fg">
                  {lead.excerpt}
                </p>
                <p className="mt-4 text-[12px] font-bold text-accent-fg">baca selengkapnya -&gt;</p>
              </article>

              <aside aria-label="Juga di edisi ini" className="lg:pl-8">
                {side.length > 0 ? (
                  <>
                    <p className="border-b-2 border-line pb-2 text-[11px] font-bold tracking-[0.14em] uppercase">
                      Juga di edisi ini
                    </p>
                    <ul>
                      {side.map((post) => (
                        <li key={post.id} className="group relative border-b border-line-soft py-4 last:border-b-0">
                          <Kicker>{post.kategori}</Kicker>
                          <h3 className="mt-1.5 text-base leading-snug font-bold text-balance">
                            <Link
                              href={`/berita/${post.slug}`}
                              className="decoration-accent decoration-2 underline-offset-2 group-hover:underline after:absolute after:inset-0 after:content-['']"
                            >
                              {post.judul}
                            </Link>
                          </h3>
                          <p className="mt-1.5 line-clamp-2 font-sans text-[13px] leading-6 text-muted">
                            {post.excerpt}
                          </p>
                          <time dateTime={post.tanggal} className="mt-2 block text-[11px] text-dim">
                            {formatTanggalPendek(post.tanggal)}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {/* Sekilas KSP: live figures, boxed like the weather. */}
                <section aria-labelledby="sekilas-title" className="mt-4 border-2 border-line bg-canvas p-4">
                  <p
                    id="sekilas-title"
                    className="flex items-center justify-between text-[11px] font-bold tracking-[0.14em] uppercase"
                  >
                    Sekilas KSP
                    <span className="font-normal tracking-normal text-dim normal-case">diperbarui otomatis</span>
                  </p>
                  <dl className="mt-3 space-y-3">
                    {briefs(live).map((brief) => (
                      <div
                        key={brief.label}
                        className="group relative border-t border-line-soft pt-3 first:border-t-0 first:pt-0"
                      >
                        <dt className="text-[10px] tracking-[0.12em] text-dim uppercase">{brief.label}</dt>
                        <dd className="mt-0.5">
                          <Link
                            href={brief.href}
                            className="block text-sm leading-5 font-bold decoration-accent decoration-2 underline-offset-2 group-hover:underline after:absolute after:inset-0 after:content-['']"
                          >
                            {brief.value}
                          </Link>
                          <span className="mt-0.5 block text-[11px] text-muted">{brief.note}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </aside>
            </div>

            {/* Older headlines, along the foot of the page. */}
            <footer className="relative mt-8 border-t-4 border-double border-line pt-4">
              {foot.length > 0 ? (
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                  {foot.map((post) => (
                    <li
                      key={post.id}
                      className="group relative lg:border-l lg:border-line-soft lg:pl-4 lg:first:border-l-0 lg:first:pl-0"
                    >
                      <time dateTime={post.tanggal} className="block text-[10px] tracking-[0.08em] text-dim uppercase">
                        {formatTanggalPendek(post.tanggal)}
                      </time>
                      <Link
                        href={`/berita/${post.slug}`}
                        className="mt-1 block text-[13px] leading-5 font-bold text-balance decoration-accent decoration-2 underline-offset-2 group-hover:underline"
                      >
                        {post.judul}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] tracking-[0.08em] text-dim uppercase">
                  halaman 1 dari {Math.max(1, Math.ceil(posts.length / (1 + SIDE + FOOT)))}
                </span>
                <ButtonLink href="/berita" variant="outline" size="sm">
                  semua berita -&gt;
                </ButtonLink>
              </div>
            </footer>
          </div>
        </PaperToss>
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
