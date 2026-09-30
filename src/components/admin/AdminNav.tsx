'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { AppRole } from '@/lib/auth/session'
import { cn } from '@/lib/utils'

/** Sections without `roles` are admin-only; Kominfo manages the news and the gallery. */
const ADMIN_SECTIONS: readonly { href: string; label: string; roles?: readonly AppRole[] }[] = [
  { href: '/admin', label: 'ringkasan' },
  { href: '/admin/anggota', label: 'anggota' },
  { href: '/admin/modul', label: 'modul' },
  { href: '/admin/tentor', label: 'tentor' },
  { href: '/admin/berita', label: 'berita', roles: ['admin', 'kominfo'] },
  { href: '/admin/challenge', label: 'challenge' },
  { href: '/admin/galeri', label: 'galeri', roles: ['admin', 'kominfo'] },
  { href: '/admin/pendaftaran', label: 'pendaftaran' },
  { href: '/admin/masukan', label: 'masukan' },
  { href: '/penilaian', label: 'penilaian' },
]

/**
 * A column of `cd` targets on wide screens, a scrolling tab strip on phones.
 * Only the sections the role may open are listed; the pages check again.
 */
export function AdminNav({ role }: { role: AppRole }) {
  const pathname = usePathname()
  const sections = ADMIN_SECTIONS.filter((section) => (section.roles ?? ['admin']).includes(role))
  const active = (href: string): boolean => (href === '/admin' ? pathname === href : pathname.startsWith(href))

  return (
    <nav aria-label="Panel admin">
      <ul className="flex gap-1 overflow-x-auto border-b-2 border-line-soft pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-l-2 lg:pb-0">
        {sections.map((section) => (
          <li key={section.href} className="shrink-0">
            <Link
              href={section.href}
              aria-current={active(section.href) ? 'page' : undefined}
              className={cn(
                'block px-3 py-2 text-[12px] whitespace-nowrap transition-colors lg:-ml-[2px] lg:border-l-2 lg:py-2.5',
                active(section.href)
                  ? 'bg-surface text-fg lg:border-accent-fg'
                  : 'text-muted hover:bg-surface-2 hover:text-fg lg:border-transparent',
              )}
            >
              <span aria-hidden className="text-accent-fg">
                cd{' '}
              </span>
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
