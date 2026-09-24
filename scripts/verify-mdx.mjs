/**
 * Compiles every MDX body in the content directory.
 *
 *   node scripts/verify-mdx.mjs
 *
 * MDX is stricter than Markdown: a bare `<` or `{` in running text is read as
 * JSX or an expression and fails the build. This finds the file and line in a
 * second instead of in the middle of a Next.js build log.
 */

import { compile } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIRECTORIES = ['src/content/challenges', 'src/content/news']

const green = (s) => `\u001b[32m${s}\u001b[0m`
const red = (s) => `\u001b[31m${s}\u001b[0m`

let failures = 0
let checked = 0

for (const directory of DIRECTORIES) {
  const files = (await readdir(path.join(ROOT, directory))).filter((file) => file.endsWith('.mdx')).sort()
  for (const file of files) {
    const relative = `${directory}/${file}`
    checked += 1
    try {
      await compile(await readFile(path.join(ROOT, relative), 'utf8'), { remarkPlugins: [remarkGfm] })
    } catch (error) {
      failures += 1
      const where = error.place?.line ? `:${error.place.line}:${error.place.column ?? 0}` : ''
      console.log(`${red('GAGAL')} ${relative}${where}\n      ${String(error.reason ?? error.message).split('\n')[0]}`)
    }
  }
}

console.log(`\nberkas MDX diperiksa: ${checked}`)
if (failures > 0) {
  console.log(red(`${failures} berkas gagal dikompilasi.`))
  process.exitCode = 1
} else {
  console.log(green('Semua MDX terkompilasi bersih.'))
}
