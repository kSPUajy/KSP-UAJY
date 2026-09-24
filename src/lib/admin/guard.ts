import 'server-only'

import type { z } from 'zod'

import { getSessionProfile } from '@/lib/auth/session'
import type { SessionProfile } from '@/lib/auth/session'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * What every admin form action returns. `errors` is keyed by field name so
 * the form can print each message under its own input.
 */
export type AdminFormState =
  | {
      ok: boolean
      message?: string
      errors?: Record<string, string>
      /** Extra data an action hands back once, e.g. a generated password. */
      data?: unknown
    }
  | undefined

export const failed = (message: string, errors?: Record<string, string>): AdminFormState => ({
  ok: false,
  message,
  ...(errors ? { errors } : {}),
})

export const succeeded = (message: string, data?: unknown): AdminFormState => ({
  ok: true,
  message,
  ...(data === undefined ? {} : { data }),
})

/**
 * The admin behind a Server Action, re-checked on every call. Pages are
 * guarded too, but an action is its own endpoint: anyone can post to it
 * directly, so it never trusts that the page it came from was allowed.
 *
 * The returned client acts as the admin's own session, so row-level
 * security (`is_admin()`) is the second gate on every write.
 */
export async function requireAdminAction(): Promise<
  { ok: true; profile: SessionProfile; db: Awaited<ReturnType<typeof createSupabaseServer>> } | { ok: false; state: AdminFormState }
> {
  const profile = await getSessionProfile()
  if (!profile) return { ok: false, state: failed('Sesi berakhir. Masuk lagi, lalu ulangi.') }
  if (profile.mustChangePassword) return { ok: false, state: failed('Ganti password dulu.') }
  if (profile.role !== 'admin') return { ok: false, state: failed('Hanya admin yang boleh melakukan ini.') }
  return { ok: true, profile, db: await createSupabaseServer() }
}

/** Zod issues as one message per field, in the form's own words. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    errors[key] ??= issue.message
  }
  return errors
}

/** Form values as plain strings, with every value trimmed. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') values[key] = value.trim()
  }
  return values
}

/** A multi-line field as its non-empty lines. */
export const lines = (value: string | undefined): string[] =>
  (value ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

/** A comma-separated field as its non-empty items. */
export const commaList = (value: string | undefined): string[] =>
  (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)
