import { CodeBlock } from '@/components/ui/CodeBlock'
import { Tabs } from '@/components/ui/Tabs'
import type { Winner } from '@/lib/types'
import { pad2, snakeCase } from '@/lib/utils'

type SolutionTabsProps = {
  winner: Winner
  className?: string
}

/**
 * The winning submission in two views: the code, and the story of how it got
 * written. Rendered on the server — the highlighted code and the write-up are
 * plain HTML handed to the client `Tabs`, which only switches between them.
 */
export function SolutionTabs({ winner, className }: SolutionTabsProps) {
  const file = `~/challenge/minggu-${pad2(winner.minggu)}/${snakeCase(winner.slug)}.c`

  return (
    <Tabs
      ariaLabel={`Solusi dan pendekatan ${winner.nama}`}
      className={className}
      panelClassName="pt-6"
      items={[
        {
          id: 'solusi',
          label: 'solusi',
          content: <CodeBlock code={winner.kodeSolusi} filename={file} maxHeight="38rem" />,
        },
        {
          id: 'pendekatan',
          label: 'pendekatan',
          content: (
            <div className="measure">
              <p className="font-sans text-[17px] leading-[1.75] text-fg">{winner.pendekatan}</p>
              <p className="mt-6 font-mono text-sm leading-7 text-syn-comment">
                <span aria-hidden>{'// '}</span>
                <q className="italic">{winner.quote}</q> — {winner.nama}
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}
