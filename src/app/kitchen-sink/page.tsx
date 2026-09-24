import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Specimens } from '@/components/sections/kitchen-sink/Specimens'
import { Prompt } from '@/components/ui/Prompt'

export const metadata: Metadata = {
  title: 'Kitchen sink',
  robots: { index: false, follow: false },
}

const PALETTES = [
  { id: 'dark', label: 'palette: dark' },
  { id: 'light', label: 'palette: light' },
] as const

/**
 * Development-only specimen sheet.
 *
 * Renders every primitive twice, once per palette, side by side. Because
 * `data-palette` is independent of the page theme, both columns are live at
 * once — there is no need to toggle the site theme to check the other one.
 */
export default function KitchenSinkPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header data-accent="violet">
          <Prompt>npm run dev -- --kitchen-sink</Prompt>
          <h1 className="mt-4 font-display text-xl tracking-[0.06em] text-fg uppercase">
            Kitchen sink
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-7 text-muted">
            Semua primitive design system, dirender dua kali — satu kolom per palette. Rute ini
            hanya ada di development dan tidak pernah ikut ke build produksi.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {PALETTES.map((palette) => (
            <div key={palette.id} data-palette={palette.id} className="border-2 border-line bg-canvas">
              <p className="sticky top-16 z-10 border-b-2 border-line bg-surface-2 px-5 py-3 font-display text-[10px] tracking-[0.18em] text-fg uppercase">
                {palette.label}
              </p>
              <Specimens />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
