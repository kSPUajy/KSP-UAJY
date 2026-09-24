import { Prompt } from '@/components/ui/Prompt'
import { TerminalWindow } from '@/components/ui/TerminalWindow'

type AuthShellProps = {
  /** Window title, e.g. `~/masuk`. */
  title: string
  command: string
  eyebrow: string
  heading: string
  intro: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * The frame for the sign-in and password pages: one narrow window centred
 * on the dotted desk, like a login prompt on an otherwise empty screen.
 */
export function AuthShell({ title, command, eyebrow, heading, intro, children, footer }: AuthShellProps) {
  return (
    <section
      data-accent="lime"
      className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 dot-grid sm:py-16"
    >
      <div className="w-full max-w-md">
        <TerminalWindow title={title} bodyClassName="p-6 sm:p-8">
          <Prompt>{command}</Prompt>
          <p className="mt-8 font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">{`// ${eyebrow}`}</p>
          <h1 className="mt-4 font-display text-[clamp(1.25rem,5vw,1.75rem)] leading-[1.25] tracking-[0.06em] text-fg uppercase">
            {heading}
          </h1>
          <div className="mt-4 text-[13px] leading-6 text-muted">{intro}</div>
          <div className="mt-8">{children}</div>
        </TerminalWindow>
        {footer ? <div className="mt-6 text-[12px] leading-6 text-muted">{footer}</div> : null}
      </div>
    </section>
  )
}
