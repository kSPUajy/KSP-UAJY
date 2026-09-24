'use client'

import { useState } from 'react'

import { Field } from '@/components/ui/Field'

type PasswordFieldProps = {
  id: string
  name: string
  label: string
  autoComplete: 'current-password' | 'new-password'
  hint?: React.ReactNode
  minLength?: number
}

/** A password field with a show/hide switch, for typing on a phone. */
export function PasswordField({ id, name, label, autoComplete, hint, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Field
      id={id}
      name={name}
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      required
      minLength={minLength}
      maxLength={72}
      spellCheck={false}
      autoCapitalize="none"
      hint={hint}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="shrink-0 border-l-2 border-line-soft px-3 text-[10px] tracking-[0.08em] text-muted uppercase transition-colors hover:text-accent-fg"
        >
          {visible ? 'tutup' : 'lihat'}
        </button>
      }
    />
  )
}
