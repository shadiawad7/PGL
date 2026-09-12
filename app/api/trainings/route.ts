import { asc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { trainingType } from '@/lib/db/schema'

export async function GET() {
  try {
    const trainings = await db.select({
      id: trainingType.id,
      title: trainingType.name,
      description: trainingType.description,
      durationMinutes: trainingType.durationMinutes,
      capacity: trainingType.capacity,
    }).from(trainingType).where(eq(trainingType.active, true)).orderBy(asc(trainingType.name))
    return NextResponse.json({ trainings }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'No se han podido cargar los entrenamientos.' }, { status: 503 })
  }
}
