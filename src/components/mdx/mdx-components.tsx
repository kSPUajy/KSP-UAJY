import Link from 'next/link'
import { Children, isValidElement } from 'react'
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'

import { CodeBlock } from '@/components/ui/CodeBlock'
import { headingId } from '@/lib/article'
import { cn } from '@/lib/utils'

/**
 * How MDX bodies render: news articles and challenge statements alike.
 *
 * Prose is IBM Plex Sans at a 68ch measure — the one place the type spec
 * allows it. Everything that is code, or reads like code, stays in JetBrains
 * Mono: inline code, fenced blocks, table cells, heading markers.
 */

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/**
 * A fenced block arrives as `<pre><code className="language-c">`. C goes to
 * the real highlighter with line numbers and a copy button. An unlabelled
 * fence in these documents is always an output format — `rata-rata: X.XX` —
 * so it is printed as plain terminal output.
 */
function Pre({ children, copyable = true }: ComponentPropsWithoutRef<'pre'> & { copyable?: boolean }) {
  const code = Children.toArray(children).find(
    (child): child is ReactElement<{ className?: string; children?: ReactNode }> => isValidElement(child),
  )
  const language = /language-(\w+)/.exec(code?.props.className ?? '')?.[1]
  const source = textOf(code?.props.children).replace(/\n$/, '')

  if (language === 'c') {
    return <CodeBlock code={source} filename="~/contoh.c" copyable={copyable} className="my-8" />
  }

  return (
    <div className="my-8 border-2 border-line bg-code-bg">
      <p aria-hidden className="border-b-2 border-line-soft px-4 py-1.5 text-[11px] leading-5 text-dim">
        {'// format keluaran'}
      </p>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-fg" tabIndex={0}>
        <code>{source}</code>
      </pre>
    </div>
  )
}

/**
 * Section headings carry an id, so an article's table of contents — built
 * from the source by `mdxHeadings` — and a pasted link can both land on them.
 */
function Heading({ level, children }: { level: 2 | 3; children?: ReactNode }) {
  const Tag = level === 2 ? 'h2' : 'h3'
  return (
    <Tag
      id={headingId(textOf(children))}
      className={cn(
        'scroll-mt-24 font-mono font-bold tracking-tight text-fg',
        level === 2 ? 'mt-14 mb-5 text-xl leading-8' : 'mt-10 mb-4 text-lg leading-7',
      )}
    >
      <span aria-hidden className="mr-2 text-accent-fg">
        {'#'.repeat(level)}
      </span>
      {children}
    </Tag>
  )
}

function Anchor({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) {
  const className =
    'text-accent-fg underline decoration-2 underline-offset-4 transition-colors hover:text-fg'
  if (href.startsWith('/') || href.startsWith('#')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
      {children}
      <span aria-hidden> ↗</span>
      <span className="sr-only"> (membuka tab baru)</span>
    </a>
  )
}

/**
 * `<Callout type="note">` — a C block comment with a label, for asides that
 * must not be missed. `note` takes the section accent, `warning` is always
 * orange.
 */
export function Callout({ type = 'note', children }: { type?: 'note' | 'warning'; children?: ReactNode }) {
  const label = type === 'warning' ? 'WARNING' : 'NOTE'
  return (
    <aside
      data-accent={type === 'warning' ? 'orange' : undefined}
      aria-label={type === 'warning' ? 'Peringatan' : 'Catatan'}
      className="my-8 border-2 border-accent-fg bg-code-bg px-5 py-4 font-mono"
    >
      <p aria-hidden className="text-xs leading-5 font-bold text-accent-fg">{`/* ${label} */`}</p>
      <div className="mt-2 font-sans text-[15px] leading-7 text-fg [&>p]:m-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  )
}

export const mdxComponents = {
  h1: ({ children }: { children?: ReactNode }) => <Heading level={2}>{children}</Heading>,
  h2: ({ children }: { children?: ReactNode }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }: { children?: ReactNode }) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }: { children?: ReactNode }) => <Heading level={3}>{children}</Heading>,
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="my-5 font-sans text-[17px] leading-[1.75] text-fg" {...props} />,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold text-fg" {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => <em className="italic" {...props} />,
  a: Anchor,
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul
      className="my-5 space-y-2 font-sans text-[17px] leading-[1.75] text-fg [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:font-mono [&>li]:before:text-accent-fg [&>li]:before:content-['-']"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol
      className="my-5 list-decimal space-y-2 pl-6 font-sans text-[17px] leading-[1.75] text-fg marker:font-mono marker:text-accent-fg"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code
      className="border border-line-soft bg-code-bg px-1.5 py-px font-mono text-[0.86em] text-fg [overflow-wrap:anywhere]"
      {...props}
    />
  ),
  pre: Pre,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="my-8 border-l-4 border-accent pl-5 text-muted [&>p]:text-muted" {...props} />
  ),
  hr: () => (
    <p aria-hidden className="my-12 font-mono text-xs text-dim">
      {'/* ---------------------------------------------------------------- */'}
    </p>
  ),
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-8 overflow-x-auto border-2 border-line" tabIndex={0}>
      <table className="w-full border-collapse font-mono text-[13px] leading-6" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th className="border-b-2 border-line bg-surface-2 px-3 py-2 text-left text-[11px] tracking-[0.08em] text-muted uppercase" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td className="border-b-2 border-line-soft px-3 py-2 align-top text-fg [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-syn-ident" {...props} />
  ),
  Callout,
}

/**
 * The same set for the admin panel's live preview, which is rendered by a
 * Server Action: identical output, minus the one client component (the copy
 * button) that the admin page does not bundle.
 */
export const previewMdxComponents = {
  ...mdxComponents,
  pre: (props: ComponentPropsWithoutRef<'pre'>) => <Pre {...props} copyable={false} />,
}
