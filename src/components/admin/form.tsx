'use client'

import { createContext, useContext, useEffect, useRef, useTransition } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/Button'
import type { ButtonVariant } from '@/components/ui/Button'
import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

/**
 * Admin form building blocks. They share the terminal field style of
 * `Field` — the label as a `--flag`, a hard-edged well, the accent on focus —
 * and each prints its own error underneath.
 */

const PendingContext = createContext(false)

/**
 * A form that keeps what was typed when the action fails.
 *
 * A plain `<form action={…}>` is reset by React as soon as its action
 * finishes — including when the server answered "fix this field", which
 * would wipe an entire article because of one stray `{`. This submits the
 * same FormData inside a transition instead, so nothing is reset unless
 * `resetOnSuccess` asks for it after a successful save.
 */
export function AdminForm({
  action,
  state,
  resetOnSuccess = false,
  accent,
  className,
  children,
}: {
  action: (formData: FormData) => void
  state?: { ok: boolean } | undefined
  resetOnSuccess?: boolean
  /** Destructive forms read orange. */
  accent?: AccentName
  className?: string
  children: React.ReactNode
}) {
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (resetOnSuccess && state?.ok) formRef.current?.reset()
  }, [resetOnSuccess, state])

  return (
    <PendingContext.Provider value={pending}>
      <form
        ref={formRef}
        data-accent={accent}
        className={className}
        onSubmit={(event) => {
          event.preventDefault()
          const submitter = (event.nativeEvent as SubmitEvent).submitter
          const formData = new FormData(event.currentTarget, submitter)
          startTransition(() => action(formData))
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  )
}

const WELL =
  'mt-2 w-full border-2 border-line bg-code-bg px-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-fg'

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] leading-5 tracking-[0.06em] text-muted">
      <span aria-hidden className="text-accent-fg">
        --
      </span>
      {children}
    </label>
  )
}

function Below({ id, hint, error }: { id: string; hint?: React.ReactNode; error?: string }) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[11px] leading-5 text-dim">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[12px] leading-5 text-fg">
          <span className="text-accent-fg">error:</span> {error}
        </p>
      ) : null}
    </>
  )
}

const describedBy = (id: string, hint?: unknown, error?: string): string | undefined =>
  [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined

type Common = { id: string; label: string; hint?: React.ReactNode; error?: string; className?: string }

export function TextInput({
  id,
  label,
  hint,
  error,
  className,
  ...input
}: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        name={input.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(WELL, 'h-11')}
        {...input}
      />
      <Below id={id} hint={hint} error={error} />
    </div>
  )
}

export function TextArea({
  id,
  label,
  hint,
  error,
  className,
  code = false,
  ...area
}: Common & { code?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={area.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        spellCheck={code ? false : undefined}
        className={cn(WELL, 'min-h-28 resize-y py-2.5 leading-6', code && 'text-[13px] ligatures-none')}
        {...area}
      />
      <Below id={id} hint={hint} error={error} />
    </div>
  )
}

export function Select({
  id,
  label,
  hint,
  error,
  className,
  options,
  ...select
}: Common & { options: ReadonlyArray<{ value: string; label: string }> } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={select.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(WELL, 'h-11 cursor-pointer')}
        {...select}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface text-fg">
            {option.label}
          </option>
        ))}
      </select>
      <Below id={id} hint={hint} error={error} />
    </div>
  )
}

/** A set of checkboxes that submit as one repeated field. */
export function CheckboxGroup({
  name,
  legend,
  options,
  defaultValues = [],
  error,
}: {
  name: string
  legend: string
  options: readonly string[]
  defaultValues?: readonly string[]
  error?: string
}) {
  return (
    <fieldset>
      <legend className="text-[11px] leading-5 tracking-[0.06em] text-muted">
        <span aria-hidden className="text-accent-fg">
          --
        </span>
        {legend}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex cursor-pointer items-center gap-2 border-2 border-line-soft px-2.5 py-1.5 text-[12px] text-muted has-checked:border-accent-fg has-checked:text-fg"
          >
            <input type="checkbox" name={name} value={option} defaultChecked={defaultValues.includes(option)} className="accent-(--accent)" />
            {option}
          </label>
        ))}
      </div>
      <Below id={`${name}-group`} error={error} />
    </fieldset>
  )
}

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-fg">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-(--accent)" />
      {label}
    </label>
  )
}

/** Pending-aware submit button; must sit inside the form it submits. */
export function SubmitButton({
  children,
  pendingLabel = 'menyimpan…',
  variant,
  name,
  value,
}: {
  children: React.ReactNode
  pendingLabel?: string
  variant?: ButtonVariant
  name?: string
  value?: string
}) {
  const status = useFormStatus()
  const pending = useContext(PendingContext) || status.pending
  return (
    <Button type="submit" size="md" variant={variant} disabled={pending} name={name} value={value}>
      {pending ? pendingLabel : children}
    </Button>
  )
}

/** The one outcome line of a form: success in the accent, failure as an alert. */
export function FormMessage({ state }: { state: { ok: boolean; message?: string } | undefined }) {
  if (!state?.message) return null
  return (
    <p
      role={state.ok ? 'status' : 'alert'}
      className={cn('border-l-2 pl-3 text-[12px] leading-6', state.ok ? 'border-accent-fg text-accent-fg' : 'border-accent-fg text-fg')}
    >
      {state.ok ? <span aria-hidden>[ok] </span> : <span className="text-accent-fg">error: </span>}
      {state.message}
    </p>
  )
}
