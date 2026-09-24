'use client'

import { useId, useState, useTransition } from 'react'

import { pratinjauMdx } from '@/app/admin/shared-actions'
import { TextArea } from '@/components/admin/form'
import { cn } from '@/lib/utils'

const DEFAULT_HINT =
  'Markdown + tabel GFM. ## untuk subjudul, ```c untuk kode C, <Callout type="note">…</Callout> untuk catatan.'

/**
 * Write MDX, or see it rendered by the same pipeline as the public page.
 * The textarea stays mounted in both views, so its value is always part of
 * the form that submits it.
 */
export function MdxEditor({
  name,
  label,
  defaultValue,
  error,
  hint = DEFAULT_HINT,
  rows = 20,
}: {
  name: string
  label: string
  defaultValue?: string
  error?: string
  hint?: string
  rows?: number
}) {
  const uid = useId()
  const [source, setSource] = useState(defaultValue ?? '')
  const [view, setView] = useState<'tulis' | 'pratinjau'>('tulis')
  const [preview, setPreview] = useState<React.ReactNode>(null)
  const [pending, startTransition] = useTransition()

  const showPreview = (): void => {
    setView('pratinjau')
    startTransition(async () => setPreview(await pratinjauMdx(source)))
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex border-b-2 border-line">
        {(['tulis', 'pratinjau'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={view === tab}
            onClick={tab === 'tulis' ? () => setView('tulis') : showPreview}
            className={cn(
              'border-r-2 border-line-soft px-4 py-2 text-xs',
              view === tab ? 'bg-surface text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            <span aria-hidden className="text-dim">
              --
            </span>
            {tab}
          </button>
        ))}
      </div>

      <div hidden={view !== 'tulis'}>
        <TextArea
          id={`${uid}-${name}`}
          name={name}
          label={label}
          code
          rows={rows}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          className="pt-4"
          hint={hint}
          error={error}
        />
      </div>
      {view === 'pratinjau' ? (
        <div className="measure min-h-40 border-2 border-t-0 border-line-soft px-5 py-4 font-sans text-[17px]">
          {pending ? <p className="font-mono text-xs text-muted">merender…</p> : preview}
        </div>
      ) : null}
      {view === 'pratinjau' && error ? (
        <p className="mt-2 text-[12px] leading-5 text-fg">
          <span className="text-accent-fg">error:</span> {error}
        </p>
      ) : null}
    </div>
  )
}
