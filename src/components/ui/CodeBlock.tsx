import { CopyButton } from '@/components/ui/CopyButton'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { AccentName } from '@/lib/accent'
import { SYNTAX_CLASS, tokenizeCLines } from '@/lib/c-highlight'
import { cn } from '@/lib/utils'

type CodeBlockProps = {
  code: string
  /** Path-style window title, e.g. `~/tentor/andi/quicksort.c`. */
  filename?: string
  accent?: AccentName
  showLineNumbers?: boolean
  /** Caps the height and scrolls vertically. For long winning solutions. */
  maxHeight?: string
  /** Short note printed under the block. */
  caption?: string
  /** Drops the window chrome, for code already sitting inside a panel. */
  bare?: boolean
  /**
   * The copy button is a client component. Markup sent from a Server Action
   * (the admin panel's MDX preview) may only reference client components the
   * receiving page already bundles, so the preview renders without it.
   */
  copyable?: boolean
  className?: string
}

/**
 * Syntax-highlighted C.
 *
 * A server component: the tokenizer runs at build time and ships plain spans,
 * so a page full of code costs nothing on the client beyond the copy button.
 *
 * Code blocks are the one place the three-accent rule is suspended. Syntax
 * highlighting is inherently multi-hue, and "90s IDE" is the reference the
 * whole art direction is built on — a two-colour code block would read as a
 * quote, not as source.
 */
export function CodeBlock({
  code,
  filename = '~/snippet.c',
  accent,
  showLineNumbers = true,
  maxHeight,
  caption,
  bare = false,
  copyable = true,
  className,
}: CodeBlockProps) {
  const lines = tokenizeCLines(code)
  // Room for the longest line number plus the rail's pl-4 + pr-3 — the width
  // is border-box, so without the padding two-digit numbers run into the code.
  const gutterWidth = `calc(${lines.length.toString().length}ch + 1.75rem)`

  const body = (
    <pre
      className="overflow-x-auto py-4 text-[12px] leading-6"
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      tabIndex={0}
    >
      <code className="block w-max min-w-full">
        {lines.map((tokens, index) => (
          <span key={index} className="flex">
            {showLineNumbers ? (
              <span
                aria-hidden
                className="sticky left-0 shrink-0 bg-code-bg pr-3 pl-4 text-right text-dim tabular-nums select-none"
                style={{ width: gutterWidth }}
              >
                {index + 1}
              </span>
            ) : null}

            <span className={cn('whitespace-pre pr-4', !showLineNumbers && 'pl-4')}>
              {tokens.length === 0
                ? ' '
                : tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={SYNTAX_CLASS[token.type]}>
                      {token.value}
                    </span>
                  ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  )

  if (bare) {
    return (
      <div data-accent={accent} className={cn('border-2 border-line bg-code-bg', className)}>
        {body}
      </div>
    )
  }

  return (
    <figure data-accent={accent} className={className}>
      <TerminalWindow
        title={filename}
        tone="code"
        bodyClassName="p-0"
        actions={copyable ? <CopyButton text={code} /> : undefined}
      >
        {body}
      </TerminalWindow>

      {caption ? (
        <figcaption className="mt-3 text-[11px] leading-5 text-dim">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
