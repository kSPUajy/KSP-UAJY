import 'server-only'

import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'

import { mdxComponents, previewMdxComponents } from '@/components/mdx/mdx-components'
import { cn } from '@/lib/utils'

type MdxContentProps = {
  /** Raw MDX, exactly as the data layer returns it. */
  source: string
  className?: string
  /** Admin preview: render without client components (see `previewMdxComponents`). */
  preview?: boolean
}

/**
 * Compiles an MDX string on the server and renders it with the site's
 * component set. The body arrives as a string rather than an imported file so
 * the source can move to a database without this changing.
 *
 * Every route that uses it is statically generated, so compilation happens
 * once per page at build time and ships as plain HTML — no MDX runtime ever
 * reaches the browser. `evaluate` runs the compiled module, which is only
 * acceptable because every body is written by the club itself.
 */
export async function MdxContent({ source, className, preview = false }: MdxContentProps) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  })

  return (
    <div className={cn('min-w-0', className)}>
      <Content components={preview ? previewMdxComponents : mdxComponents} />
    </div>
  )
}
