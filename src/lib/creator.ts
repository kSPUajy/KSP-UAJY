/**
 * Clues about whoever built this site, for the easter eggs scattered around
 * it. Deliberately only clues — the year, a masked NPM, a signature — never
 * the name: finding out who is the game.
 */
export const CREATOR = {
  /** The one fact everything hints at. */
  angkatan: 2024,
  /** The NPM with all but the year and faculty code blanked out. */
  npmMask: '2407▒▒▒▒▒',
  /** Signs the easter eggs. */
  handle: 'root',
  /** How the eggs describe them. */
  role: 'bukan pengurus lagi, tapi yang bikin web ini',
} as const

/**
 * The Konami code, cut into five pieces and hidden one per easter egg, so
 * whoever follows the trail can put the combo back together.
 */
export const KOMBO = [
  { part: 1, keys: '↑ ↑' },
  { part: 2, keys: '↓ ↓' },
  { part: 3, keys: '← →' },
  { part: 4, keys: '← →' },
  { part: 5, keys: 'B A' },
] as const

/** `[2/5] ↓ ↓` — only the count, no label: finding out what it is is the game. */
export const komboLine = (part: 1 | 2 | 3 | 4 | 5): string => {
  const piece = KOMBO[part - 1]!
  return `[${piece.part}/${KOMBO.length}] ${piece.keys}`
}

/** The lines `whoami` prints. */
export const WHOAMI_LINES = [
  `uid=2024(${CREATOR.handle}) gid=2407(informatika) groups=ksp,alumni-pengurus`,
  `npm      : ${CREATOR.npmMask}`,
  `angkatan : ${CREATOR.angkatan}`,
  `status   : ${CREATOR.role}`,
  `hint     : ada proses yang ngumpet di htop tentor. grep aja angkatanku ;)`,
  komboLine(2),
] as const
