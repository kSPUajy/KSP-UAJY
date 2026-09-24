import Link from 'next/link'

import { PixelMark } from '@/components/layout/Logo'
import { siteConfig } from '@/site.config'

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'instagram',
  github: 'github',
  youtube: 'youtube',
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[11px] tracking-[0.16em] text-accent-fg uppercase">
      {children}
    </h2>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const socials = Object.entries(siteConfig.socials)

  return (
    <footer className="relative border-t-2 border-line bg-canvas-alt">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <p className="border-b-2 border-line-soft py-3 text-[11px] text-dim">{'/* eof */'}</p>

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center border-2 border-line bg-accent text-accent-ink">
                <PixelMark className="h-5 w-5" />
              </span>
              <span className="font-display text-[13px] tracking-[0.14em] text-fg">
                {siteConfig.wordmark}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-6 text-muted">{siteConfig.name}</p>
            <p className="mt-2 max-w-xs text-xs leading-6 text-fg">{siteConfig.tagline}</p>
            <p className="mt-4 max-w-xs text-[11px] leading-5 text-dim">
              {siteConfig.campus.program}
              <br />
              {siteConfig.campus.faculty}
              <br />
              {siteConfig.campus.name}, {siteConfig.campus.city}
            </p>
          </div>

          <div data-accent="cyan">
            <ColumnHeading>{'// navigasi'}</ColumnHeading>
            <ul className="mt-4 space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted transition-colors hover:text-accent-fg"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={siteConfig.cta.href}
                  className="text-xs text-muted transition-colors hover:text-accent-fg"
                >
                  {siteConfig.cta.label}
                </Link>
              </li>
            </ul>
          </div>

          <div data-accent="lime">
            <ColumnHeading>{'// komunitas'}</ColumnHeading>
            <ul className="mt-4 space-y-2">
              {socials.map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent-fg"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                    <span aria-hidden className="text-dim transition-colors group-hover:text-accent-fg">
                      -&gt;
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-accent="amber">
            <ColumnHeading>{'// kontak'}</ColumnHeading>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-xs break-all text-muted transition-colors hover:text-accent-fg"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="text-xs leading-6 text-muted">
                Sekretariat KSP
                <br />
                Gedung Bonaventura, {siteConfig.campus.short}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-line-soft py-6 text-[11px] text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            {'// ©'} {year} {siteConfig.name} &middot; {siteConfig.campus.short}
          </p>
          <p className="text-accent-fg">return 0;</p>
        </div>
      </div>
    </footer>
  )
}
