import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { remainingPlaces, type ConfirmedReservation } from '@/lib/booking-availability'
import { dateKey, minuteInMadrid, startMinutes, addDays, isDateKey, madridDate } from '@/lib/schedule'
import { parseWeeklySlotId, readWeeklySchedule, weekdayFor, weeklySlotId } from '@/lib/weekly-schedule'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const params = new URL(request.url).searchParams
  const date = params.get('date')
  const trainingId = params.get('trainingId')
  const training = params.get('training')
  if (!isDateKey(date) || (!trainingId && !training)) return NextResponse.json({ error: 'Fecha o entrenamiento inválidos' }, { status: 400 })
  const { rows: reservations } = await pool.query<ConfirmedReservation>(`
    SELECT b."timeSlotId", b."userId", s."startsAt" AT TIME ZONE 'UTC' AS "startsAt", s."endsAt" AT TIME ZONE 'UTC' AS "endsAt"
    FROM booking b JOIN time_slot s ON s.id = b."timeSlotId"
    WHERE b.status = 'confirmed' AND s."startsAt" < $2 AND s."endsAt" > $1`,
    [madridDate(date, 0).toISOString(), madridDate(addDays(date, 1), 0).toISOString()])
  const recurring = await readWeeklySchedule(pool, weekdayFor(date))
  if (recurring !== null) {
    const { rows: types } = await pool.query(`SELECT * FROM training_type WHERE ${trainingId ? 'id' : 'name'} = $1 AND active = true`, [trainingId || training])
    const type = types[0]
    if (!type) return NextResponse.json({ slots: [] })
    const { rows: existing } = await pool.query(`SELECT s.id, s.capacity, s."startsAt" AT TIME ZONE 'UTC' AS "startsAt", s."endsAt" AT TIME ZONE 'UTC' AS "endsAt", (SELECT count(*)::int FROM booking b WHERE b."timeSlotId" = s.id AND b.status = 'confirmed') AS booked FROM time_slot s WHERE s."trainingTypeId" = $1 AND s."startsAt" >= $2 AND s."startsAt" < $3 ORDER BY s.id`, [type.id, madridDate(date, 0).toISOString(), madridDate(addDays(date, 1), 0).toISOString()])
    const allowed = new Set(startMinutes(type.durationMinutes))
    const slots = recurring.filter((minute) => allowed.has(minute)).map((minute) => {
      const startsAt = madridDate(date, minute)
      const saved = existing.find((slot) => slot.startsAt.getTime() === startsAt.getTime())
      const slot = { id: saved?.id || weeklySlotId(type.id, date, minute), startsAt, endsAt: saved?.endsAt || new Date(startsAt.getTime() + type.durationMinutes * 60000), capacity: saved?.capacity ?? type.capacity }
      return { id: slot.id, startsAt: slot.startsAt, endsAt: slot.endsAt, remaining: remainingPlaces(slot, reservations, session.user.id) }
    }).filter((slot) => slot.startsAt > new Date())
    return NextResponse.json({ slots }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const { rows } = await pool.query(`
    SELECT s.id, s.capacity, s."startsAt" AT TIME ZONE 'UTC' AS "startsAt", s."endsAt" AT TIME ZONE 'UTC' AS "endsAt",
      GREATEST(0, s.capacity - (SELECT count(*)::int FROM booking b WHERE b."timeSlotId" = s.id AND b.status = 'confirmed')) AS remaining
    FROM time_slot s JOIN training_type t ON t.id = s."trainingTypeId"
    WHERE (${trainingId ? 't.id' : 't.name'} = $1) AND t.active = true AND s.status = 'available'
      AND s."startsAt" >= $2 AND s."startsAt" < $3 AND s."startsAt" > $4
    ORDER BY s."startsAt"`, [trainingId || training, madridDate(date, 0).toISOString(), madridDate(addDays(date, 1), 0).toISOString(), new Date().toISOString()])
  return NextResponse.json({ slots: rows.map((slot) => ({ id: slot.id, startsAt: slot.startsAt, endsAt: slot.endsAt, remaining: remainingPlaces(slot, reservations, session.user.id) })) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.timeSlotId !== 'string' || !body.timeSlotId || body.timeSlotId.length > 300 || (body.notes !== undefined && typeof body.notes !== 'string')) return NextResponse.json({ error: 'Reserva inválida' }, { status: 400 })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const conflict = async (error: string) => { await client.query('ROLLBACK'); return NextResponse.json({ error }, { status: 409 }) }
    const virtual = parseWeeklySlotId(body.timeSlotId)
    const { rows: lookup } = await client.query('SELECT "trainingTypeId" FROM time_slot WHERE id = $1', [body.timeSlotId])
    const typeId = lookup[0]?.trainingTypeId || virtual?.trainingId
    if (!typeId) return await conflict('Horario no disponible')
    // Lock every format in a consistent order: all share the same agenda.
    const { rows: types } = await client.query('SELECT * FROM training_type ORDER BY id FOR UPDATE')
    const type = types.find((item) => item.id === typeId)
    if (!type?.active) return await conflict('Entrenamiento no disponible')
    let slotId = body.timeSlotId
    if (!lookup[0] && virtual) {
      const weekly = await readWeeklySchedule(client, weekdayFor(virtual.date))
      if (!weekly?.includes(virtual.minute) || !startMinutes(type.durationMinutes).includes(virtual.minute)) return await conflict('Horario no publicado')
      const start = madridDate(virtual.date, virtual.minute)
      if (start <= new Date()) return await conflict('No se pueden reservar horas pasadas')
      const { rows: existing } = await client.query('SELECT id FROM time_slot WHERE "trainingTypeId" = $1 AND "startsAt" = $2 ORDER BY id LIMIT 1', [type.id, start.toISOString()])
      slotId = existing[0]?.id || weeklySlotId(type.id, virtual.date, virtual.minute)
      if (!existing[0]) await client.query('INSERT INTO time_slot (id, "trainingTypeId", "startsAt", "endsAt", capacity, status) VALUES ($1, $2, $3, $4, $5, $6)', [slotId, type.id, start.toISOString(), new Date(start.getTime() + type.durationMinutes * 60000).toISOString(), type.capacity, 'available'])
    }
    const { rows: slots } = await client.query(`SELECT id, status, capacity, "startsAt" AT TIME ZONE 'UTC' AS "startsAt", "endsAt" AT TIME ZONE 'UTC' AS "endsAt" FROM time_slot WHERE id = $1 FOR UPDATE`, [slotId])
    const slot = slots[0]
    if (!slot || slot.startsAt <= new Date()) return await conflict('Este horario ya no está disponible. Actualiza el calendario.')
    const weekly = await readWeeklySchedule(client, weekdayFor(dateKey(slot.startsAt)))
    if (weekly === null ? slot.status !== 'available' : !weekly.includes(minuteInMadrid(slot.startsAt)) || !startMinutes(type.durationMinutes).includes(minuteInMadrid(slot.startsAt))) return await conflict('Este horario ya no está publicado.')
    const { rows: previous } = await client.query('SELECT id, status FROM booking WHERE "userId" = $1 AND "timeSlotId" = $2', [session.user.id, slot.id])
    if (previous[0]?.status === 'confirmed') return await conflict('Ya tienes reservada esta hora')
    const { rows: overlapping } = await client.query<ConfirmedReservation>(`
      SELECT b."timeSlotId", b."userId", s."startsAt" AT TIME ZONE 'UTC' AS "startsAt", s."endsAt" AT TIME ZONE 'UTC' AS "endsAt"
      FROM booking b JOIN time_slot s ON s.id = b."timeSlotId"
      WHERE b.status = 'confirmed' AND s."startsAt" < $2 AND s."endsAt" > $1`, [slot.startsAt.toISOString(), slot.endsAt.toISOString()])
    if (remainingPlaces(slot, overlapping, session.user.id) === 0) return await conflict('Este horario está ocupado o se solapa con una sesión reservada. Elige otro horario.')
    const { rows: counts } = await client.query('SELECT count(*)::int AS count FROM booking WHERE "timeSlotId" = $1 AND status = $2', [slot.id, 'confirmed'])
    if (counts[0].count >= slot.capacity) return await conflict('No quedan plazas')
    if (previous[0]) {
      await client.query('UPDATE booking SET status = $1, notes = $2, "updatedAt" = $3 WHERE id = $4', ['confirmed', (body.notes || '').slice(0, 500), new Date().toISOString(), previous[0].id])
    } else {
      await client.query('INSERT INTO booking (id, "userId", "timeSlotId", status, notes) VALUES ($1, $2, $3, $4, $5)', [crypto.randomUUID(), session.user.id, slot.id, 'confirmed', (body.notes || '').slice(0, 500)])
    }
    await client.query('COMMIT')
    return NextResponse.json({ ok: true, startsAt: slot.startsAt, endsAt: slot.endsAt })
  } catch {
    await client.query('ROLLBACK')
    return NextResponse.json({ error: 'No se ha podido completar la reserva. Inténtalo de nuevo.' }, { status: 500 })
  } finally { client.release() }
}
