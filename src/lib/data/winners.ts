import 'server-only'

import type { Winner } from '@/lib/types'

/**
 * One record per win. `slug` identifies the person and repeats across their
 * wins; `id` is unique and also names the solution file in
 * `src/content/solutions/<id>.c`, which the accessor loads.
 *
 * `totalMenang` is all-time, so a profile can show more wins than there are
 * records here. The hall of fame prints both numbers side by side rather than
 * pretending they are one.
 *
 * Empty at the start of the season: winners are entered from the admin panel
 * as each week is decided.
 */
export type WinnerSource = Omit<Winner, 'kodeSolusi'>

export const winnerSources: readonly WinnerSource[] = []
