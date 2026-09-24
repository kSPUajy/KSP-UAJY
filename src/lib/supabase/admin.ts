import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/database.types'
import type { ContentTag } from '@/lib/supabase/public'

/**
 * The secret-key client. It bypasses row-level security entirely, so it is
 * only ever used after the caller's own permission has been checked — to
 * create accounts, reset passwords, and clear the first-login flag, which no
 * member may do through the API themselves.
 */
export function createSupabaseAdmin(...tags: ContentTag[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY belum diisi di .env.local.')

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // With tags the reads join Next's data cache like `publicDb` — only for
    // aggregate figures safe to show anyone (counts, never rows).
    ...(tags.length > 0
      ? { global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, next: { tags, revalidate: 3600 } }) } }
      : {}),
  })
}
