import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/database.types'

/**
 * The secret-key client. It bypasses row-level security entirely, so it is
 * only ever used after the caller's own permission has been checked — to
 * create accounts, reset passwords, and clear the first-login flag, which no
 * member may do through the API themselves.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY belum diisi di .env.local.')

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
