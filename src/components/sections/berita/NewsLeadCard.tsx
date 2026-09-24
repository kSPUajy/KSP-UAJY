import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { DitherImage } from '@/components/ui/DitherImage'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { formatTanggal } from '@/lib/format'
import { COVER } from '@/lib/types'
import type { NewsPostMeta } from '@/lib/types'
import { cn } from '@/lib/utils'

type NewsLeadCardProps = {
  post: NewsPostMeta
  sizes: string
  /**
   * `split` puts the cover beside the text from `lg` up, for a lead that
   * spans the full width with the log underneath it.
   */
  layout?: 'stacked' | 'split'
  as?: 'h2' | 'h3'
}

/** `2026-08-24` -> `2026-08`, the folder a post would live in. */
const monthOf = (iso: string): string => iso.slice(0, 7)

/**
 * The lead story: cover, category, headline, standfirst. Opened like a file —
 * the title bar shows its path, and hover turns it into the pager command.
 * Same stretched-link pattern as the tentor cards: the headline is the one
 * link, its hit area covers the card.
 *
 * The standfirst stays in JetBrains Mono. Plex Sans is reserved for article
 * bodies, and a two-line excerpt is not one.
 */
export function NewsLeadCard({ post, sizes, layout = 'stacked', as: Heading = 'h3' }: NewsLeadCardProps) {
  const file = `${post.slug}.md`
  const split = layout === 'split'

  return (
    <article className="h-full">
      <TerminalWindow
        title={`~/berita/${monthOf(post.tanggal)}/${file}`}
        titleHover={`$ less ${file}`}
        interactive
        className="flex h-full flex-col"
        bodyClassName={cn(
          'flex flex-1 flex-col',
          split && 'lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
        )}
      >
        <DitherImage
          src={post.cover}
          alt={`Sampul berita: ${post.judul}`}
          width={COVER.width}
          height={COVER.height}
          sizes={sizes}
          bordered={false}
          className={cn(
            'aspect-video border-b-2 border-line',
            split && 'lg:aspect-auto lg:h-full lg:border-r-2 lg:border-b-0',
          )}
        />

        <div className={cn('flex flex-1 flex-col p-5 sm:p-6', split && 'lg:p-10')}>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="solid">{post.kategori}</Badge>
            <time dateTime={post.tanggal} className="text-[11px] leading-5 text-dim">
              {formatTanggal(post.tanggal)}
            </time>
          </div>

          <Heading
            className={cn(
              'mt-4 text-xl leading-snug font-bold tracking-tight text-fg sm:text-2xl',
              split && 'lg:text-[1.75rem] lg:leading-tight',
            )}
          >
            <Link
              href={`/berita/${post.slug}`}
              className="transition-colors group-hover/window:text-accent-fg after:absolute after:inset-0 after:content-['']"
            >
              {post.judul}
            </Link>
          </Heading>

          <p className="mt-4 max-w-prose text-sm leading-7 text-muted">{post.excerpt}</p>

          <p className="mt-auto pt-6 text-[11px] leading-5 text-dim">
            <span aria-hidden>{'// '}</span>oleh <span className="text-muted">{post.penulis}</span>
          </p>
        </div>
      </TerminalWindow>
    </article>
  )
}
