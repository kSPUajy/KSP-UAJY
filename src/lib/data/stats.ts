import 'server-only'

/**
 * The only figures that cannot be derived from the other data modules.
 *
 * Everything else the stats strip shows — tentor count, published challenges,
 * total submissions — is computed in `getStats()` so the numbers on the home
 * page can never disagree with the pages they link to.
 */
export const statsSource = {
  /** Club-wide members, not just the fourteen in the org chart. */
  anggotaAktif: 128,
} as const
