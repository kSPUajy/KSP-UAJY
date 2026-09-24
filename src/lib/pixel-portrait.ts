import { PORTRAIT } from '@/lib/types'

/** 5×5 capitals, one string per row. Anything missing falls back to `?`. */
const GLYPHS: Record<string, readonly string[]> = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01111', '10000', '10011', '10001', '01111'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  '?': ['01110', '10001', '00110', '00000', '00100'],
}

/** First letters of the first two words: `Klemens Valois` -> `KV`. */
export function initials(nama: string): string {
  const letters = nama
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, ''))
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
  return letters || '??'
}

const PX = 44
const BG = '#10121a'
const FG = '#f3efe2'

/**
 * A 4:5 portrait of someone's initials in the site's pixel type, as an SVG
 * data URL — the stand-in until a real photo is uploaded. `DitherImage`
 * duotones it like any photo, so it sits in every card without looking like
 * a missing image. Pure and deterministic: the same name, the same picture.
 */
export function pixelPortrait(nama: string): string {
  const letters = [...initials(nama)]
  const columns = letters.length * 5 + (letters.length - 1)
  const x0 = (PORTRAIT.width - columns * PX) / 2
  const y0 = (PORTRAIT.height - 5 * PX) / 2 - PX

  const cells: string[] = []
  letters.forEach((letter, index) => {
    const glyph = GLYPHS[letter] ?? GLYPHS['?']!
    glyph.forEach((row, r) => {
      ;[...row].forEach((bit, c) => {
        if (bit === '1') cells.push(`<rect x="${x0 + (index * 6 + c) * PX}" y="${y0 + r * PX}" width="${PX - 5}" height="${PX - 5}"/>`)
      })
    })
  })
  // The prompt underline beneath, like a cursor waiting for the photo.
  cells.push(`<rect x="${x0}" y="${y0 + 6 * PX + 20}" width="${2 * PX}" height="${Math.round(PX / 3)}"/>`)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PORTRAIT.width} ${PORTRAIT.height}">` +
    `<rect width="100%" height="100%" fill="${BG}"/><g fill="${FG}">${cells.join('')}</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
