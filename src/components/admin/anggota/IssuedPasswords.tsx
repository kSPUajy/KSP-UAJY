'use client'

import type { IssuedPassword } from '@/app/admin/anggota/actions'
import { CopyButton } from '@/components/ui/CopyButton'

/** `npm,nama,password` — quoted, so a comma in a name survives. */
function toCsv(rows: readonly IssuedPassword[]): string {
  const cell = (value: string): string => `"${value.replace(/"/g, '""')}"`
  const body = rows.filter((row) => row.password).map((row) => [row.npm, row.nama, row.password ?? ''].map(cell).join(','))
  return ['npm,nama,password', ...body].join('\n')
}

/**
 * Passwords exist in the clear only here, only once: they are not stored,
 * and leaving the page loses them. So the list says so, and offers a copy
 * and a CSV before the admin navigates away.
 */
export function IssuedPasswords({ rows }: { rows: readonly IssuedPassword[] }) {
  const issued = rows.filter((row) => row.password)

  const download = (): void => {
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `password-awal-ksp.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border-2 border-accent-fg bg-code-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line-soft px-4 py-2.5">
        <p className="text-[11px] leading-5 text-accent-fg">
          password sekali pakai — hanya tampil sekarang, tidak disimpan di mana pun
        </p>
        {issued.length > 0 ? (
          <span className="flex items-center gap-2">
            <CopyButton text={toCsv(rows)} label="Salin semua password" doneMessage="Daftar password tersalin" />
            <button
              type="button"
              onClick={download}
              className="inline-flex h-5 items-center border-2 border-line-soft px-1.5 text-[10px] tracking-[0.08em] text-muted uppercase hover:border-line hover:text-accent-fg"
            >
              unduh csv
            </button>
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto" tabIndex={0}>
        <table className="w-full border-collapse font-mono text-[12px] leading-6">
          <thead>
            <tr className="text-left text-[10px] tracking-[0.08em] text-dim uppercase">
              <th className="px-4 py-2 font-normal">npm</th>
              <th className="px-4 py-2 font-normal">nama</th>
              <th className="px-4 py-2 font-normal">password</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.npm}-${row.nama}`} className="border-t-2 border-line-soft">
                <td className="px-4 py-2 text-fg tabular-nums">{row.npm}</td>
                <td className="px-4 py-2 text-muted">{row.nama}</td>
                <td className="px-4 py-2">
                  {row.password ? (
                    <span className="font-bold text-accent-fg select-all">{row.password}</span>
                  ) : (
                    <span className="text-fg">
                      <span className="text-accent-fg">gagal:</span> {row.error}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
