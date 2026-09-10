import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
async function guard() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return false; const row = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1); return row[0]?.role === 'admin' }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const id = (await params).id; await db.delete(user).where(eq(user.id, id)); return NextResponse.json({ ok: true }) }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); const body = await request.json(); await db.update(user).set({ name: String(body.name || '').slice(0, 120), role: body.role === 'admin' ? 'admin' : 'client', updatedAt: new Date() }).where(eq(user.id, (await params).id)); return NextResponse.json({ ok: true }) }
