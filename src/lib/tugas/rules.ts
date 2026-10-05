/**
 * What a guided-task submission may be. Shared by the browser, which checks
 * a file before uploading so a member hears about a mistake immediately,
 * and the server, which checks the uploaded bytes again and has the final
 * word. Nothing here touches Node or the DOM, so both can run it.
 */

import { deadlineToMs } from '@/lib/format'

export const MAX_BYTES = 5 * 1024 * 1024

/**
 * What may be handed in: source code, several files in one archive, or a
 * PDF. A kind is the file's extension, and the extension it is stored under.
 * Dev-C++ saves a new source file as `.cpp` unless told otherwise, and most
 * members archive with WinRAR, so both are taken as they come.
 */
export const FILE_KINDS = ['c', 'cpp', 'zip', 'rar', 'pdf'] as const

export type FileKind = (typeof FILE_KINDS)[number]

/** `.c, .cpp, .zip, .rar, .pdf`, for the uploader's note and its file picker. */
export const ACCEPTED_LABEL = FILE_KINDS.map((kind) => `.${kind}`).join(', ')

export const WRONG_KIND = `Jenis berkas ini tidak diterima. Yang diterima: ${ACCEPTED_LABEL}.`

/** The type each kind is stored as, whatever the member's browser calls it. */
export const CONTENT_TYPE: Record<FileKind, string> = {
  c: 'text/plain',
  cpp: 'text/plain',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  pdf: 'application/pdf',
}

export function kindOf(fileName: string): FileKind | null {
  const lower = fileName.toLowerCase()
  return FILE_KINDS.find((kind) => lower.endsWith(`.${kind}`)) ?? null
}

/** The name as the member saw it, without any path, trimmed to fit. */
export function displayName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? fileName
  return base.trim().slice(-160) || 'tugas'
}

/**
 * The deadline, as a WIB wall-clock time: the module's own `tenggat` when an
 * admin set one, otherwise 19.00 on its class Monday (`tenggatBawaan`). The
 * guided task counts towards attendance, so it is due before members walk
 * into that class.
 */
export function effectiveDeadline(modul: { tenggat?: string; tenggatBawaan: string }): string {
  return modul.tenggat ?? modul.tenggatBawaan
}

/** Handing in opens with the module's release: `rilis` at 00.00 WIB. */
export function isReleased(modul: { rilis: string }, now = Date.now()): boolean {
  return now >= deadlineToMs(`${modul.rilis}T00:00`)
}

export type Verdict = { ok: true; summary: string } | { ok: false; error: string }

const sizeError = (bytes: number): string | null => {
  if (bytes === 0) return 'Berkasnya kosong.'
  if (bytes > MAX_BYTES) return `Berkas terlalu besar (${(bytes / 1024 / 1024).toFixed(1)} MB). Batasnya 5 MB.`
  return null
}

const startsWith = (bytes: Uint8Array, magic: readonly number[], at = 0): boolean =>
  magic.every((byte, index) => bytes[at + index] === byte)

/** Source code is text: no NUL bytes anywhere. */
export function checkSource(kind: 'c' | 'cpp', bytes: Uint8Array): Verdict {
  const tooBig = sizeError(bytes.length)
  if (tooBig) return { ok: false, error: tooBig }
  if (bytes.includes(0)) return { ok: false, error: 'Ini bukan berkas teks. Pastikan yang diunggah kodenya, bukan program hasil kompilasi.' }
  return { ok: true, summary: `${bytes.length} byte kode ${kind === 'c' ? 'C' : 'C++'}` }
}

/** Entries a zip tool adds on its own, which never count as content. */
const JUNK = /(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$|desktop\.ini$)/i

/**
 * Reads the zip's central directory — just the file list, nothing is
 * decompressed — and requires a real zip with at least one file in it. How
 * the files are arranged inside is the member's business. Anything that
 * looks like path trickery (`../`, absolute paths) is refused outright.
 */
export function checkZip(bytes: Uint8Array): Verdict {
  const tooBig = sizeError(bytes.length)
  if (tooBig) return { ok: false, error: tooBig }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const u32 = (at: number): number => view.getUint32(at, true)
  const u16 = (at: number): number => view.getUint16(at, true)

  // A zip with nothing in it is only its end record.
  if (bytes.length >= 22 && u32(0) === 0x06054b50) return { ok: false, error: 'Zip ini kosong.' }
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

  const files = entries.filter((name) => !name.endsWith('/'))
  if (files.length === 0) return { ok: false, error: 'Zip ini kosong.' }
  return { ok: true, summary: `zip berisi ${files.length} berkas` }
}

/** `Rar!` 1A 07, then 00 (RAR 4) or 01 (RAR 5). */
const RAR_MAGIC = [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07] as const

/** A rar is recognised by its signature only: nothing here can read inside one. */
export function checkRar(bytes: Uint8Array): Verdict {
  const tooBig = sizeError(bytes.length)
  if (tooBig) return { ok: false, error: tooBig }
  if (!startsWith(bytes, RAR_MAGIC) || (bytes[6] !== 0x00 && bytes[6] !== 0x01)) {
    return { ok: false, error: 'Berkas ini bukan rar yang valid.' }
  }
  return { ok: true, summary: 'arsip rar' }
}

/** `%PDF-` */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d] as const

/** A PDF announces itself within its first kilobyte, usually at byte 0. */
export function checkPdf(bytes: Uint8Array): Verdict {
  const tooBig = sizeError(bytes.length)
  if (tooBig) return { ok: false, error: tooBig }
  const last = Math.min(bytes.length - PDF_MAGIC.length, 1024)
  for (let at = 0; at <= last; at += 1) {
    if (startsWith(bytes, PDF_MAGIC, at)) return { ok: true, summary: 'berkas PDF' }
  }
  return { ok: false, error: 'Berkas ini bukan PDF yang valid.' }
}

export function checkFile(kind: FileKind, bytes: Uint8Array): Verdict {
  if (kind === 'zip') return checkZip(bytes)
  if (kind === 'rar') return checkRar(bytes)
  if (kind === 'pdf') return checkPdf(bytes)
  return checkSource(kind, bytes)
}
