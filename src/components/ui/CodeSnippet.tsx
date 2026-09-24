import { SYNTAX_CLASS, tokenizeCLines } from '@/lib/c-highlight'
import { cn } from '@/lib/utils'

/**
 * A few lines of highlighted C with no chrome at all — no window, no line
 * numbers, no copy button, and not focusable. For C used as furniture inside
 * another component (a struct card's declaration), where `CodeBlock` would
 * add a second frame and a tab stop nobody needs.
 */
export function CodeSnippet({ code, className }: { code: string; className?: string }) {
  const lines = tokenizeCLines(code)

  return (
    <code className={cn('block font-mono text-[11px] leading-5 whitespace-pre', className)}>
      {lines.map((tokens, index) => (
        <span key={index} className="block">
          {tokens.length === 0
            ? ' '
            : tokens.map((token, tokenIndex) => (
                <span key={tokenIndex} className={SYNTAX_CLASS[token.type]}>
                  {token.value}
                </span>
              ))}
        </span>
      ))}
    </code>
  )
}
