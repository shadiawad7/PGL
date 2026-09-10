import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { booking, timeSlot, trainingType, user } from '@/lib/db/schema'

async function admin() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return null; const row = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1); return row[0]?.role === 'admin' ? session : null }
export async function GET() {
  if (!await admin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const [bookings, users, trainings, userCount, bookingCount, sessionCount] = await Promise.all([
    db.select({ id: booking.id, startsAt: timeSlot.startsAt, endsAt: timeSlot.endsAt, training: trainingType.name, customer: user.name, email: user.email, status: booking.status }).from(booking).innerJoin(timeSlot, eq(booking.timeSlotId, timeSlot.id)).innerJoin(trainingType, eq(timeSlot.trainingTypeId, trainingType.id)).innerJoin(user, eq(booking.userId, user.id)).orderBy(asc(timeSlot.startsAt)),
    db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).where(eq(user.role, 'client')).orderBy(desc(user.createdAt)),
    db.select().from(trainingType).orderBy(asc(trainingType.name)),
    db.select({ value: sql<number>`count(*)` }).from(user).where(eq(user.role, 'client')), db.select({ value: sql<number>`count(*)` }).from(booking), db.select({ value: sql<number>`count(*)` }).from(timeSlot),
  ])
  return NextResponse.json({ bookings: bookings.map((b) => ({ ...b, time: new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(b.startsAt) })), users, trainings, stats: { users: Number(userCount[0]?.value || 0), bookings: Number(bookingCount[0]?.value || 0), sessions: Number(sessionCount[0]?.value || 0) } })
}
