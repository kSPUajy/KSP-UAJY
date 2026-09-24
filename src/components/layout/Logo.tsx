import Link from 'next/link'

import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'

/**
 * Placeholder pixel mark: a blocky C on an 8x8 cell grid. TODO(brand)
 *
 * Kept inline rather than loaded through next/image so it inherits the theme
 * colour. When the club supplies the real logo, swap this for an <Image> and
 * point it at `siteConfig.logo`; `public/logo/ksp-mark.svg` already carries a
 * flat-colour copy for favicon and OpenGraph use.
 */
export function PixelMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn('block', className)}
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      <g fill="currentColor">
        <rect x="4" y="0" width="8" height="2" />
        <rect x="2" y="2" width="4" height="2" />
        <rect x="10" y="2" width="4" height="2" />
        <rect x="0" y="4" width="4" height="8" />
        <rect x="2" y="12" width="4" height="2" />
        <rect x="10" y="12" width="4" height="2" />
        <rect x="4" y="14" width="8" height="2" />
      </g>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group flex shrink-0 items-center gap-2.5', className)}
      aria-label={`${siteConfig.shortName} — beranda`}
    >
      <span className="flex h-8 w-8 items-center justify-center border-2 border-line bg-accent text-accent-ink">
        <PixelMark className="h-5 w-5" />
      </span>
      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-[13px] tracking-[0.14em] text-fg">
          {siteConfig.wordmark}
        </span>
        <span className="mt-1 hidden text-[10px] leading-none tracking-tight text-muted xl:block">
          kelompok studi pemrograman
        </span>
      </span>
    </Link>
  )
}
