'use client'

import { useActionState } from 'react'

import { masuk } from '@/app/masuk/actions'
import { PasswordField } from '@/components/sections/akun/PasswordField'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'

/**
 * NPM and password. A failed attempt keeps the NPM and clears the password,
 * and the one error message is announced as an alert.
 */
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(masuk, undefined)

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field
        id="npm"
        name="npm"
        label="npm"
        inputMode="numeric"
        autoComplete="username"
        required
        pattern="[0-9 .]*"
        defaultValue={state?.npm}
        placeholder="220711234"
        spellCheck={false}
      />

      <PasswordField id="password" name="password" label="password" autoComplete="current-password" />

      {state?.error ? (
        <p role="alert" className="border-l-2 border-accent-fg pl-3 text-[12px] leading-6 text-fg">
          <span className="text-accent-fg">error:</span> {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? 'memeriksa…' : 'masuk'}
      </Button>
    </form>
  )
}
