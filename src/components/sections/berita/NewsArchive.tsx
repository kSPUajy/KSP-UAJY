'use client'

import { useRef } from 'react'

import { scrollToElement } from '@/components/motion/SmoothScroll'
import { GitLog } from '@/components/sections/berita/GitLog'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommandBar, Flag, TextFlag } from '@/components/ui/Flag'
import { useQueryParams } from '@/lib/hooks/useQueryParams'
import type { KategoriBerita, NewsPostMeta } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Posts per page of the archive. */
const PAGE_SIZE = 6

type NewsArchiveProps = {
  /** Newest first. */
  posts: readonly NewsPostMeta[]
  /** Every category at least one post carries, in display order. */
  categories: readonly KategoriBerita[]
}

/** Everything `--grep` looks through, lowercased once per render. */
function haystack(post: NewsPostMeta): string {
  return [post.judul, post.excerpt, post.penulis, post.kategori, ...post.tags].join(' ').toLowerCase()
}

/**
 * Page numbers to show: all of them when there are few, otherwise the first,
 * the last, and a window around the current one, with gaps as `null`.
 */
function pageList(current: number, total: number): Array<number | null> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const out: Array<number | null> = []
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && page - previous > 1) out.push(null)
    out.push(page)
  })
  return out
}

function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (page: number) => void }) {
  const step =
    'flex h-9 min-w-9 items-center justify-center border-2 px-2.5 text-[12px] font-bold tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-35'
  return (
    <nav aria-label="Halaman arsip berita" className="mt-10 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className={cn(step, 'border-line-soft text-muted hover:border-line hover:text-fg')}
      >
        <span aria-hidden>‹</span>
        <span className="ml-1.5 hidden sm:inline">sebelumnya</span>
        <span className="sr-only sm:hidden">Halaman sebelumnya</span>
      </button>
      {pageList(current, total).map((page, index) =>
        page === null ? (
          <span key={`gap-${index}`} aria-hidden className="px-1 text-dim">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPage(page)}
            aria-current={page === current ? 'page' : undefined}
            aria-label={`Halaman ${page}`}
            className={cn(
              step,
              page === current
                ? 'border-line bg-accent text-accent-ink hard-shadow-line'
                : 'border-line-soft text-fg hover:border-line hover:bg-surface-2',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className={cn(step, 'border-line-soft text-muted hover:border-line hover:text-fg')}
      >
        <span className="mr-1.5 hidden sm:inline">berikutnya</span>
        <span className="sr-only sm:hidden">Halaman berikutnya</span>
        <span aria-hidden>›</span>
      </button>
    </nav>
  )
}

/** Posts in runs of one year each, keeping the incoming order. */
function byYear(posts: readonly NewsPostMeta[]): Array<{ year: string; posts: NewsPostMeta[] }> {
  const groups: Array<{ year: string; posts: NewsPostMeta[] }> = []
  for (const post of posts) {
    const year = post.tanggal.slice(0, 4)
    const last = groups[groups.length - 1]
    if (last?.year === year) last.posts.push(post)
    else groups.push({ year, posts: [post] })
  }
  return groups
}

/**
 * Every post, as `git log` split by year, behind a command line:
 *
 *     $ git log --kategori=tutorial --grep="malloc"
 *
 * Both flags live in the query string, so a filtered archive is a link, and
 * so does the page (`?hal=2`). The server ships the whole log; the URL's
 * filter and page apply after hydration. Changing a filter goes back to
 * page one.
 */
export function NewsArchive({ posts, categories }: NewsArchiveProps) {
  const { params, setParams } = useQueryParams()
  const topRef = useRef<HTMLDivElement>(null)

  const rawKategori = params.get('kategori')
  const kategori = categories.find((value) => value === rawKategori) ?? null
  const grep = params.get('grep') ?? ''
  const needle = grep.trim().toLowerCase()

  const visible = posts.filter(
    (post) => (kategori === null || post.kategori === kategori) && (needle === '' || haystack(post).includes(needle)),
  )
  const filtered = kategori !== null || needle !== ''

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const requested = Number.parseInt(params.get('hal') ?? '1', 10)
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), pages) : 1
  const shown = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goTo = (next: number): void => {
    setParams({ hal: next === 1 ? null : String(next) })
    if (topRef.current) scrollToElement(topRef.current)
  }

  const reset = (): void => setParams({ kategori: null, grep: null, hal: null })

  return (
    <div ref={topRef}>
      <CommandBar
        command="git log"
        trailing={
          filtered ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              reset
            </Button>
          ) : null
        }
      >
        <Flag
          name="kategori"
          description="kategori berita"
          value={kategori ?? ''}
          onChange={(value) => setParams({ kategori: value || null, hal: null })}
          options={[{ value: '', label: 'semua' }, ...categories.map((value) => ({ value, label: value }))]}
        />
        <TextFlag
          name="grep"
          description="cari judul, isi ringkas, penulis, atau tag"
          value={grep}
          placeholder="malloc"
          onChange={(value) => setParams({ grep: value || null, hal: null })}
        />
      </CommandBar>

      <p aria-live="polite" className="mt-6 text-[11px] leading-5 text-dim">
        {`// ${visible.length} dari ${posts.length} tulisan`}
        {pages > 1 ? ` · halaman ${page} dari ${pages}` : ''}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 flex max-w-4xl flex-col gap-10">
          {byYear(shown).map((group) => (
            <section key={group.year} aria-labelledby={`tahun-${group.year}`}>
              <h3 id={`tahun-${group.year}`} className="font-display text-[11px] tracking-[0.16em] text-accent-fg">
                {`// ${group.year}`}
              </h3>
              <GitLog posts={group.posts} label={`Berita tahun ${group.year}`} excerpt className="mt-3" />
            </section>
          ))}
        </div>
      ) : null}

      {visible.length > 0 && pages > 1 ? <Pagination current={page} total={pages} onPage={goTo} /> : null}

      {visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          command={`git log${kategori ? ` --kategori=${kategori}` : ''}${needle ? ` --grep="${grep.trim()}"` : ''}`}
          output="(tidak ada commit yang cocok)"
          title="Tidak ada tulisan yang cocok"
          description="Coba kata yang lebih pendek, atau lepaskan filter kategorinya."
          action={
            <Button variant="outline" size="sm" onClick={reset}>
              reset filter
            </Button>
          }
        />
      ) : null}
    </div>
  )
}
