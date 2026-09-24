import Link from 'next/link'

import { formatTanggalPendek } from '@/lib/format'
import type { NewsPostMeta } from '@/lib/types'
import { cn, shortHash } from '@/lib/utils'

type GitLogProps = {
  posts: readonly NewsPostMeta[]
  /** Names the list for assistive tech. */
  label: string
  /** Prints each post's standfirst under its subject. */
  excerpt?: boolean
  className?: string
}

/**
 * Posts as `git log` output: graph node, abbreviated hash, subject, and the
 * date and author beneath. The hash is derived from the slug (`shortHash`), so
 * it is stable across builds and never has to be stored.
 *
 * Each row is a single link. The three columns hold at every width — the
 * subject wraps rather than truncating, so a phone loses nothing.
 */
export function GitLog({ posts, label, excerpt = false, className }: GitLogProps) {
  return (
    <ol aria-label={label} className={cn('border-t-2 border-line-soft', className)}>
      {posts.map((post) => (
        <li key={post.id} className="border-b-2 border-line-soft">
          <Link
            href={`/berita/${post.slug}`}
            className="group grid grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-3 px-1 py-4 text-[12px] leading-5 transition-colors hover:bg-surface-2 sm:px-3"
          >
            <span aria-hidden className="text-accent-fg">
              *
            </span>
            <span className="font-bold text-accent-fg">{shortHash(post.slug)}</span>

            <span className="min-w-0">
              <span className="text-fg decoration-accent-fg decoration-2 underline-offset-4 group-hover:underline">
                {post.judul}
              </span>
              <span className="mt-1 block text-[11px] text-dim">
                <time dateTime={post.tanggal}>{formatTanggalPendek(post.tanggal)}</time>
                {' · '}
                {post.penulis}
                {' · '}
                {post.kategori}
              </span>
              {excerpt ? (
                <span className="mt-2 block max-w-prose text-[12px] leading-6 text-muted">{post.excerpt}</span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
