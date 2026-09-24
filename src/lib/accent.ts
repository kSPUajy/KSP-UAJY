/**
 * Accent ownership.
 *
 * Each major section owns exactly one accent so that no viewport ever shows
 * more than a couple of hues at once. The actual colour values live in
 * `globals.css`; this module only names them and maps routes onto them.
 */

import type { Difficulty } from '@/lib/types'

export const ACCENTS = ['magenta', 'amber', 'cyan', 'lime', 'violet', 'orange'] as const

export type AccentName = (typeof ACCENTS)[number]

/** Brand accent: global chrome (nav, hero, primary CTA) and the Challenge section. */
export const BRAND_ACCENT: AccentName = 'magenta'

export const ROUTE_ACCENT: Record<string, AccentName> = {
  '/': 'magenta',
  '/tentang': 'violet',
  '/struktur': 'violet',
  '/tentor': 'cyan',
  '/modul': 'cyan',
  '/challenge': 'magenta',
  '/hall-of-fame': 'orange',
  '/berita': 'amber',
  '/galeri': 'lime',
  '/gabung': 'lime',
}

/**
 * Difficulty reads as a temperature ramp: cool and safe through to the colour
 * the club's own name for "you will crash" deserves.
 */
export const DIFFICULTY_ACCENT: Record<Difficulty, AccentName> = {
  MUDAH: 'lime',
  SEDANG: 'amber',
  SULIT: 'orange',
  SEGFAULT: 'magenta',
}

/** Resolves the owning accent for any pathname, including nested detail routes. */
export function accentForPath(pathname: string): AccentName {
  if (pathname === '/') return ROUTE_ACCENT['/'] ?? BRAND_ACCENT
  const segment = `/${pathname.split('/').filter(Boolean)[0] ?? ''}`
  return ROUTE_ACCENT[segment] ?? BRAND_ACCENT
}
