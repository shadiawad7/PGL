import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { profile } from '@/lib/db/schema'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const values = { userId: session.user.id, phone: String(body.phone || '').slice(0, 40), goals: String(body.goals || '').slice(0, 500), updatedAt: new Date() }
  await db.insert(profile).values(values).onConflictDoUpdate({ target: profile.userId, set: { phone: values.phone, goals: values.goals, updatedAt: values.updatedAt } })
  return NextResponse.json({ ok: true })
}
