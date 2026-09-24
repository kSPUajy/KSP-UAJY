/** The top of every admin page: the command, the title, a line of context. */
export function AdminHeading({
  command,
  title,
  description,
  actions,
}: {
  command: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b-2 border-line-soft pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] text-dim">
          <span aria-hidden className="text-accent-fg">
            ${' '}
          </span>
          {command}
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.25rem,3vw,1.75rem)] leading-[1.25] tracking-[0.06em] text-fg uppercase">
          {title}
        </h1>
        {description ? <div className="mt-3 max-w-prose text-[13px] leading-6 text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  )
}
