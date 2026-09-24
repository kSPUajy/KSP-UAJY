import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Runs on account routes only — never on the public site, which stays
 * static and never reads a cookie.
 *
 * Two jobs:
 *   1. Refresh the Supabase session. Server Components cannot write
 *      cookies, so an expiring access token is renewed here, before the page
 *      renders, and the new cookies ride out on this response.
 *   2. An optimistic gate: no session on `/dashboard` or `/admin` goes to
 *      `/masuk`; a session on `/masuk` goes to the dashboard.
 *
 * It is only the first line. Roles, the first-login password and the
 * member's very existence are checked again in each layout (`requireProfile`)
 * and, for data, by row-level security.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value)
        },
      },
    },
  )

  // Verifies the token and refreshes it if needed. Must run before any
  // response is decided, or a refreshed session would be lost.
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims.sub
  const signedIn = Boolean(userId)

  const { pathname, search } = request.nextUrl
  const isAccountArea = ['/dashboard', '/admin', '/penilaian'].some((area) => pathname.startsWith(area))

  if (!signedIn && isAccountArea) {
    const url = request.nextUrl.clone()
    url.pathname = '/masuk'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return withCookies(NextResponse.redirect(url), response)
  }

  // The sign-in form is pointless once signed in. The password-change page
  // is the exception: a first sign-in lands there on purpose.
  if (userId && pathname === '/masuk') {
    // A valid token is not yet a member. If the account was deleted while
    // signed in, the token outlives it; bouncing to the dashboard would
    // bounce straight back here, forever. Drop the stale session instead
    // and show the form.
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
    if (!profile) {
      await supabase.auth.signOut()
      response.headers.set('Cache-Control', 'private, no-store')
      return response
    }

    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return withCookies(NextResponse.redirect(url), response)
  }

  // Account pages are per-person; no shared cache may keep them.
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

/** A redirect has to carry any cookies the refresh just wrote. */
function withCookies(redirect: NextResponse, from: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie)
  redirect.headers.set('Cache-Control', 'private, no-store')
  return redirect
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/penilaian/:path*', '/masuk/:path*', '/masuk'],
}
