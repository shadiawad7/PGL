import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { trainingType } from '@/lib/db/schema'

export default async function ReservePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const options = await db.select().from(trainingType).where(eq(trainingType.active, true)).orderBy(asc(trainingType.name))

  return <main className="reservation-page min-h-screen">
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/15 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
      <Link href="/" className="font-mono text-sm font-bold tracking-[0.18em]">PGL<span className="text-lime-300">.</span>TRAINNING</Link>
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold"><Link href="/">Inicio</Link><Link href="/mi-cuenta">Mi cuenta</Link>{session.user.role === 'admin' && <Link href="/admin">Panel Admin</Link>}</nav>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime-300">Reserva tu sesión</p>
      <h1 className="mt-5 max-w-2xl break-words text-4xl sm:text-5xl font-bold tracking-[-0.06em] sm:text-7xl">Entrena con intención.</h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Elige el formato que mejor encaja contigo. Después podrás seleccionar día y hora.</p>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {options.map((option, index) => <Link key={option.id} href={`/reservar/${encodeURIComponent(option.id)}`} className="group flex min-h-64 sm:min-h-80 flex-col justify-between gap-8 rounded-2xl border border-white/20 bg-black/45 p-7 backdrop-blur-md transition hover:-translate-y-1 hover:border-lime-300/70 hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-lime-300">
          <div><span className="font-mono text-xs uppercase tracking-[0.16em] text-lime-300">0{index + 1} / Disponible</span><h2 className="mt-8 text-3xl font-bold tracking-[-0.04em]">{option.name}</h2><p className="mt-4 text-sm leading-6 text-white/70">{option.description}</p></div>
          <div><p className="text-sm text-white/70">{option.durationMinutes} min · {option.capacity === 1 ? 'Individual' : `Hasta ${option.capacity} personas`}</p><div className="mt-5 flex items-center justify-between border-t border-white/15 pt-5">{option.price > 0 && (<span className="text-xl font-semibold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(option.price)}</span>)}<span className="text-sm font-semibold text-lime-300">Elegir horario →</span></div></div>
        </Link>)}
      </div>
      {options.length === 0 && <p className="mt-10 rounded-xl border border-white/20 bg-black/40 p-6">Todavía no hay entrenamientos disponibles.</p>}
    </div>
  </main>
}
