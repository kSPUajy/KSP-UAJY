import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Long-form bodies are read from disk, never inlined in the TypeScript
 * modules. MDX statements stay editable as Markdown, and every C file stays a
 * real, compilable translation unit that `scripts/verify-c.mjs` can hand
 * straight to the compiler.
 *
 * News, challenge statements and winning solutions now live in the database;
 * their files under `src/content` are only the seed (`npm run seed:generate`).
 * Tentor snippets are still read from here.
 */

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content')

async function read(...segments: string[]): Promise<string> {
  const file = path.join(CONTENT_ROOT, ...segments)
  const raw = await readFile(file, 'utf8')
  return raw.replace(/\r\n/g, '\n').trim()
}

export const readTentorSnippet = (slug: string): Promise<string> =>
  read('snippets', `${slug}.c`)

