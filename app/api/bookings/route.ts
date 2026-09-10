import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { booking, timeSlot, trainingType } from '@/lib/db/schema'

const MADRID_TIME_ZONE = 'Europe/Madrid'

function getLocalParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: MADRID_TIME_ZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date)
  return { weekday: parts.find((part) => part.type === 'weekday')?.value, hour: Number(parts.find((part) => part.type === 'hour')?.value), minute: Number(parts.find((part) => part.type === 'minute')?.value) }
}

function isOpening(start: Date, end: Date) {
  const localStart = getLocalParts(start)
  const localEnd = getLocalParts(end)
  const minutes = localStart.hour * 60 + localStart.minute
  const endMinutes = localEnd.hour * 60 + localEnd.minute
  if (localStart.weekday === 'Sun') return false
  if (localStart.weekday === 'Sat') return minutes >= 480 && endMinutes <= 840
  return (minutes >= 480 && endMinutes <= 840) || (minutes >= 960 && endMinutes <= 1320)
}

function buildLocalDate(date: string, minutes: number) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0')
  const minute = String(minutes % 60).padStart(2, '0')
  return new Date(`${date}T${hour}:${minute}:00+02:00`)
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const params = new URL(request.url).searchParams
  const date = params.get('date')
  const training = params.get('training')
  if (!date || !training) return NextResponse.json({ error: 'Missing date or training' }, { status: 400 })
  const start = new Date(`${date}T00:00:00+02:00`)
  const end = new Date(`${date}T23:59:59+02:00`)
  const [type] = await db.select().from(trainingType).where(and(eq(trainingType.name, training), eq(trainingType.active, true))).limit(1)
  if (!type) return NextResponse.json({ slots: [], message: 'Este entrenamiento todavía no está configurado.' })
  const existing = await db.select({ slot: timeSlot }).from(timeSlot).where(and(eq(timeSlot.trainingTypeId, type.id), eq(timeSlot.status, 'available'), sql`${timeSlot.startsAt} >= ${start}`, sql`${timeSlot.startsAt} <= ${end}`))
  const existingByStart = new Map(existing.map(({ slot }) => [slot.startsAt.getTime(), slot]))
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: MADRID_TIME_ZONE, weekday: 'short' }).format(start)
  const windows = weekday === 'Sat' ? [[480, 840]] : weekday === 'Sun' ? [] : [[480, 840], [960, 1320]]
  const generated: Array<{ id: string; startsAt: Date; endsAt: Date; capacity: number }> = []
  for (const [windowStart, windowEnd] of windows) for (let minute = windowStart; minute + type.durationMinutes <= windowEnd; minute += 15) {
    const startsAt = buildLocalDate(date, minute)
    const endsAt = new Date(startsAt.getTime() + type.durationMinutes * 60_000)
    const saved = existingByStart.get(startsAt.getTime())
    generated.push({ id: saved?.id || `generated:${type.id}:${date}:${minute}`, startsAt: saved?.startsAt || startsAt, endsAt: saved?.endsAt || endsAt, capacity: saved?.capacity || type.capacity })
  }
  const slots = await Promise.all(generated.filter((slot) => slot.startsAt > new Date() && isOpening(slot.startsAt, slot.endsAt)).map(async (slot) => {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(booking).where(and(eq(booking.timeSlotId, slot.id), eq(booking.status, 'confirmed')))
    return { id: slot.id, startsAt: slot.startsAt, endsAt: slot.endsAt, remaining: Math.max(0, slot.capacity - Number(result?.count || 0)) }
  }))
  return NextResponse.json({ slots })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { timeSlotId, notes } = await request.json()
  if (!timeSlotId) return NextResponse.json({ error: 'Missing time slot' }, { status: 400 })
  let slot = await db.select().from(timeSlot).where(and(eq(timeSlot.id, String(timeSlotId)), eq(timeSlot.status, 'available'))).limit(1)
  if (!slot[0] && String(timeSlotId).startsWith('generated:')) {
    const [, trainingId, date, minuteText] = String(timeSlotId).split(':')
    const [type] = await db.select().from(trainingType).where(and(eq(trainingType.id, trainingId), eq(trainingType.active, true))).limit(1)
    const minute = Number(minuteText)
    if (type && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isInteger(minute)) {
      const startsAt = buildLocalDate(date, minute)
      const endsAt = new Date(startsAt.getTime() + type.durationMinutes * 60_000)
      if (isOpening(startsAt, endsAt)) {
        await db.insert(timeSlot).values({ id: String(timeSlotId), trainingTypeId: type.id, startsAt, endsAt, capacity: type.capacity, status: 'available' }).onConflictDoNothing()
        slot = await db.select().from(timeSlot).where(and(eq(timeSlot.id, String(timeSlotId)), eq(timeSlot.status, 'available'))).limit(1)
      }
    }
  }
  if (!slot[0] || !isOpening(slot[0].startsAt, slot[0].endsAt) || slot[0].startsAt <= new Date()) return NextResponse.json({ error: 'Horario no disponible' }, { status: 409 })
  const count = await db.select({ count: sql<number>`count(*)` }).from(booking).where(and(eq(booking.timeSlotId, slot[0].id), eq(booking.status, 'confirmed')))
  if (Number(count[0]?.count || 0) >= slot[0].capacity) return NextResponse.json({ error: 'No quedan plazas' }, { status: 409 })
  const duplicate = await db.select({ id: booking.id }).from(booking).where(and(eq(booking.userId, session.user.id), eq(booking.timeSlotId, slot[0].id), eq(booking.status, 'confirmed'))).limit(1)
  if (duplicate[0]) return NextResponse.json({ error: 'Ya tienes reservada esta hora' }, { status: 409 })
  await db.insert(booking).values({ id: crypto.randomUUID(), userId: session.user.id, timeSlotId: slot[0].id, notes: String(notes || '').slice(0, 500) })
  return NextResponse.json({ ok: true, startsAt: slot[0].startsAt, endsAt: slot[0].endsAt })
}
