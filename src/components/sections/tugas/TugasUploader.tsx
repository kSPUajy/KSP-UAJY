'use client'

import { createClient } from '@supabase/supabase-js'
import { useId, useRef, useState } from 'react'

import { mulaiUpload, selesaiUpload } from '@/app/dashboard/actions'
import { MAX_BYTES, checkFile, kindOf } from '@/lib/tugas/rules'
import { cn } from '@/lib/utils'

type Phase =
  | { name: 'idle' }
  | { name: 'working'; step: string }
  | { name: 'done'; message: string; late: boolean }
  | { name: 'error'; message: string }

/**
 * Pick or drop one `.c` file or one `.zip`, and it is handed in.
 *
 * The file is checked here first, so a wrong zip is caught in a second
 * instead of after an upload. Then the server issues a one-time upload URL,
 * the browser sends the bytes straight to storage, and the server checks
 * them again before recording anything. The browser's check is a courtesy;
 * the server's is the rule.
 */
export function TugasUploader({ moduleId, replacing }: { moduleId: string; replacing: boolean }) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>({ name: 'idle' })
  const [dragging, setDragging] = useState(false)
  const busy = phase.name === 'working'

  async function submit(file: File): Promise<void> {
    const kind = kindOf(file.name)
    if (!kind) return setPhase({ name: 'error', message: 'Hanya berkas .c atau .zip yang diterima.' })
    if (file.size > MAX_BYTES) return setPhase({ name: 'error', message: 'Berkas terlalu besar. Batasnya 5 MB.' })

    setPhase({ name: 'working', step: 'memeriksa berkas…' })
    const verdict = checkFile(kind, new Uint8Array(await file.arrayBuffer()))
    if (!verdict.ok) return setPhase({ name: 'error', message: verdict.error })

    setPhase({ name: 'working', step: 'menyiapkan upload…' })
    const start = await mulaiUpload(moduleId, file.name, file.size)
    if (!start.ok) return setPhase({ name: 'error', message: start.error })

    setPhase({ name: 'working', step: 'mengunggah…' })
    const storage = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    }).storage.from('tugas')
    const { error } = await storage.uploadToSignedUrl(start.path, start.token, file, {
      contentType: kind === 'zip' ? 'application/zip' : 'text/x-csrc',
    })
    if (error) return setPhase({ name: 'error', message: 'Upload terputus. Periksa koneksi, lalu coba lagi.' })

    setPhase({ name: 'working', step: 'mencatat…' })
    const done = await selesaiUpload(moduleId, start.path, file.name)
    if (!done.ok) return setPhase({ name: 'error', message: done.error })

    setPhase({
      name: 'done',
      late: done.terlambat,
      message: `Terkumpul — ${done.summary}${done.terlambat ? ', ditandai terlambat' : ''}.`,
    })
  }

  function onFiles(files: FileList | null): void {
    const file = files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (file && !busy) void submit(file)
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          onFiles(event.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragging ? 'border-accent-fg bg-surface-2' : 'border-line-soft hover:border-line hover:bg-surface-2',
          busy && 'pointer-events-none opacity-60',
        )}
      >
        <span className="text-sm font-bold text-fg">
          <span aria-hidden className="text-accent-fg">
            ↑{' '}
          </span>
          {replacing ? 'ganti berkas' : 'kumpulkan tugas'}
        </span>
        <span className="text-[11px] leading-5 text-dim">
          satu berkas .c, atau satu folder yang di-zip · maks 5 MB · pilih atau seret ke sini
        </span>
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".c,.zip,text/x-csrc,application/zip"
        className="sr-only"
        disabled={busy}
        onChange={(event) => onFiles(event.target.files)}
      />

      <p role="status" aria-live="polite" className="mt-3 min-h-6 text-[12px] leading-6">
        {phase.name === 'working' ? <span className="text-muted">{phase.step}</span> : null}
        {phase.name === 'done' ? (
          <span className={phase.late ? 'text-fg' : 'text-accent-fg'}>
            <span aria-hidden>{phase.late ? '[!] ' : '[ok] '}</span>
            {phase.message}
          </span>
        ) : null}
        {phase.name === 'error' ? (
          <span className="text-fg">
            <span className="text-accent-fg">error:</span> {phase.message}
          </span>
        ) : null}
      </p>
    </div>
  )
}
