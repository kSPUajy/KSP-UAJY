/** Minimal class joiner — no runtime dependency, no conditional-class magic. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Zero-padded track/line numbers: 1 -> "01". */
export function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

/**
 * A stable seven-character hex id, like an abbreviated commit hash: FNV-1a
 * over the input. Deterministic, so the "hash" printed next to a news post is
 * the same on every build and never needs to be stored.
 */
export function shortHash(input: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

/** `bagas-respati-wicaksono` -> `bagas_respati_wicaksono`, for C-style file names. */
export function snakeCase(slug: string): string {
  return slug.replace(/-/g, '_')
}
