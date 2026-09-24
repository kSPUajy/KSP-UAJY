'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

import { INSTANT, REVEAL_VIEWPORT, mech } from '@/components/motion/variants'
import { StructCard } from '@/components/sections/struktur/StructCard'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { chartGroups } from '@/lib/org'
import type { OrgNode } from '@/lib/org'

type OrgChartProps = {
  root: OrgNode
  onOpen: (slug: string) => void
}

type Connector = {
  id: string
  d: string
  /** Draw order: trunk first, then drops, then stubs, then deeper rails. */
  order: number
}

type Box = {
  left: number
  top: number
  bottom: number
  cx: number
  cy: number
}

/** Rails run this far into a card's left gutter — half the 24px indent. */
const RAIL_INSET = 12

/**
 * Reads where every card actually landed and routes the connectors between
 * them. Measuring rather than predicting means the lines follow the layout
 * at every breakpoint, through font loading and long names wrapping, with
 * no coordinates written anywhere.
 *
 * Two routings:
 *   bus  — group columns side by side: a trunk from the root down to one
 *          horizontal bus, a drop into each column.
 *   rail — groups stacked (phones, tablets): one vertical rail down the left
 *          with a stub into each group, like an indented outline.
 * Anything below a group's top row hangs off its parent on a rail.
 */
function measure(container: HTMLElement): Connector[] {
  const origin = container.getBoundingClientRect()
  // A hidden tab has no geometry to route through.
  if (origin.width === 0) return []

  const round = Math.round
  const box = (element: Element): Box => {
    const rect = element.getBoundingClientRect()
    return {
      left: round(rect.left - origin.left),
      top: round(rect.top - origin.top),
      bottom: round(rect.bottom - origin.top),
      cx: round((rect.left + rect.right) / 2 - origin.left),
      cy: round((rect.top + rect.bottom) / 2 - origin.top),
    }
  }

  const cards = new Map<string, Box>()
  let root: Box | undefined
  for (const element of container.querySelectorAll<HTMLElement>('[data-org-card]')) {
    const id = element.dataset.id
    if (!id) continue
    const rect = box(element)
    cards.set(id, rect)
    if (element.dataset.depth === 'root') root = rect
  }
  if (!root) return []

  const groups = [...container.querySelectorAll<HTMLElement>('[data-org-group]')]
  const topRows = groups.map((group) =>
    [...group.querySelectorAll<HTMLElement>('[data-org-card][data-depth="0"]')]
      .map((element) => cards.get(element.dataset.id ?? ''))
      .filter((rect): rect is Box => rect !== undefined),
  )

  const connectors: Connector[] = []
  const groupBoxes = groups.map(box)
  const firstGroup = groupBoxes[0]
  const sideBySide =
    firstGroup !== undefined &&
    groupBoxes.length > 1 &&
    groupBoxes.every((group) => Math.abs(group.top - firstGroup.top) < 2)

  if (sideBySide) {
    const busY = round(root.bottom + (firstGroup.top - root.bottom) / 2)
    connectors.push({ id: 'trunk', d: `M${root.cx} ${root.bottom}V${busY}`, order: 0 })

    const drops = topRows.map((row) => {
      const [only] = row
      return row.length === 1 && only ? only.cx : (row[0]?.left ?? 0) - RAIL_INSET
    })
    const xs = [...drops, root.cx]
    connectors.push({ id: 'bus', d: `M${Math.min(...xs)} ${busY}H${Math.max(...xs)}`, order: 0 })

    topRows.forEach((row, groupIndex) => {
      const x = drops[groupIndex] ?? 0
      const [only] = row
      if (row.length === 1 && only) {
        connectors.push({ id: `drop-${groupIndex}`, d: `M${x} ${busY}V${only.top}`, order: 1 })
        return
      }
      const last = row[row.length - 1]
      if (!last) return
      connectors.push({ id: `drop-${groupIndex}`, d: `M${x} ${busY}V${last.cy}`, order: 1 })
      row.forEach((card, cardIndex) => {
        connectors.push({ id: `stub-${groupIndex}-${cardIndex}`, d: `M${x} ${card.cy}H${card.left}`, order: 2 })
      })
    })
  } else {
    const x = root.left + RAIL_INSET
    const row = topRows.flat()
    const last = row[row.length - 1]
    if (last) connectors.push({ id: 'trunk', d: `M${x} ${root.bottom}V${last.cy}`, order: 0 })
    row.forEach((card, cardIndex) => {
      connectors.push({ id: `stub-root-${cardIndex}`, d: `M${x} ${card.cy}H${card.left}`, order: 1 })
    })
  }

  for (const element of container.querySelectorAll<HTMLElement>('[data-org-card]')) {
    const depth = Number(element.dataset.depth)
    if (!(depth > 0)) continue
    const parent = cards.get(element.dataset.parentId ?? '')
    const child = cards.get(element.dataset.id ?? '')
    if (!parent || !child) continue
    const x = parent.left + RAIL_INSET
    connectors.push({
      id: `edge-${element.dataset.id}`,
      d: `M${x} ${parent.bottom}V${child.cy}H${child.left}`,
      order: 2 + depth,
    })
  }

  return connectors
}

/**
 * The organisation as a classic chart, each member a `StructCard`. The root
 * sits on top; its staff share one column; every division head gets a column
 * with their people beneath them. Columns sit side by side from `lg` up and
 * stack below that, where the connectors turn into an outline's rail — a real
 * phone layout, not a chart you scroll sideways.
 *
 * The connector lines draw themselves (`pathLength` 0 → 1) the first time the
 * chart scrolls into view, in the order the eye reads them. They exist only
 * after the cards have been measured on the client, so they are pure
 * decoration layered over a chart that already makes sense without them.
 */
export function OrgChart({ root, onOpen }: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, REVEAL_VIEWPORT)
  const mode = useMotionMode()
  const [connectors, setConnectors] = useState<Connector[]>([])

  const groups = chartGroups(root)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // The first observation arrives on its own, so this also does the
    // initial measurement — and again whenever a card or the chart resizes,
    // including when a hidden tab becomes visible.
    const observer = new ResizeObserver(() => setConnectors(measure(container)))
    observer.observe(container)
    for (const card of container.querySelectorAll('[data-org-card]')) observer.observe(card)
    return () => observer.disconnect()
  }, [])

  const drawn = inView && mode !== 'pending'

  return (
    <div ref={containerRef} className="relative">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-accent-fg"
      >
        {connectors.map((connector) => (
          <motion.path
            key={connector.id}
            d={connector.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            // Butt caps: a zero-length dash with square caps still paints a
            // dot, which would sit on screen before the line draws.
            initial={{ pathLength: 0 }}
            animate={{ pathLength: drawn ? 1 : 0 }}
            transition={mode === 'reduced' ? INSTANT : mech(0.55, 0.1 + connector.order * 0.14)}
          />
        ))}
      </svg>

      <div
        data-org-card
        data-id={root.id}
        data-depth="root"
        className="relative max-w-xl lg:mx-auto lg:max-w-sm"
      >
        <StructCard node={root} onOpen={onOpen} />
      </div>

      {/* `grid-cols-1` is not redundant: an implicit column is `auto` and grows
          to its widest item's min-content — here, a long unbreakable file path
          in a card's title bar — pushing the cards off a phone screen. */}
      <div
        className="relative mt-12 grid grid-cols-1 gap-y-12 lg:mt-16 lg:grid-cols-[repeat(var(--org-columns),minmax(0,1fr))] lg:gap-x-6"
        style={{ '--org-columns': groups.length } as React.CSSProperties}
      >
        {groups.map((group) => (
          <div
            key={group.key}
            data-org-group
            role="group"
            aria-label={group.label}
            className="relative max-w-xl pl-6 lg:max-w-none"
          >
            <p aria-hidden className="mb-4 font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">
              {`// ${group.label}`}
            </p>

            <ul className="flex flex-col gap-6">
              {group.items.map(({ node, depth }) => (
                <li
                  key={node.id}
                  data-org-card
                  data-id={node.id}
                  data-parent-id={node.parentId}
                  data-depth={depth}
                  className="relative"
                  style={{ marginLeft: depth * 24 }}
                >
                  <StructCard node={node} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
