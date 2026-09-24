/**
 * What a guided-task submission may be. Shared by the browser, which checks
 * a file before uploading so a member hears about a mistake immediately,
 * and the server, which checks the uploaded bytes again and has the final
 * word. Nothing here touches Node or the DOM, so both can run it.
 */

import { addDays } from '@/lib/format'

export const MAX_BYTES = 5 * 1024 * 1024

export type FileKind = 'c' | 'zip'

export function kindOf(fileName: string): FileKind | null {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.c')) return 'c'
  if (lower.endsWith('.zip')) return 'zip'
  return null
}

/** The name as the member saw it, without any path, trimmed to fit. */
export function displayName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? fileName
  return base.trim().slice(-160) || 'tugas'
}

/**
 * The deadline, as a WIB wall-clock time: the module's own `tenggat` when an
 * admin set one, otherwise Sunday 23.59 of the module's week (modules are
 * released on Mondays).
 */
export function effectiveDeadline(modul: { rilis: string; tenggat?: string }): string {
  return modul.tenggat ?? `${addDays(modul.rilis, 6)}T23:59`
}

export type Verdict = { ok: true; summary: string } | { ok: false; error: string }

const sizeError = (bytes: number): string | null => {
  if (bytes === 0) return 'Berkasnya kosong.'
  if (bytes > MAX_BYTES) return `Berkas terlalu besar (${(bytes / 1024 / 1024).toFixed(1)} MB). Batasnya 5 MB.`
  return null
}

/** A C source file is text: no NUL bytes anywhere. */
export function checkCSource(bytes: Uint8Array): Verdict {
  const tooBig = sizeError(bytes.length)
  if (tooBig) return { ok: false, error: tooBig }
  if (bytes.includes(0)) return { ok: false, error: 'Ini bukan berkas teks. Pastikan yang diunggah kode .c, bukan program hasil kompilasi.' }
  return { ok: true, summary: `${bytes.length} byte kode C` }
}

/** Entries a zip tool adds on its own, which never count as content. */
const JUNK = /(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$|desktop\.ini$)/i

/**
 * Reads the zip's central directory — just the file list, nothing is
 * decompressed — and requires exactly one top-level folder holding at least
 * one `.c` file. Anything that looks like path trickery (`../`, absolute
 * paths) is refused outright.
 */
export function checkZip(bytes: Uint8Array): Verdict {
  const tooBig = sizeError(bytes.length)
  if (tooBig) return { ok: false, error: tooBig }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const u32 = (at: number): number => view.getUint32(at, true)
  const u16 = (at: number): number => view.getUint16(at, true)

  if (bytes.length < 22 || u32(0) !== 0x04034b50) return { ok: false, error: 'Berkas ini bukan zip yang valid.' }

  // End-of-central-directory record: last 22 bytes plus up to 64 KB of comment.
  let eocd = -1
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 22 - 0xffff); at -= 1) {
    if (u32(at) === 0x06054b50) {
      eocd = at
      break
    }
  }
  if (eocd < 0) return { ok: false, error: 'Zip ini rusak atau tidak lengkap.' }

  const count = u16(eocd + 10)
  const directoryOffset = u32(eocd + 16)
  if (count === 0xffff || directoryOffset === 0xffffffff) return { ok: false, error: 'Zip ini terlalu besar untuk tugas.' }
  if (count > 500) return { ok: false, error: 'Zip berisi lebih dari 500 berkas.' }

  const decoder = new TextDecoder()
  const names: string[] = []
  let at = directoryOffset
  for (let index = 0; index < count; index += 1) {
    if (at + 46 > bytes.length || u32(at) !== 0x02014b50) return { ok: false, error: 'Zip ini rusak atau tidak lengkap.' }
    const nameLength = u16(at + 28)
    const extraLength = u16(at + 30)
    const commentLength = u16(at + 32)
    names.push(decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength)).replace(/\\/g, '/'))
    at += 46 + nameLength + extraLength + commentLength
  }

  const entries = names.filter((name) => !JUNK.test(name))
  if (entries.some((name) => name.startsWith('/') || /(^|\/)\.\.(\/|$)/.test(name) || /^[a-z]:/i.test(name))) {
    return { ok: false, error: 'Zip berisi jalur berkas yang tidak diizinkan.' }
  }

  const roots = new Set(entries.map((name) => name.split('/')[0]))
  const looseFile = entries.some((name) => !name.includes('/'))
  if (roots.size !== 1 || looseFile) {
    return { ok: false, error: 'Zip harus berisi tepat satu folder, dengan semua berkas di dalamnya.' }
  }

  const sources = entries.filter((name) => name.toLowerCase().endsWith('.c'))
  if (sources.length === 0) return { ok: false, error: 'Tidak ada berkas .c di dalam folder zip ini.' }

  const [folder] = [...roots]
  return { ok: true, summary: `folder ${folder}/ · ${sources.length} berkas .c` }
}

export function checkFile(kind: FileKind, bytes: Uint8Array): Verdict {
  return kind === 'c' ? checkCSource(bytes) : checkZip(bytes)
}
