import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AvailabilityCalendar } from '@/components/availability-calendar'

const details: Record<string, { title: string; description: string; duration: string }> = { 'Entrenamiento personal': { title: 'Entrenamiento personal', description: 'Una sesión diseñada alrededor de tu cuerpo, tu contexto y tus objetivos.', duration: '60 minutos' }, 'Small group': { title: 'Small group', description: 'Entrena acompañado, con la atención que necesitas para progresar.', duration: '50 minutos' }, 'Valoración inicial': { title: 'Valoración inicial', description: 'Medimos tu punto de partida y trazamos un plan que tenga sentido.', duration: '45 minutos' } }

export default async function TrainingDetail({ params }: { params: Promise<{ training: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const detail = details[decodeURIComponent((await params).training)]
  if (!detail) notFound()

  return <main className="min-h-screen bg-secondary"><header className="flex items-center justify-between border-b border-border bg-background px-6 py-6 lg:px-10"><Link href="/reservar" className="font-mono text-sm font-bold tracking-[0.18em]">PGL<span className="text-accent">.</span>TRAINNING</Link><div className="flex items-center gap-5"><Link href="/mi-cuenta" className="text-sm font-semibold">Mi cuenta</Link><Link href="/" className="text-sm font-semibold">Inicio</Link></div></header><div className="mx-auto max-w-6xl px-6 py-16 lg:px-10"><Link href="/reservar" className="font-mono text-xs uppercase tracking-[0.16em] text-accent">← Volver a formatos</Link><h1 className="mt-10 text-5xl font-bold tracking-[-0.06em] sm:text-7xl">{detail.title}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">{detail.description}</p><div className="mt-12 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between"><p className="font-mono text-xs uppercase tracking-[0.14em]">{detail.duration} · Godella, Valencia</p><p className="text-sm font-semibold">Calle San Blas 15</p></div><AvailabilityCalendar training={detail.title} /></div></main>
}
