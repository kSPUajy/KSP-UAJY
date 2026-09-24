import { keluar } from '@/app/masuk/actions'
import { Button } from '@/components/ui/Button'

/** A plain form, so signing out works before hydration and without script. */
export function SignOutButton() {
  return (
    <form action={keluar}>
      <Button type="submit" variant="outline" size="sm">
        keluar
      </Button>
    </form>
  )
}
