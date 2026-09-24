'use client'

import { useActionState } from 'react'

import { gantiPassword } from '@/app/masuk/actions'
import { PasswordField } from '@/components/sections/akun/PasswordField'
import { Button } from '@/components/ui/Button'
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/npm'

export function ChangePasswordForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(gantiPassword, undefined)

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="next" value={next} />

      <PasswordField
        id="password"
        name="password"
        label="password-baru"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        hint={`Minimal ${PASSWORD_MIN_LENGTH} karakter, tidak memuat NPM-mu. Frasa beberapa kata lebih kuat daripada satu kata yang rumit.`}
      />
      <PasswordField
        id="konfirmasi"
        name="konfirmasi"
        label="ulangi"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
      />

      {state?.error ? (
        <p role="alert" className="border-l-2 border-accent-fg pl-3 text-[12px] leading-6 text-fg">
          <span className="text-accent-fg">error:</span> {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? 'menyimpan…' : 'simpan password'}
      </Button>
    </form>
  )
}
