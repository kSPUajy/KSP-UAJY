/**
 * Plain-text teasers from MDX bodies.
 *
 * The content model has no separate teaser field for challenges, and adding
 * one would mean writing every opening paragraph twice. The first paragraph of
 * the statement already is the teaser, so this lifts it out and strips the
 * Markdown. It is a string transform, not an MDX compile: it runs anywhere and
 * costs nothing.
 */

/** Blocks that are not prose: headings, fences, lists, quotes, JSX, imports. */
const NON_PROSE = /^(#{1,6}\s|```|~~~|[-*+]\s|\d+\.\s|>|<|import\s|export\s|\|)/

const CODE_PLACEHOLDER = '\u0000'

function stripInlineMarkdown(block: string): string {
  // Park code spans first: `*(p + i)` must not be read as the start of an
  // emphasis run, and `kapasitas_baru` must keep its underscore.
  const codeSpans: string[] = []
  let text = block.replace(/`([^`]+)`/g, (_, code: string) => {
    codeSpans.push(code)
    return `${CODE_PLACEHOLDER}${codeSpans.length - 1}${CODE_PLACEHOLDER}`
  })

  text = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/(?<![\w*])\*(?=\S)([^*]*?\S)\*(?![\w*])/g, '$1')
    .replace(/(?<!\w)_(?=\S)([^_]*?\S)_(?!\w)/g, '$1')

  const restore = new RegExp(`${CODE_PLACEHOLDER}(\\d+)${CODE_PLACEHOLDER}`, 'g')
  return text.replace(restore, (_, index: string) => codeSpans[Number(index)] ?? '')
}

/**
 * The opening paragraph as plain text, trimmed to `maxLength` characters at
 * the last whole sentence that fits — or the last whole word, with an ellipsis,
 * when even the first sentence is too long.
 */
export function mdxExcerpt(source: string, maxLength = 320): string {
  const paragraph = source
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !NON_PROSE.test(block))

  if (!paragraph) return ''

  const text = stripInlineMarkdown(paragraph).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text

  const window = text.slice(0, maxLength)
  const sentenceEnd = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('? '),
    window.lastIndexOf('! '),
  )
  if (sentenceEnd > maxLength * 0.4) return window.slice(0, sentenceEnd + 1)

  const wordEnd = window.lastIndexOf(' ')
  return `${window.slice(0, wordEnd > 0 ? wordEnd : maxLength).replace(/[,;:—–-]+$/, '')}…`
}
