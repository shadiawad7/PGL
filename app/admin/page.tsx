import { BrandLogo } from '@/components/brand-logo'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { AdminDashboard } from '@/components/admin-dashboard'
import { SignOutButton } from '@/components/sign-out-button'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const currentUser = await db.select({ name: user.name, role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (currentUser[0]?.role !== 'admin') redirect('/mi-cuenta')
  return <main className="min-h-screen bg-secondary"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-primary px-6 py-6 text-primary-foreground lg:px-10"><BrandLogo priority /><div className="flex flex-wrap items-center gap-5 text-sm"><span className="hidden text-primary-foreground/60 sm:inline">Hola, {currentUser[0].name}</span><Link href="/mi-cuenta">Vista cliente</Link><SignOutButton className="font-semibold" /></div></header><div className="mx-auto max-w-7xl px-6 py-12 lg:px-10"><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Administración</p><h1 className="mt-4 text-5xl font-bold tracking-[-0.06em]">Panel de control.</h1><p className="mt-4 max-w-xl text-muted-foreground">Gestiona reservas, clientes y sesiones desde un único lugar.</p><AdminDashboard /></div></main>
}
