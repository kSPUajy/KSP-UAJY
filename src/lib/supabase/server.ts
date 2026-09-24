import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from '@/lib/supabase/database.types'

/**
 * A client acting as the signed-in visitor, for Server Components and
 * Server Actions. Reading `cookies()` makes whatever calls it dynamic, so
 * this is for account pages only — public pages use `publicDb`.
 *
 * A new client per request, never shared: the library sends its no-cache
 * headers only with the first cookie write of each client.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
          } catch {
            // Server Components cannot write cookies. The proxy refreshes the
            // session on every account route, so nothing is lost here.
          }
        },
      },
    },
  )
}
