import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MdxContent } from '@/components/mdx/MdxContent'
import { Reveal } from '@/components/motion/Reveal'
import { GitLog } from '@/components/sections/berita/GitLog'
import { ShareInstagram } from '@/components/sections/berita/ShareInstagram'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge, Tag } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { DitherImage } from '@/components/ui/DitherImage'
import { Prompt } from '@/components/ui/Prompt'
import { SectionShell } from '@/components/ui/SectionShell'
import { StructBlock } from '@/components/ui/StructBlock'
import { mdxHeadings, readingMinutes } from '@/lib/article'
import { getMembers, getNewsPostBySlug, getNewsPosts, getTentors } from '@/lib/data'
import { formatTanggal, formatTanggalPendek } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { COVER } from '@/lib/types'
import type { NewsPostMeta } from '@/lib/types'
import { shortHash, snakeCase } from '@/lib/utils'
import { siteConfig } from '@/site.config'

type BeritaPageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Slugs added in the admin panel after a build are rendered on first visit
 * instead of 404ing; an unknown slug still ends in `notFound()`.
 */
export const dynamicParams = true

/** Posts listed under the article. */
const RELATED = 3

export async function generateStaticParams() {
  const posts = await getNewsPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BeritaPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getNewsPostBySlug(slug)
  if (!post) return {}
  return pageMetadata({
    title: post.judul,
    description: post.excerpt,
    path: `/berita/${post.slug}`,
    article: { publishedTime: post.tanggal, authors: [post.penulis], tags: post.tags },
  })
}

function Label({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
      {`// ${children}`}
    </h2>
  )
}

/**
 * Same category first, then whatever is closest in time — so a tutorial is
 * followed by tutorials, and a category of one still gets neighbours.
 */
function relatedPosts(post: NewsPostMeta, posts: readonly NewsPostMeta[]): NewsPostMeta[] {
  const others = posts.filter((other) => other.slug !== post.slug)
  const distance = (other: NewsPostMeta): number =>
    Math.abs(Date.parse(other.tanggal) - Date.parse(post.tanggal))
  return [...others]
    .sort((a, b) => {
      const sameA = a.kategori === post.kategori ? 0 : 1
      const sameB = b.kategori === post.kategori ? 0 : 1
      return sameA - sameB || distance(a) - distance(b)
    })
    .slice(0, RELATED)
}

export default async function BeritaDetailPage({ params }: BeritaPageProps) {
  const { slug } = await params
  const post = await getNewsPostBySlug(slug)
  if (!post) notFound()

  const [posts, tentors, members] = await Promise.all([getNewsPosts(), getTentors(), getMembers()])

  // Newest first, so the post before this one in the list is the newer one.
  const position = posts.findIndex((item) => item.slug === post.slug)
  const newer = position > 0 ? posts[position - 1] : undefined
  const older = position >= 0 ? posts[position + 1] : undefined
  const related = relatedPosts(post, posts)

  const headings = mdxHeadings(post.bodyMdx)
  const minutes = readingMinutes(post.bodyMdx)
  const hash = shortHash(post.slug)
  const file = `~/berita/${post.tanggal.slice(0, 7)}/${post.slug}.md`

  // A byline that belongs to someone on the site links to them.
  const tentor = tentors.find((person) => person.nama === post.penulis)
  const member = members.find((person) => person.nama === post.penulis)
  const authorHref = tentor ? `/tentor/${tentor.slug}` : member ? `/struktur#${member.slug}` : null

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.judul,
    description: post.excerpt,
    image: [post.cover],
    datePublished: post.tanggal,
    inLanguage: 'id',
    keywords: post.tags.join(', '),
    mainEntityOfPage: `${siteConfig.url}/berita/${post.slug}`,
    author: { '@type': 'Person', name: post.penulis },
    publisher: { '@id': `${siteConfig.url}/#organisasi`, '@type': 'Organization', name: siteConfig.name },
  }

  return (
    <>
      <JsonLd data={articleLd} />
      <header data-accent="amber" className="relative border-b-2 border-line bg-canvas dot-grid">
        <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-14 lg:px-8">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent-fg"
          >
            <span aria-hidden className="text-accent-fg">
              &lt;-
            </span>
            cd ..<span className="sr-only"> — kembali ke berita</span>
          </Link>

          <Prompt className="mt-6">less {file}</Prompt>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge variant="solid">{post.kategori}</Badge>
            <time dateTime={post.tanggal} className="text-[11px] leading-5 text-dim">
              {formatTanggal(post.tanggal)}
            </time>
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight font-bold tracking-tight text-fg">
            {post.judul}
          </h1>

          <p className="mt-6 max-w-prose font-sans text-[17px] leading-[1.7] text-muted">{post.excerpt}</p>

          <p className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-5 text-dim">
            <span>
              oleh{' '}
              {authorHref ? (
                <Link href={authorHref} className="text-fg underline decoration-accent-fg decoration-2 underline-offset-4 hover:text-accent-fg">
                  {post.penulis}
                </Link>
              ) : (
                <span className="text-fg">{post.penulis}</span>
              )}
            </span>
            <span aria-hidden>·</span>
            <span>{minutes} menit baca</span>
            <span aria-hidden>·</span>
            <span>
              commit <span className="text-accent-fg">{hash}</span>
            </span>
          </p>
        </div>
      </header>

      <SectionShell accent="amber" tone="tint" divider={false} bare containerClassName="py-12 sm:py-16">
        <DitherImage
          src={post.cover}
          alt={`Sampul berita: ${post.judul}`}
          width={COVER.width}
          height={COVER.height}
          sizes="(min-width: 1440px) 1376px, 94vw"
          eager
          treatment="soft"
          className="aspect-video w-full sm:aspect-[21/9]"
        />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-x-14">
          {/* The measure is set in the prose face so 68ch means 68 of its characters. */}
          <article aria-label={post.judul} className="measure min-w-0 font-sans text-[17px] [&>div>*:first-child]:mt-0">
            <MdxContent source={post.bodyMdx} />
          </article>

          <aside
            aria-label="Tentang tulisan ini"
            className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1"
          >
            {headings.length > 1 ? (
              <nav aria-labelledby="daftar-isi">
                <Label id="daftar-isi">daftar isi</Label>
                <ol className="mt-4 border-l-2 border-line-soft">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className="-ml-[2px] block border-l-2 border-transparent py-1.5 pl-4 text-[12px] leading-5 text-muted transition-colors hover:border-accent-fg hover:text-fg"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <StructBlock
              type="berita"
              name={snakeCase(post.id)}
              label="Detail tulisan"
              fields={[
                { key: 'kategori', value: post.kategori, kind: 'ident' },
                { key: 'tanggal', value: formatTanggalPendek(post.tanggal) },
                { key: 'penulis', value: post.penulis },
                { key: 'menit', value: minutes },
              ]}
            />

            {post.tags.length > 0 ? (
              <section aria-labelledby="tag-tulisan">
                <Label id="tag-tulisan">tag</Label>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Tag>{tag}</Tag>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="bagikan">
              <Label id="bagikan">bagikan</Label>
              <div className="mt-4 flex items-center gap-3 border-2 border-line-soft bg-code-bg px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-[11px] text-muted">
                  {siteConfig.url.replace(/^https?:\/\//, '')}/berita/{post.slug}
                </span>
                <CopyButton
                  text={`${siteConfig.url}/berita/${post.slug}`}
                  label="Salin tautan tulisan"
                  doneMessage="Tautan tersalin ke papan klip"
                />
              </div>
              <ShareInstagram
                slug={post.slug}
                judul={post.judul}
                excerpt={post.excerpt}
                url={`${siteConfig.url}/berita/${post.slug}`}
              />
            </section>
          </aside>
        </div>
      </SectionShell>

      {related.length > 0 ? (
        <SectionShell accent="amber" tone="canvas" labelledBy="tulisan-lain" containerClassName="py-14 sm:py-16">
          <Reveal className="max-w-4xl">
            <h2 id="tulisan-lain" className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
              {'// tulisan lain'}
            </h2>
            <p className="mt-4 text-[11px] leading-6 text-dim">
              <span aria-hidden className="text-accent-fg">
                ${' '}
              </span>
              git log --related {hash}
            </p>
            <GitLog posts={related} label="Tulisan terkait" excerpt className="mt-3" />
          </Reveal>
        </SectionShell>
      ) : null}

      {newer || older ? (
        <nav aria-label="Berita sebelum dan sesudahnya" data-accent="amber" className="border-t-2 border-line bg-canvas-alt">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-4 px-4 py-8 sm:px-6 lg:px-8">
            {older ? (
              <Link href={`/berita/${older.slug}`} className="group min-w-0 text-left">
                <span className="block text-[11px] leading-5 text-dim">
                  <span aria-hidden>&lt;- </span>lebih lama
                </span>
                <span className="mt-1 block truncate text-sm font-bold text-fg group-hover:text-accent-fg">
                  {older.judul}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link href={`/berita/${newer.slug}`} className="group min-w-0 text-right">
                <span className="block text-[11px] leading-5 text-dim">
                  lebih baru<span aria-hidden> -&gt;</span>
                </span>
                <span className="mt-1 block truncate text-sm font-bold text-fg group-hover:text-accent-fg">
                  {newer.judul}
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  )
}
