import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/database.types'

/**
 * Cache tags, one per kind of content an admin can change. A page that
 * reads modules is tagged `modul`; saving a module calls
 * `revalidateTag('modul', 'max')` and every such page refreshes on its next
 * visit. Nothing else ever has to know which pages read what.
 */
export const TAGS = {
  modul: 'modul',
  berita: 'berita',
  challenge: 'challenge',
  pendaftaran: 'pendaftaran',
  anggota: 'anggota',
  tentor: 'tentor',
  galeri: 'galeri',
} as const

export type ContentTag = (typeof TAGS)[keyof typeof TAGS]

function env(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} belum diisi. Di laptop: isi .env.local (lihat .env.example). Di Vercel: Project Settings → Environment Variables, lalu redeploy.`,
    )
  }
  return value
}

/**
 * A read-only client for public content, as the anonymous visitor.
 *
 * It never touches cookies, so pages built on it stay static. Every request
 * it makes goes through `fetch` with the given tags and an hour's revalidation: the
 * result is stored in Next's data cache until an admin change invalidates
 * the tag, and for an hour at most — so an edit made outside the panel
 * (the Supabase table editor, a script) still shows up within the hour.
 *
 * Row-level security still applies — this is the publishable key, so it
 * sees exactly what an anonymous visitor may see (published news only).
 */
export function publicDb(...tags: ContentTag[]) {
  return createClient<Database>(env('NEXT_PUBLIC_SUPABASE_URL'), env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { tags, revalidate: 3600 } }),
    },
  })
}
