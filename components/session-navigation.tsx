'use client'

import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { SignOutButton } from '@/components/sign-out-button'

export function SessionNavigation() {
  const { data: session, isPending, error } = authClient.useSession()
  if (isPending) return <span className="text-xs text-primary-foreground/60">Cargando…</span>
  if (error) return <Link href="/sign-in">Reintentar acceso</Link>
  if (!session) return <Link href="/sign-in">Acceder</Link>
  const isAdmin = (session.user as typeof session.user & { role?: string }).role === 'admin'
  return <div className="flex flex-wrap items-center gap-5">
    <Link href={isAdmin ? '/admin' : '/mi-cuenta'}>{isAdmin ? 'Panel Admin' : 'Mi cuenta'}</Link>
    <SignOutButton />
  </div>
}
