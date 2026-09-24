import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/img/ksp-logo.png'
import { siteConfig } from '@/site.config'
import { cn } from '@/lib/utils'

/**
 * The club's wordmark. Its background is transparent, so it sits on the dark
 * and the cream palettes alike. Imported statically: Next knows its size, so
 * nothing shifts while it loads.
 */
export function LogoMark({ height, className, priority = false }: { height: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src={logo}
      alt={siteConfig.logo.alt}
      height={height}
      width={Math.round((height * logo.width) / logo.height)}
      priority={priority}
      className={cn('block h-auto shrink-0', className)}
    />
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group flex shrink-0 items-center gap-3', className)}
      aria-label={`${siteConfig.shortName} — beranda`}
    >
      {/* The link names itself; the image inside would only repeat it. */}
      <span aria-hidden className="contents">
        <LogoMark height={32} priority />
      </span>
      <span className="hidden text-[10px] leading-tight tracking-tight text-muted xl:block">
        kelompok studi
        <br />
        pemrograman
      </span>
    </Link>
  )
}
