'use client'

import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/lib/supabase/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * The one browser-side client, reading the same session cookie the server
 * sets. Used for realtime only (who is online); every read and write that
 * matters still goes through the server.
 */
export function supabaseBrowser() {
  client ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
  )
  return client
}
