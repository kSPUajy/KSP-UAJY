import Link from 'next/link'

import { Prompt } from '@/components/ui/Prompt'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { Tentor, TentorModul } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type ModulIndexProps = {
  tentors: readonly Pick<Tentor, 'nama' | 'slug' | 'modul'>[]
}

/**
 * Who to ask about which module — the question a student actually arrives
 * with. Built by inverting every tentor's modules, in course order, and
 * printed like the result of grepping the tentor folder.
 */
export function ModulIndex({ tentors }: ModulIndexProps) {
  const byModul = new Map<string, { modul: TentorModul; people: Array<Pick<Tentor, 'nama' | 'slug'>> }>()
  for (const tentor of tentors) {
    for (const modul of tentor.modul) {
      const entry = byModul.get(modul.id) ?? { modul, people: [] }
      entry.people.push({ nama: tentor.nama, slug: tentor.slug })
      byModul.set(modul.id, entry)
    }
  }
  const rows = [...byModul.values()].sort((a, b) => a.modul.minggu - b.modul.minggu)

  return (
    <TerminalWindow title="~/tentor — grep -rl" tone="code">
      <Prompt>grep -rl &quot;modul&quot; ~/tentor</Prompt>

      <ul className="mt-6 border-t-2 border-line-soft">
        {rows.map(({ modul, people }) => (
          <li
            key={modul.id}
            className="grid grid-cols-1 gap-x-6 gap-y-2 border-b-2 border-line-soft py-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
          >
            <h3 className="text-sm leading-6 font-bold text-fg">
              <Link href={`/modul#minggu-${pad2(modul.minggu)}`} className="hover:text-accent-fg">
                <span className="text-accent-fg tabular-nums">M{pad2(modul.minggu)}</span> {modul.judul}
              </Link>
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs leading-6">
              {people.map((tentor) => (
                <li key={tentor.slug}>
                  <Link
                    href={`/tentor/${tentor.slug}`}
                    className="text-accent-fg decoration-2 underline-offset-4 hover:underline"
                  >
                    {tentor.nama}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-6 text-dim">
        {rows.length} modul, {tentors.length} tentor
      </p>
    </TerminalWindow>
  )
}
