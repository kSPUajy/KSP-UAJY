import { cn } from '@/lib/utils'

type TentorQuoteProps = {
  quote: string
  author: string
  className?: string
}

/**
 * A tentor's line, set as a C block comment:
 *
 *     /*
 *      * Pointer itu bukan hal sulit…
 *      *\/
 *
 * The delimiters and the leading asterisk are drawn in comment colour and
 * hidden from assistive tech; the words themselves stay at full contrast,
 * because they are the point, not the decoration.
 */
export function TentorQuote({ quote, author, className }: TentorQuoteProps) {
  return (
    <figure className={cn('font-mono', className)}>
      <span aria-hidden className="block text-sm leading-7 text-syn-comment">
        {'/*'}
      </span>
      <blockquote className="flex gap-3 text-[15px] leading-7 text-fg sm:text-base sm:leading-8">
        <span aria-hidden className="shrink-0 pl-[1ch] text-syn-comment">
          *
        </span>
        <p className="italic">{quote}</p>
      </blockquote>
      <figcaption className="flex gap-3 text-sm leading-7 text-syn-comment">
        <span aria-hidden className="shrink-0 pl-[1ch]">
          *
        </span>
        <span>— {author}</span>
      </figcaption>
      <span aria-hidden className="block pl-[1ch] text-sm leading-7 text-syn-comment">
        {'*/'}
      </span>
    </figure>
  )
}
