'use client'

import { useId } from 'react'

type FlagProps = {
  name: string
  /** Read after the flag name, for assistive tech. */
  description: string
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}

/**
 * One compiler flag: `--difficulty=` followed by a native select, so it keeps
 * every platform's own picker and keyboard behaviour. The dashes and the `=`
 * are hidden from assistive tech; the flag's name stays in the accessible
 * name, so a voice user can say what they see.
 */
export function Flag({ name, description, value, options, onChange }: FlagProps) {
  const id = useId()
  return (
    <span className="inline-flex items-baseline">
      <label htmlFor={id} className="text-muted">
        <span aria-hidden>--</span>
        {name}
        <span aria-hidden>=</span>
        <span className="sr-only"> ({description})</span>
      </label>
      <span className="relative inline-flex">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="cursor-pointer appearance-none border-b-2 border-accent-fg bg-transparent py-0.5 pr-5 pl-0.5 text-accent-fg"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface text-fg">
              {option.label}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute top-1/2 right-0.5 -translate-y-1/2 text-[10px] text-accent-fg">
          ▾
        </span>
      </span>
    </span>
  )
}

type CommandBarProps = {
  /** The program being "run", e.g. `./challenge`. */
  command: string
  /** Rendered at the right end — usually a reset button. */
  trailing?: React.ReactNode
  children: React.ReactNode
}

/**
 * The line a set of `Flag`s sits on: `$ ./challenge --difficulty=… --sort=…`.
 * Marked `data-needs-js` — the pages that use it are static, so without
 * script its flags could never apply.
 */
export function CommandBar({ command, trailing, children }: CommandBarProps) {
  return (
    <div data-needs-js className="border-2 border-line bg-code-bg hard-shadow">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3 px-4 py-4 font-mono text-xs leading-7 sm:px-6 sm:text-[13px]">
        <span className="text-muted">
          <span aria-hidden className="text-accent-fg">
            $
          </span>{' '}
          {command}
        </span>
        {children}
        {trailing ? <span className="ml-auto">{trailing}</span> : null}
      </div>
    </div>
  )
}

type TextFlagProps = {
  name: string
  /** Read after the flag name, for assistive tech. */
  description: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

/**
 * A free-text flag, `--grep="…"`. The quotes are drawn around the field and
 * hidden from assistive tech, like the dashes.
 */
export function TextFlag({ name, description, value, placeholder, onChange }: TextFlagProps) {
  const id = useId()
  return (
    <span className="inline-flex min-w-0 items-baseline">
      <label htmlFor={id} className="shrink-0 text-muted">
        <span aria-hidden>--</span>
        {name}
        <span aria-hidden>=&quot;</span>
        <span className="sr-only"> ({description})</span>
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        className="w-36 min-w-0 border-b-2 border-accent-fg bg-transparent px-0.5 py-0.5 text-accent-fg placeholder:text-dim sm:w-44 [&::-webkit-search-cancel-button]:hidden"
      />
      <span aria-hidden className="shrink-0 text-muted">
        &quot;
      </span>
    </span>
  )
}
