import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db, pool } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { startMinutes } from '@/lib/schedule'

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false
  const [row] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  return row?.role === 'admin'
}
const setupError = () => NextResponse.json({ error: 'La agenda semanal está pendiente de activar en la base de datos.' }, { status: 503 })

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const ready = await pool.query("SELECT to_regclass('public.weekly_schedule') AS name")
  if (!ready.rows[0]?.name) return setupError()
  const { rows } = await pool.query('SELECT weekday, minutes FROM weekly_schedule ORDER BY weekday')
  return NextResponse.json({ week: Array.from({ length: 7 }, (_, weekday) => ({ weekday, minutes: rows.find((row) => row.weekday === weekday)?.minutes ?? [], configured: rows.some((row) => row.weekday === weekday) })) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.weekdays) || body.weekdays.length < 1 || body.weekdays.length > 7 || body.weekdays.some((day: unknown) => !Number.isInteger(day) || Number(day) < 0 || Number(day) > 6) || !Array.isArray(body.minutes) || body.minutes.length > 100 || body.minutes.some((minute: unknown) => !Number.isInteger(minute))) return NextResponse.json({ error: 'Selecciona días y horas válidos' }, { status: 400 })
  const weekdays = [...new Set<number>(body.weekdays)]
  const minutes = [...new Set<number>(body.minutes)].sort((a, b) => a - b)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: types } = await client.query('SELECT * FROM training_type ORDER BY id FOR UPDATE')
    if (!types.length) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'No hay entrenamientos configurados' }, { status: 404 }) }
    const allowed = new Set(startMinutes(Math.max(...types.map((type) => type.durationMinutes))))
    if (minutes.some((minute) => !allowed.has(minute))) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Las sesiones deben comenzar cada 10 minutos desde las 08:00 y finalizar como máximo a las 23:00.' }, { status: 400 }) }
    const ready = await client.query("SELECT to_regclass('public.weekly_schedule') AS name")
    if (!ready.rows[0]?.name) { await client.query('ROLLBACK'); return setupError() }
    for (const weekday of weekdays) await client.query('INSERT INTO weekly_schedule (weekday, minutes, "updatedAt") VALUES ($1, $2, $3) ON CONFLICT (weekday) DO UPDATE SET minutes = EXCLUDED.minutes, "updatedAt" = EXCLUDED."updatedAt"', [weekday, minutes, new Date().toISOString()])
    await client.query('COMMIT')
    return NextResponse.json({ ok: true, days: weekdays.length, trainings: types.length })
  } catch {
    await client.query('ROLLBACK')
    return NextResponse.json({ error: 'No se ha podido guardar la plantilla semanal.' }, { status: 500 })
  } finally { client.release() }
}
