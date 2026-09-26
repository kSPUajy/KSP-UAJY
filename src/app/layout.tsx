import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, JetBrains_Mono, Newsreader, Silkscreen, UnifrakturMaguntia } from 'next/font/google'

import { Footer } from '@/components/layout/Footer'
import { Nav } from '@/components/layout/Nav'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { SkipLink } from '@/components/layout/SkipLink'
import { THEME_INIT_SCRIPT, ThemeProvider } from '@/components/layout/ThemeProvider'
import { CRT_INIT_SCRIPT, CrtPowerOn } from '@/components/overlays/CrtPowerOn'
import { CreatorEggs } from '@/components/overlays/CreatorEggs'
import { PageOverlays } from '@/components/overlays/Overlays'
import { siteConfig } from '@/site.config'

import './globals.css'

/** Display face: bitmap, uppercase, used sparingly for eyebrows and badges. */
const silkscreen = Silkscreen({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-silkscreen',
  display: 'swap',
})

/** Primary UI and every piece of structured data. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

/** Long-form article bodies only — news and challenge write-ups. */
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-plex',
  display: 'swap',
})

/** The home page's front page only: newspaper serif for headlines and body. */
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: false,
})

/** The front page's nameplate, and nothing else. */
const blackletter = UnifrakturMaguntia({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-unifraktur',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.campus.short}`,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'kelompok studi pemrograman',
    'bahasa C',
    'belajar C',
    siteConfig.campus.short,
    siteConfig.campus.name,
    'informatika',
    'challenge mingguan',
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} · ${siteConfig.campus.short}`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} · ${siteConfig.campus.short}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#0b0d12',
}

/**
 * What a browser without JavaScript needs to read the site.
 *
 * 1. Every page streams in under the root `loading.tsx` boundary. React ships
 *    the finished page as a hidden segment (`<div hidden id="S:0">`) at the
 *    end of <body> plus an inline script that swaps it in for the fallback —
 *    a script that never runs here. So: show the segments, hide the pending
 *    fallbacks (the siblings after each `<template id="B:…">`), and order the
 *    segment above the footer, which it would otherwise follow.
 *
 *    Tailwind's preflight hides `[hidden]` with `!important` inside
 *    `@layer base`, and for important declarations an earlier layer beats a
 *    later one and every layer beats unlayered CSS. The override therefore
 *    goes in `@layer theme`, the one layer declared ahead of `base`.
 * 2. Everything Framer Motion reveals starts from an inline `opacity: 0`.
 *    Put it in its final state, and drop the hero's typing and raster masks.
 * 3. `data-needs-js` marks controls that only work with script, such as the
 *    challenge archive's filter. Better absent than silently inert.
 */
const NO_SCRIPT_STYLES = `<style>
body{display:flex;flex-direction:column}
body>footer{order:2}
@layer theme{body>div[hidden][id^="S:"]{display:block!important;order:1}}
template[id^="B:"]~*{display:none!important}
[data-reveal],[data-seq]{opacity:1!important;transform:none!important}
[data-typewriter-mask],[data-raster]{display:none!important}
[data-needs-js]{display:none!important}
</style>`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-theme` is rewritten before first paint by THEME_INIT_SCRIPT, so the
    // attribute React rendered and the one in the DOM can legitimately differ.
    //
    // `data-scroll-behavior`: globals.css sets `scroll-behavior: smooth` for
    // in-page anchors. As of Next 16 the router no longer suspends that during
    // navigation, which would make every route change smooth-scroll to the top.
    // This attribute opts back into the instant jump, anchors still smooth.
    <html
      lang="id"
      data-theme="dark"
      data-palette="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${silkscreen.variable} ${jetbrainsMono.variable} ${plexSans.variable} ${newsreader.variable} ${blackletter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: CRT_INIT_SCRIPT }} />
        <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <SkipLink />
          <Nav />
          <main id="konten-utama" className="relative">
            {children}
          </main>
          <Footer />
          <CreatorEggs />
          <PageOverlays />
          <CrtPowerOn />
          <SmoothScroll />
        </ThemeProvider>
      </body>
    </html>
  )
}
