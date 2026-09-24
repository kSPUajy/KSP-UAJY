import 'server-only'

import { inflateRawSync } from 'node:zlib'

/** Files a tentor would want to read inline. Everything else is listed, not shown. */
const TEXT_FILE = /\.(c|h|txt|md|in|out)$/i
const JUNK = /(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$|desktop\.ini$)/i

const PER_FILE_LIMIT = 64 * 1024
const TOTAL_LIMIT = 400 * 1024

export type ZipEntry = {
  path: string
  size: number
  /** Present for readable text files within the limits. */
  text?: string
  /** Why the text is absent, when it is. */
  note?: string
}

/**
 * The files in a submitted zip, with the text of the source files, for
 * reading in the grading view without downloading anything.
 *
 * Only stored (0) and deflated (8) entries are read — what every common zip
 * tool writes. Sizes are capped before inflating and again after, so a
 * crafted archive cannot make the server inflate more than a few hundred
 * kilobytes, whatever its headers claim.
 */
export function readZip(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const u32 = (at: number): number => view.getUint32(at, true)
  const u16 = (at: number): number => view.getUint16(at, true)

  let eocd = -1
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 22 - 0xffff); at -= 1) {
    if (u32(at) === 0x06054b50) {
      eocd = at
      break
    }
  }
  if (eocd < 0) return []

  const count = Math.min(u16(eocd + 10), 500)
  const decoder = new TextDecoder('utf-8')
  const entries: ZipEntry[] = []
  let budget = TOTAL_LIMIT
  let at = u32(eocd + 16)

  for (let index = 0; index < count && at + 46 <= bytes.length; index += 1) {
    if (u32(at) !== 0x02014b50) break
    const method = u16(at + 10)
    const compressedSize = u32(at + 20)
    const size = u32(at + 24)
    const nameLength = u16(at + 28)
    const extraLength = u16(at + 30)
    const commentLength = u16(at + 32)
    const localOffset = u32(at + 42)
    const path = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength)).replace(/\\/g, '/')
    at += 46 + nameLength + extraLength + commentLength

    if (path.endsWith('/') || JUNK.test(path)) continue
    const entry: ZipEntry = { path, size }
    entries.push(entry)

    if (!TEXT_FILE.test(path)) continue
    if (size > PER_FILE_LIMIT) {
      entry.note = 'terlalu besar untuk ditampilkan'
      continue
    }
    if (size > budget) {
      entry.note = 'dilewati — batas tampilan tercapai'
      continue
    }

    // The local header repeats the name and extra field, with its own lengths.
    if (localOffset + 30 > bytes.length || u32(localOffset) !== 0x04034b50) continue
    const dataStart = localOffset + 30 + u16(localOffset + 26) + u16(localOffset + 28)
    const raw = bytes.subarray(dataStart, dataStart + compressedSize)

    try {
      const content =
        method === 0 ? raw : method === 8 ? inflateRawSync(raw, { maxOutputLength: PER_FILE_LIMIT + 1 }) : null
      if (!content) {
        entry.note = 'format kompresi tidak didukung'
        continue
      }
      if (content.length > PER_FILE_LIMIT) {
        entry.note = 'terlalu besar untuk ditampilkan'
        continue
      }
      budget -= content.length
      entry.text = content.includes(0) ? undefined : decoder.decode(content)
      if (entry.text === undefined) entry.note = 'bukan berkas teks'
    } catch {
      entry.note = 'tidak bisa dibuka'
    }
  }

  return entries.sort((a, b) => a.path.localeCompare(b.path))
}
