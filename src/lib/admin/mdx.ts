import 'server-only'

import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'

/**
 * MDX is stricter than Markdown: a stray `<` or `{` is read as JSX and
 * breaks the page. Compiling before saving turns that into a message with a
 * line number, so a broken article or problem statement never goes live.
 */
export async function mdxProblem(source: string): Promise<string | null> {
  try {
    await compile(source, { remarkPlugins: [remarkGfm] })
    return null
  } catch (error) {
    const place = (error as { place?: { line?: number } }).place
    const reason = String((error as { reason?: string }).reason ?? (error as Error).message).split('\n')[0]
    return `${place?.line ? `Baris ${place.line}: ` : ''}${reason}. Tanda < atau { di teks biasa perlu ditulis sebagai \\< atau \\{.`
  }
}
