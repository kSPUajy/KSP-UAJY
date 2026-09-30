'use client'

import Link from 'next/link'
import { useMemo, useSyncExternalStore } from 'react'

import { ButtonLink } from '@/components/ui/Button'
import { DitherImage } from '@/components/ui/DitherImage'
import { formatTanggal, formatTanggalPendek, namaHari } from '@/lib/format'
import { COVER } from '@/lib/types'
import type { NewsPostMeta } from '@/lib/types'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/site.config'

/** One line of the "Sekilas KSP" box, worked out on the server from live data. */
export type Brief = { label: string; value: string; note: string; href: string }
/** A desk on the rubric line and how many stories it has. */
export type Rubrik = { kategori: string; count: number }

const LEAD_SIZES = '(min-width: 1024px) 760px, 92vw'
/** Stories in the side column, then one-line headlines along the foot. */
const SIDE = 3
const FOOT = 4
/** A phone gets the lead and two more; the rest is a tap away on /berita. */
const PHONE_SIDE = 2

/**
 * One deal per page load. The server and hydration see null, so the HTML is
 * the newest-first edition; right after, every reader gets their own random
 * seed, kept until the page is loaded again.
 */
let seed: number | undefined
const neverChanges = (): (() => void) => () => {}
const onClient = (): number => (seed ??= Math.floor(Math.random() * 2 ** 32))
const onServer = (): null => null

/** Sorted by a seeded random key (mulberry32): one seed, one edition. */
function shuffled<T>(items: readonly T[], from: number): T[] {
  let state = from
  const random = (): number => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return items
    .map((item) => ({ item, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item)
}

/** A story's category, as a newspaper kicker. */
function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.16em] text-accent-fg uppercase">{children}</p>
}

type NewsSheetProps = {
  /** Every story, newest first: the dateline, the ticker and the counts. */
  posts: readonly NewsPostMeta[]
  /** Valid announcements, newest first: they take the first slots, in order. */
  pinned: readonly NewsPostMeta[]
  /** The stories dealt at random into the slots left over. */
  pool: readonly NewsPostMeta[]
  briefs: readonly Brief[]
  rubrik: readonly Rubrik[]
}

/**
 * The front page itself. Valid announcements lead; the slots after them
 * (side column, then foot) are dealt at random from the pool on each page
 * load, so the paper is not always the newest post. The dateline and the
 * "terkini" ticker stay newest-first.
 * The sheet is still hidden until it is tossed in on scroll, so the reader
 * never sees the first deal change.
 */
export function NewsSheet({ posts, pinned, pool, briefs, rubrik }: NewsSheetProps) {
  const deal = useSyncExternalStore(neverChanges, onClient, onServer)
  const order = useMemo(() => [...pinned, ...(deal === null ? pool : shuffled(pool, deal))], [pinned, pool, deal])
  const [lead, ...rest] = order
  const edition = posts[0]
  const side = rest.slice(0, SIDE)
  const foot = rest.slice(SIDE, SIDE + FOOT)
  if (!lead || !edition) return null

  return (
    <div
      data-palette="light"
      data-accent="amber"
      className="newsprint relative overflow-hidden border-2 border-line bg-surface px-4 py-6 font-news text-fg hard-shadow sm:px-8 sm:py-8"
    >
      {/* The fold down the middle, where the paper was creased. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(0_0_0/0.05)_45%,rgb(255_255_255/0.35)_55%,transparent)] lg:block"
      />

      {/* Masthead. */}
      <header className="relative text-center">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-2 text-[11px] tracking-[0.1em] text-muted uppercase sm:text-xs">
          <span>Vol. I — No. {posts.length}</span>
          <span className="hidden sm:inline">
            Yogyakarta, {namaHari(edition.tanggal)} {formatTanggal(edition.tanggal)}
          </span>
          <span>Edisi digital</span>
        </div>
        <h2
          id="berita-title"
          className="py-3 font-blackletter text-[clamp(3rem,11vw,7rem)] leading-none sm:pt-5 sm:pb-0"
        >
          Kabar KSP
        </h2>
        <p className="hidden pt-1 pb-3 text-sm text-muted italic sm:block">
          &ldquo;{siteConfig.tagline}&rdquo;
        </p>
        {/* The rubric line is the index: each desk, how many stories, and a way in. */}
        <nav aria-label="Rubrik berita" className="border-y-4 border-double border-line py-1.5">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] tracking-[0.14em] uppercase sm:text-xs">
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

      <div className="relative mt-5 grid grid-cols-1 gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
        {/* Lead story. */}
        <article className="group relative lg:border-r lg:border-line lg:pr-8">
          <Kicker>{lead.kategori}</Kicker>
          <h3 className="mt-2 text-[clamp(1.85rem,4.2vw,3.25rem)] leading-[1.02] font-extrabold tracking-[-0.01em] text-balance">
            <Link
              href={`/berita/${lead.slug}`}
              className="decoration-accent decoration-4 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
            >
              {lead.judul}
            </Link>
          </h3>
          <p className="mt-4 border-y border-line py-1.5 text-[11px] tracking-[0.12em] text-muted uppercase">
            Oleh <span className="font-semibold text-fg">{lead.penulis}</span> —{' '}
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
          <p className="mt-5 line-clamp-4 text-[17px] leading-7 text-justify sm:line-clamp-none hyphens-auto text-fg first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:text-[4.25rem] first-letter:leading-[0.8] first-letter:font-extrabold">
            {lead.excerpt}
          </p>
          <p className="mt-3 text-right text-sm text-muted italic">(bersambung ke halaman 2 &rarr;)</p>
        </article>

        <aside aria-label="Juga di edisi ini" className="lg:pl-8">
          {side.length > 0 ? (
            <>
              <p className="border-b-4 border-double border-line pb-1.5 text-center text-sm font-extrabold tracking-[0.12em] uppercase">
                Juga di edisi ini
              </p>
              <ul>
                {side.map((post, position) => (
                  <li
                    key={post.id}
                    className={cn(
                      'group relative border-b border-line-soft py-3 last:border-b-0 sm:py-4',
                      position >= PHONE_SIDE && 'hidden sm:block',
                    )}
                  >
                    <Kicker>{post.kategori}</Kicker>
                    <h3 className="mt-1.5 text-xl leading-tight font-extrabold text-balance">
                      <Link
                        href={`/berita/${post.slug}`}
                        className="decoration-accent decoration-2 underline-offset-2 group-hover:underline after:absolute after:inset-0 after:content-['']"
                      >
                        {post.judul}
                      </Link>
                    </h3>
                    <p className="mt-1.5 line-clamp-3 hidden text-[15px] leading-6 text-justify hyphens-auto text-muted sm:block">
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
          <section
            aria-labelledby="sekilas-title"
            className="mt-4 hidden border-2 border-line bg-canvas p-4 sm:block"
          >
            <p
              id="sekilas-title"
              className="flex items-center justify-between text-sm font-extrabold tracking-[0.1em] uppercase"
            >
              Sekilas KSP
              <span className="text-[11px] font-normal tracking-normal text-dim normal-case italic">
                diperbarui otomatis
              </span>
            </p>
            <dl className="mt-3 space-y-3">
              {briefs.map((brief) => (
                <div
                  key={brief.label}
                  className="group relative border-t border-line-soft pt-3 first:border-t-0 first:pt-0"
                >
                  <dt className="text-[10px] tracking-[0.12em] text-dim uppercase">{brief.label}</dt>
                  <dd className="mt-0.5">
                    <Link
                      href={brief.href}
                      className="block text-base leading-5 font-extrabold decoration-accent decoration-2 underline-offset-2 group-hover:underline after:absolute after:inset-0 after:content-['']"
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
      <footer className="relative mt-6 border-t-4 border-double border-line pt-4 sm:mt-8">
        {foot.length > 0 ? (
          <ul className="hidden gap-x-6 gap-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {foot.map((post) => (
              <li
                key={post.id}
                className="group relative lg:border-l lg:border-line-soft lg:pl-4 lg:first:border-l-0 lg:first:pl-0"
              >
                <time
                  dateTime={post.tanggal}
                  className="block text-[10px] tracking-[0.08em] text-dim uppercase"
                >
                  {formatTanggalPendek(post.tanggal)}
                </time>
                <Link
                  href={`/berita/${post.slug}`}
                  className="mt-1 block text-base leading-5 font-extrabold text-balance decoration-accent decoration-2 underline-offset-2 group-hover:underline"
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
  )
}
