/**
 * Facts about an MDX body that are cheaper to read off the source than to
 * compile for: its section headings and how long it takes to read. Both are
 * plain string work and run anywhere.
 */

import { slugify } from '@/lib/format'

export type ArticleHeading = {
  id: string
  text: string
}

/** Fenced code, which can hold lines that look like headings. */
const FENCE = /^(```|~~~)[\s\S]*?^\1/gm

/** Inline Markdown a heading may carry, reduced to its text. */
function plainHeading(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|\*|_)(\S[\s\S]*?\S|\S)\1/g, '$2')
    .trim()
}

/**
 * The anchor a heading gets. `mdx-components` derives the same id from the
 * rendered heading's text, so a table of contents built here always points
 * at something.
 */
export const headingId = (text: string): string => slugify(text)

/** Every `##` heading, in order — the level the table of contents lists. */
export function mdxHeadings(source: string): ArticleHeading[] {
  return source
    .replace(/\r\n/g, '\n')
    .replace(FENCE, '')
    .split('\n')
    .flatMap((line) => {
      const match = /^##\s+(.+?)\s*#*\s*$/.exec(line)
      if (!match?.[1]) return []
      const text = plainHeading(match[1])
      return text ? [{ id: headingId(text), text }] : []
    })
}

/** Words a minute for Indonesian prose read on a screen, with code in it. */
const WORDS_PER_MINUTE = 180

/** Whole minutes, never less than one. */
export function readingMinutes(source: string): number {
  const words = source.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
