import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { booking, timeSlot, trainingType, user } from '@/lib/db/schema'

export default async function AdminReservationsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const currentUser = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  if (currentUser[0]?.role !== 'admin') redirect('/mi-cuenta')
  const rows = await db.select({ booking, customer: user, slot: timeSlot, training: trainingType }).from(booking).innerJoin(user, eq(booking.userId, user.id)).innerJoin(timeSlot, eq(booking.timeSlotId, timeSlot.id)).innerJoin(trainingType, eq(timeSlot.trainingTypeId, trainingType.id)).orderBy(desc(timeSlot.startsAt))
  return <main className="min-h-screen bg-secondary"><header className="flex items-center justify-between border-b border-border bg-primary px-6 py-6 text-primary-foreground lg:px-10"><Link href="/admin" className="font-mono text-sm font-bold tracking-[0.18em]">PGL<span className="text-accent">.</span>TRAINNING</Link><Link href="/mi-cuenta" className="text-sm">Mi cuenta</Link></header><div className="mx-auto max-w-7xl px-6 py-14 lg:px-10"><Link href="/admin" className="font-mono text-xs uppercase tracking-[0.16em] text-accent">← Panel</Link><div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Administración</p><h1 className="mt-4 text-5xl font-bold tracking-[-0.06em]">Todas las reservas.</h1></div><p className="text-sm text-muted-foreground">{rows.length} reservas registradas</p></div><section className="mt-12 overflow-x-auto bg-background"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border"><tr><th className="p-5 font-mono text-xs uppercase tracking-[0.14em]">Cliente</th><th className="p-5 font-mono text-xs uppercase tracking-[0.14em]">Sesión</th><th className="p-5 font-mono text-xs uppercase tracking-[0.14em]">Fecha y hora</th><th className="p-5 font-mono text-xs uppercase tracking-[0.14em]">Estado</th></tr></thead><tbody>{rows.map(({ booking: item, customer, slot, training }) => <tr key={item.id} className="border-b border-border last:border-0"><td className="p-5"><p className="font-semibold">{customer.name}</p><p className="text-muted-foreground">{customer.email}</p></td><td className="p-5">{training.name}</td><td className="p-5">{new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(slot.startsAt)}</td><td className="p-5"><span className="font-mono text-xs uppercase tracking-[0.1em] text-accent">{item.status}</span></td></tr>)}</tbody></table>{rows.length === 0 && <p className="p-8 text-sm text-muted-foreground">Aún no hay reservas de clientes.</p>}</section></div></main>
}
