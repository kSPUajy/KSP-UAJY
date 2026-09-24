'use client'

import { GitLog } from '@/components/sections/berita/GitLog'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommandBar, Flag, TextFlag } from '@/components/ui/Flag'
import { useQueryParams } from '@/lib/hooks/useQueryParams'
import type { KategoriBerita, NewsPostMeta } from '@/lib/types'

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
 * Both flags live in the query string, so a filtered archive is a link. The
 * server ships the whole log; the URL's filter applies after hydration.
 */
export function NewsArchive({ posts, categories }: NewsArchiveProps) {
  const { params, setParams } = useQueryParams()

  const rawKategori = params.get('kategori')
  const kategori = categories.find((value) => value === rawKategori) ?? null
  const grep = params.get('grep') ?? ''
  const needle = grep.trim().toLowerCase()

  const visible = posts.filter(
    (post) => (kategori === null || post.kategori === kategori) && (needle === '' || haystack(post).includes(needle)),
  )
  const filtered = kategori !== null || needle !== ''

  const reset = (): void => setParams({ kategori: null, grep: null })

  return (
    <div>
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
          onChange={(value) => setParams({ kategori: value || null })}
          options={[{ value: '', label: 'semua' }, ...categories.map((value) => ({ value, label: value }))]}
        />
        <TextFlag
          name="grep"
          description="cari judul, isi ringkas, penulis, atau tag"
          value={grep}
          placeholder="malloc"
          onChange={(value) => setParams({ grep: value || null })}
        />
      </CommandBar>

      <p aria-live="polite" className="mt-6 text-[11px] leading-5 text-dim">
        {`// ${visible.length} dari ${posts.length} tulisan`}
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 flex max-w-4xl flex-col gap-10">
          {byYear(visible).map((group) => (
            <section key={group.year} aria-labelledby={`tahun-${group.year}`}>
              <h3 id={`tahun-${group.year}`} className="font-display text-[11px] tracking-[0.16em] text-accent-fg">
                {`// ${group.year}`}
              </h3>
              <GitLog posts={group.posts} label={`Berita tahun ${group.year}`} excerpt className="mt-3" />
            </section>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  )
}
