import type { Metadata } from 'next'

import { siteConfig } from '@/site.config'

type PageMetadataInput = {
  /** Page name. Omitted only for the home page, which uses the site's default title. */
  title?: string
  description: string
  /** Site-relative path, e.g. `/berita/tiga-kesalahan-malloc`. Becomes the canonical URL. */
  path: string
  /** Article fields for Open Graph, on news posts. */
  article?: {
    publishedTime: string
    authors: string[]
    tags: string[]
  }
  /** Keeps the page out of search results — utility pages, never content. */
  noindex?: boolean
}

/** What the root layout's title template turns a page title into. */
export const fullTitle = (title?: string): string =>
  title ? `${title} · ${siteConfig.shortName}` : `${siteConfig.name} · ${siteConfig.campus.short}`

/**
 * Every page's metadata, built the same way.
 *
 * Next merges metadata between segments shallowly: a page that sets `title`
 * but not `openGraph` inherits the root layout's `openGraph` whole — so every
 * share card on the site would read "Kelompok Studi Pemrograman · UAJY" and
 * point at the home page. Pages go through this instead, so the title,
 * description and URL a crawler sees always match the page.
 *
 * Images are not set here. Each route's `opengraph-image.tsx` supplies its
 * own, and file-based metadata takes precedence over this object anyway.
 */
export function pageMetadata({ title, description, path, article, noindex = false }: PageMetadataInput): Metadata {
  const socialTitle = fullTitle(title)

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: siteConfig.name,
      locale: 'id_ID',
      url: path,
      title: socialTitle,
      description,
      ...(article
        ? {
            type: 'article',
            publishedTime: article.publishedTime,
            authors: article.authors,
            tags: article.tags,
          }
        : { type: 'website' }),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
