'use client'

import { useMemo, useRef, useState } from 'react'

import { MemberDetail } from '@/components/sections/struktur/MemberDetail'
import { OrgChart } from '@/components/sections/struktur/OrgChart'
import { TreeView } from '@/components/sections/struktur/TreeView'
import { Drawer } from '@/components/ui/Drawer'
import { Tabs } from '@/components/ui/Tabs'
import {
  clearLocationHash,
  pushLocationHash,
  replaceLocationHash,
  useLocationHash,
} from '@/lib/hooks/useLocationHash'
import { indexOrg } from '@/lib/org'
import type { OrgBranch, OrgEntry, OrgNode } from '@/lib/org'

type StrukturExplorerProps = {
  roots: OrgNode[]
  rootLabel: string
  /** The tentors under the Koordinator Tentor, if there are any. */
  branch?: OrgBranch
}

const DETAIL_HEADING = 'anggota-detail'

/**
 * Both views of the structure, and the panel either of them opens.
 *
 * The open member lives in the URL fragment (`/struktur#reza-maulana-hakim`)
 * rather than in component state. That makes a member linkable from anywhere
 * — a tentor's profile links straight to their panel — and it makes Back
 * close the panel, which is the first thing anyone tries on a phone.
 *
 * Opening from a closed panel pushes a history entry; following a pointer
 * inside the panel replaces it, so Back never has to unwind a chain of
 * people. Closing pops the entry it pushed — or, if the page was opened on a
 * fragment in the first place, clears it without leaving the page.
 */
export function StrukturExplorer({ roots, rootLabel, branch }: StrukturExplorerProps) {
  const fragment = useLocationHash()
  const index = useMemo(() => indexOrg(roots), [roots])
  const entry = index.get(fragment) ?? null

  // Last member shown, so the panel keeps its content while it slides out.
  const [shown, setShown] = useState<OrgEntry | null>(null)
  if (entry && entry !== shown) setShown(entry)

  const pushedEntry = useRef(false)

  const open = (slug: string): void => {
    if (entry) {
      replaceLocationHash(slug)
      return
    }
    pushedEntry.current = true
    pushLocationHash(slug)
  }

  const close = (): void => {
    if (pushedEntry.current) {
      pushedEntry.current = false
      window.history.back()
      return
    }
    clearLocationHash()
  }

  const [root] = roots
  if (!root) return null

  return (
    <>
      <Tabs
        ariaLabel="Tampilan struktur"
        variant="flag"
        defaultId="struct"
        panelClassName="pt-8 sm:pt-10"
        items={[
          {
            id: 'tree',
            prefix: '--view=',
            label: 'tree',
            content: <TreeView roots={roots} rootLabel={rootLabel} branch={branch} onOpen={open} />,
          },
          {
            id: 'struct',
            prefix: '--view=',
            label: 'struct',
            content: <OrgChart root={root} branch={branch} onOpen={open} />,
          },
        ]}
      />

      <Drawer
        open={entry !== null}
        onClose={close}
        labelledBy={DETAIL_HEADING}
        title={shown ? `~/struktur/${shown.node.fileName}.h` : '~/struktur'}
        accent="violet"
      >
        {shown ? <MemberDetail entry={shown} onOpen={open} headingId={DETAIL_HEADING} /> : null}
      </Drawer>
    </>
  )
}
