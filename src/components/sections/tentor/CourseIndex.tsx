import Link from 'next/link'

import { Prompt } from '@/components/ui/Prompt'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { Tentor } from '@/lib/types'

type CourseIndexProps = {
  tentors: readonly Pick<Tentor, 'nama' | 'slug' | 'mataKuliahBinaan'>[]
}

/**
 * Who to ask about which course — the question a student actually arrives
 * with. Built by inverting every tentor's `mataKuliahBinaan`, sorted by
 * course, and printed like the result of grepping the tentor folder.
 */
export function CourseIndex({ tentors }: CourseIndexProps) {
  const byCourse = new Map<string, Array<Pick<Tentor, 'nama' | 'slug'>>>()
  for (const tentor of tentors) {
    for (const course of tentor.mataKuliahBinaan) {
      const list = byCourse.get(course) ?? []
      list.push({ nama: tentor.nama, slug: tentor.slug })
      byCourse.set(course, list)
    }
  }
  const courses = [...byCourse.entries()].sort(([a], [b]) => a.localeCompare(b, 'id'))

  return (
    <TerminalWindow title="~/tentor — grep -rl" tone="code">
      <Prompt>grep -rl &quot;mata kuliah&quot; ~/tentor</Prompt>

      <ul className="mt-6 border-t-2 border-line-soft">
        {courses.map(([course, list]) => (
          <li
            key={course}
            className="grid grid-cols-1 gap-x-6 gap-y-2 border-b-2 border-line-soft py-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
          >
            <h3 className="text-sm leading-6 font-bold text-fg">
              {course}
              <span className="ml-2 text-[11px] font-normal text-dim">{list.length} tentor</span>
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs leading-6">
              {list.map((tentor) => (
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
        {courses.length} mata kuliah, {tentors.length} tentor
      </p>
    </TerminalWindow>
  )
}
