import { CREATOR, KOMBO } from '@/lib/creator'
import { siteConfig } from '@/site.config'

/** humanstxt.org: who is behind the site. Only clues, as everywhere else. */
export function GET() {
  const body = `/* TEAM */
  Dibuat oleh: ▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒▒▒
  Angkatan: ${CREATOR.angkatan}
  NPM: ${CREATOR.npmMask}
  Status: ${CREATOR.role}
  Petunjuk: ketik "whoami" di halaman mana saja.
  [?/5]: ${KOMBO.map((piece) => piece.keys).join('  ')}

/* THANKS */
  Semua tentor dan pengurus ${siteConfig.name}.

/* SITE */
  Bahasa: Indonesia
  Stack: Next.js, Supabase, Tailwind, Motion
  Kompilasi: gcc -std=c17 -Wall -Wextra
`
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

export const dynamic = 'force-static'
