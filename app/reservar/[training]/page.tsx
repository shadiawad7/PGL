import { BrandLogo } from '@/components/brand-logo'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { trainingType } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { AvailabilityCalendar } from '@/components/availability-calendar'

export default async function TrainingDetail({ params }: { params: Promise<{ training: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const key = (await params).training
  let [detail] = await db.select().from(trainingType).where(and(eq(trainingType.id, key), eq(trainingType.active, true))).limit(1)
  // Keep existing links such as /reservar/Small%20group working.
  if (!detail) [detail] = await db.select().from(trainingType).where(and(eq(trainingType.name, key), eq(trainingType.active, true))).limit(1)
  if (!detail) notFound()

  return <main className="reservation-page min-h-screen"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 bg-black/25 px-4 py-5 sm:px-6 sm:py-6 lg:px-10"><BrandLogo priority /><div className="flex flex-wrap items-center gap-x-5 gap-y-3"><Link href="/mi-cuenta" className="text-sm font-semibold">Mi cuenta</Link><Link href="/" className="text-sm font-semibold">Inicio</Link></div></header><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-10"><Link href="/reservar" className="font-mono text-xs uppercase tracking-[0.16em] text-lime-300">← Volver a formatos</Link><h1 className="mt-10 break-words text-4xl sm:text-5xl font-bold tracking-[-0.06em] sm:text-7xl">{detail.name}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/75">{detail.description}</p><div className="mt-12 flex flex-col gap-4 border-t border-white/20 pt-7 sm:flex-row sm:items-center sm:justify-between"><p className="font-mono text-xs uppercase tracking-[0.14em]">{detail.durationMinutes} minutos · Godella, Valencia</p><p className="text-sm font-semibold">Calle San Blas 15</p></div><div className="reservation-calendar"><AvailabilityCalendar training={detail.id} /></div></div></main>
}
