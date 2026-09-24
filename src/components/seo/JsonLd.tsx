import { siteConfig } from '@/site.config'

type JsonLdProps = {
  data: Record<string, unknown>
}

/**
 * Structured data for search engines. `<` is escaped so a string in the data
 * can never close the script tag — the sanitising step the Next.js JSON-LD
 * guide asks for.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  )
}

/** The club as a schema.org organisation, part of its university. */
export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organisasi`,
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.logo.src}`,
  email: siteConfig.email,
  description: siteConfig.description,
  sameAs: Object.values(siteConfig.socials),
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: siteConfig.campus.name,
  },
} as const
