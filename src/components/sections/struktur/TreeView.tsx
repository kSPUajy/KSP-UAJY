'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { CALM, INSTANT, mech } from '@/components/motion/variants'
import { Prompt } from '@/components/ui/Prompt'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { countEntries } from '@/lib/org'
import type { OrgNode } from '@/lib/org'
import { cn } from '@/lib/utils'

type TreeViewProps = {
  roots: readonly OrgNode[]
  /** The top line, `kelompok-studi-pemrograman`. */
  rootLabel: string
  onOpen: (slug: string) => void
}

/** Reduced motion: the fold snaps open or shut; only the fade remains. */
const FOLD_REDUCED = { ...CALM, height: INSTANT }

type RowProps = {
  node: OrgNode
  /** One entry per ancestor: was that ancestor the last of its siblings? */
  ancestorsLast: readonly boolean[]
  isLast: boolean
  collapsed: ReadonlySet<string>
  onToggle: (id: string) => void
  onOpen: (slug: string) => void
}

/**
 * The comment beside an entry says what the name does not: a role-named
 * entry gets the person, a person-named entry gets the role.
 */
function annotation(node: OrgNode): string {
  const who = node.fileName === node.slug ? node.jabatan.toLowerCase() : node.nama
  return `${who} · ${node.angkatan}`
}

function TreeRow({ node, ancestorsLast, isLast, collapsed, onToggle, onOpen }: RowProps) {
  const reduced = useReducedMotion()
  const isDirectory = node.children.length > 0
  const expanded = isDirectory && !collapsed.has(node.id)
  const listId = `org-tree-${node.id}`

  // Exactly what `tree` prints: a rail for every ancestor that still has
  // siblings below it, blank space for one that was last, then the branch.
  const prefix = ancestorsLast.map((last) => (last ? '    ' : '│   ')).join('') + (isLast ? '└── ' : '├── ')

  return (
    <li>
      <div className="flex items-baseline whitespace-pre transition-colors hover:bg-surface-2">
        <span aria-hidden className="shrink-0 text-dim">
          {prefix}
        </span>

        {isDirectory ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => onToggle(node.id)}
            // A margin, not a space: whitespace between flex items is dropped.
            className="mr-[1ch] shrink-0 text-accent-fg hover:text-fg"
          >
            <span aria-hidden>{expanded ? '[-]' : '[+]'}</span>
            <span className="sr-only">Anggota di bawah {node.nama}</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onOpen(node.slug)}
          className={cn(
            'shrink-0 decoration-2 underline-offset-4 hover:underline',
            isDirectory ? 'font-bold text-accent-fg decoration-accent-fg' : 'text-fg decoration-accent-fg',
          )}
        >
          {node.fileName}
          {isDirectory ? <span aria-hidden>/</span> : null}
          <span className="sr-only">
            {' '}
            — {node.nama}, {node.jabatan}
          </span>
        </button>

        <span aria-hidden className="ml-3 min-w-0 truncate text-syn-comment">
          {`// ${annotation(node)}`}
        </span>
      </div>

      {isDirectory ? (
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.ul
              key="children"
              id={listId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduced ? FOLD_REDUCED : mech(0.3)}
              className="overflow-hidden"
            >
              {node.children.map((child, index) => (
                <TreeRow
                  key={child.id}
                  node={child}
                  ancestorsLast={[...ancestorsLast, isLast]}
                  isLast={index === node.children.length - 1}
                  collapsed={collapsed}
                  onToggle={onToggle}
                  onOpen={onOpen}
                />
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      ) : null}
    </li>
  )
}

/**
 * The organisation as `tree` would print it, built recursively from the
 * `parentId` hierarchy. Directories fold with `[-]`/`[+]`; every name opens
 * that person's panel.
 *
 * Height is the one property here animated outside transform and opacity —
 * a fold cannot be expressed any other way. Reduced motion snaps it.
 */
export function TreeView({ roots, rootLabel, onOpen }: TreeViewProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set())
  const { directories, files } = countEntries(roots)

  const toggle = (id: string): void => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <TerminalWindow title="~/struktur — tree" tone="code">
      <Prompt>tree {rootLabel}/</Prompt>

      <div className="mt-5 text-[11px] leading-6 sm:text-xs">
        <p className="font-bold text-accent-fg">{rootLabel}/</p>
        <ul aria-label="Struktur organisasi">
          {roots.map((root, index) => (
            <TreeRow
              key={root.id}
              node={root}
              ancestorsLast={[]}
              isLast={index === roots.length - 1}
              collapsed={collapsed}
              onToggle={toggle}
              onOpen={onOpen}
            />
          ))}
        </ul>
      </div>

      <p className="mt-5 text-[11px] leading-6 text-dim">
        {directories} directories, {files} files
      </p>
    </TerminalWindow>
  )
}
