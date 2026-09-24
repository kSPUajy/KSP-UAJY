type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Printed as a flag, `--npm`, and read as a plain label. */
  label: string
  /** Shown under the input; tied to it with `aria-describedby`. */
  hint?: React.ReactNode
  /** Rendered after the input inside its frame, e.g. a show-password toggle. */
  trailing?: React.ReactNode
  id: string
}

/**
 * A form field in the site's terminal voice: the label reads as a
 * command-line flag, the input is a hard-edged well on the code background,
 * and focus draws the accent around it. Errors are the form's job, announced
 * once in its own alert — not repeated field by field.
 */
export function Field({ label, hint, trailing, id, className, ...input }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[11px] leading-5 tracking-[0.06em] text-muted">
        <span aria-hidden className="text-accent-fg">
          --
        </span>
        {label}
      </label>
      <div className="mt-2 flex items-stretch border-2 border-line bg-code-bg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-fg">
        <input
          id={id}
          aria-describedby={hintId}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 font-mono text-sm text-fg outline-none placeholder:text-dim"
          {...input}
        />
        {trailing}
      </div>
      {hint ? (
        <p id={hintId} className="mt-2 text-[11px] leading-5 text-dim">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
