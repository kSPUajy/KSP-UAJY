/**
 * Single source of truth for everything brand-shaped.
 *
 * Swapping the club name, tagline, logo or campus should never require touching
 * a component — change it here and the whole site follows.
 */

import type { AccentName } from '@/lib/accent'

export type NavItem = {
  /** Short label for the editor tab strip. */
  readonly label: string
  /** Spelled-out name, used wherever a bare `~` would read as cryptic. */
  readonly title: string
  readonly href: string
  /** Path-style title used by terminal window chrome on that route. */
  readonly path: string
  readonly accent: AccentName
}

export const siteConfig = {
  name: 'Kelompok Studi Pemrograman',
  shortName: 'KSP',
  /** Large bitmap wordmark in the hero. The full name sits underneath it. */
  wordmark: 'KSP',

  // TODO(brand): placeholder copy — replace once the club settles on a tagline.
  tagline: 'Belajar C dari pointer sampai produksi.',

  /** Typed out at the hero prompt, after the `$`. Keep it to one line on a phone. */
  heroCommand: './kelompok-studi --bahasa=C --status=open',

  description:
    'Kelompok Studi Pemrograman UAJY — komunitas belajar bahasa C di Program Studi Informatika, Fakultas Teknologi Industri, Universitas Atma Jaya Yogyakarta. Challenge mingguan, tentor sebaya, dan kelas rutin.',

  campus: {
    name: 'Universitas Atma Jaya Yogyakarta',
    short: 'UAJY',
    faculty: 'Fakultas Teknologi Industri',
    program: 'Program Studi Informatika',
    city: 'Yogyakarta',
  },

  /** Used for canonical URLs, sitemap, and OpenGraph. Update on first deploy. */
  url: 'https://ksp-uajy.vercel.app',
  locale: 'id-ID',

  /** The wordmark as a public file, for structured data and anything outside React. */
  logo: {
    src: '/logo/ksp-logo.png',
    width: 800,
    height: 327,
    alt: 'Logo Kelompok Studi Pemrograman UAJY',
  },

  // TODO(brand): placeholder — ganti dengan URL Google Form pendaftaran asli.
  joinFormUrl: 'https://forms.gle/ksp-uajy-pendaftaran',
  email: 'kspuajy2627@gmail.com',

  /** The secretariat's contact person, reachable on WhatsApp. */
  contact: {
    name: 'Audrey',
    /** Local format, as people read it out. */
    phone: '0877-3639-0570',
    /** International, digits only, for wa.me links. */
    whatsapp: '6287736390570',
  },

  socials: {
    instagram: 'https://www.instagram.com/kspuajy',
    github: 'https://github.com/kSPUajy',
  },

  /** Editor tab strip. `/gabung` is deliberately absent — pages link to it from their own CTAs. */
  nav: [
    { label: '~', title: 'beranda', href: '/', path: '~/', accent: 'magenta' },
    { label: 'tentang', title: 'tentang', href: '/tentang', path: '~/tentang/README.md', accent: 'violet' },
    { label: 'struktur', title: 'struktur', href: '/struktur', path: '~/struktur/org.h', accent: 'violet' },
    { label: 'tentor', title: 'tentor', href: '/tentor', path: '~/tentor/', accent: 'cyan' },
    { label: 'modul', title: 'modul', href: '/modul', path: '~/modul/', accent: 'cyan' },
    { label: 'challenge', title: 'challenge', href: '/challenge', path: '~/challenge/', accent: 'magenta' },
    { label: 'hall-of-fame', title: 'hall of fame', href: '/hall-of-fame', path: '~/hall-of-fame/', accent: 'orange' },
    { label: 'berita', title: 'berita', href: '/berita', path: '~/berita/', accent: 'amber' },
    { label: 'galeri', title: 'galeri', href: '/galeri', path: '~/galeri/', accent: 'lime' },
  ],

  cta: { label: 'gabung', href: '/gabung', accent: 'lime' },

  /** The yearly competition KSP runs at the end of the even semester. */
  event: {
    name: 'LINK',
    expansion: 'Logic Information and Knowledge',
    year: 2026,
    url: 'https://link-2026-seven.vercel.app/login',
  },
} as const satisfies {
  name: string
  shortName: string
  wordmark: string
  tagline: string
  heroCommand: string
  description: string
  campus: Record<'name' | 'short' | 'faculty' | 'program' | 'city', string>
  url: string
  locale: string
  logo: { src: string; width: number; height: number; alt: string }
  joinFormUrl: string
  email: string
  contact: { name: string; phone: string; whatsapp: string }
  socials: Record<string, string>
  nav: readonly NavItem[]
  cta: { label: string; href: string; accent: AccentName }
  event: { name: string; expansion: string; year: number; url: string }
}

export type SiteConfig = typeof siteConfig
