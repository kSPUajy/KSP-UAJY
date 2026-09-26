import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { DitherImage } from '@/components/ui/DitherImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionShell } from '@/components/ui/SectionShell'
import { formatTanggal, formatTanggalPendek } from '@/lib/format'
import { COVER } from '@/lib/types'
import type { NewsPostMeta } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type NewsSectionProps = {
  index: number
  /** Newest first. */
  posts: readonly NewsPostMeta[]
}

const LEAD_SIZES = '(min-width: 1024px) 760px, 92vw'
/** Stories in the side column, then one-line headlines along the foot. */
const SIDE = 3
const FOOT = 4

/** A story's category, as a newspaper kicker. */
function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.16em] text-accent-fg uppercase">{children}</p>
}

/**
 * The news as a front page — a cream broadsheet laid on the band, with a
 * masthead, one lead story across two thirds, a side column of the next few,
 * and older headlines along the foot. Deliberately not the text-left /
 * box-right layout the rest of the home page uses.
 */
export function NewsSection({ index, posts }: NewsSectionProps) {
  const [lead, ...rest] = posts
  const side = rest.slice(0, SIDE)
  const foot = rest.slice(SIDE, SIDE + FOOT)

  return (
    <SectionShell accent="amber" tone="alt" labelledBy="berita-title">
      <Reveal>
        <p className="text-center font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
          {`// ${pad2(index)} — berita`}
        </p>
      </Reveal>

      {lead ? (
        <Reveal delay={0.05} className="mt-6">
          {/* The sheet: always paper, whatever the theme, set down slightly askew. */}
          <div
            data-palette="light"
            data-accent="amber"
            className="mx-auto max-w-6xl border-2 border-line bg-surface px-4 py-6 text-fg hard-shadow sm:px-8 sm:py-8 lg:-rotate-[0.4deg]"
          >
            {/* Masthead. */}
            <header className="text-center">
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
              <div className="border-y-4 border-double border-line py-1.5 text-[10px] tracking-[0.14em] text-muted uppercase sm:text-[11px]">
                pengumuman · liputan · tutorial · prestasi
              </div>
            </header>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
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

              {/* Also in this edition. */}
              {side.length > 0 ? (
                <aside aria-label="Juga di edisi ini" className="lg:pl-8">
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
                        <p className="mt-1.5 line-clamp-3 font-sans text-[13px] leading-6 text-muted">{post.excerpt}</p>
                        <time dateTime={post.tanggal} className="mt-2 block text-[11px] text-dim">
                          {formatTanggalPendek(post.tanggal)}
                        </time>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>

            {/* Older headlines, along the foot of the page. */}
            <footer className="mt-8 border-t-4 border-double border-line pt-4">
              {foot.length > 0 ? (
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                  {foot.map((post) => (
                    <li key={post.id} className="group relative lg:border-l lg:border-line-soft lg:pl-4 lg:first:border-l-0 lg:first:pl-0">
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
              <div className="mt-5 flex justify-center" data-accent="amber">
                <ButtonLink href="/berita" variant="outline" size="sm">
                  semua berita -&gt;
                </ButtonLink>
              </div>
            </footer>
          </div>
        </Reveal>
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
