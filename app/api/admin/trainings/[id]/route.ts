import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { trainingType, user } from '@/lib/db/schema'
async function guard() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return false; const row = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1); return row[0]?.role === 'admin' }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid body')
    body = parsed
  } catch { return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 }) }
  const updates: Partial<typeof trainingType.$inferInsert> = {}
  for (const [field, max] of [['name', 120], ['description', 2000]] as const) {
    if (!(field in body)) continue
    const value = body[field]
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) return NextResponse.json({ error: `Revisa el campo ${field === 'name' ? 'título' : 'descripción'}` }, { status: 400 })
    updates[field] = value.trim()
  }
  for (const [field, min, max] of [['durationMinutes', 15, 240], ['capacity', 1, 50], ['price', 0, 2147483647]] as const) {
    if (!(field in body)) continue
    const value = body[field]
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) return NextResponse.json({ error: 'Revisa la duración (15–240 min), las plazas (1–50) y el precio (euros enteros).' }, { status: 400 })
    updates[field] = value
  }
  if ('active' in body) {
    if (typeof body.active !== 'boolean') return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    updates.active = body.active
  }
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'No hay cambios válidos' }, { status: 400 })
  const rows = await db.update(trainingType).set(updates).where(eq(trainingType.id, (await params).id)).returning({ id: trainingType.id })
  if (!rows.length) return NextResponse.json({ error: 'Entrenamiento no encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); await db.delete(trainingType).where(eq(trainingType.id, (await params).id)); return NextResponse.json({ ok: true }) }
