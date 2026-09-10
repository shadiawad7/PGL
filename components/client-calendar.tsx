'use client'

import { useMemo, useState } from 'react'

interface Reservation { id: string; startsAt: string; endsAt: string; training: string; status: string }

const weekdayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = (first.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return { start, days }
}

export function ClientCalendar({ reservations }: { reservations: Reservation[] }) {
  const [month, setMonth] = useState(() => new Date())
  const { start, days } = monthDays(month)
  const reservedDates = useMemo(() => new Map(reservations.map((item) => [new Date(item.startsAt).toISOString().slice(0, 10), item])), [reservations])
  const today = new Date().toISOString().slice(0, 10)
  const title = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(month)

  return <section className="bg-background p-6 sm:p-8">
    <div className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-center"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Tu calendario</p><h2 className="mt-2 text-3xl font-bold capitalize tracking-[-0.05em]">{title}</h2></div><div className="flex items-center gap-2"><button type="button" aria-label="Mes anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="border border-border px-4 py-2 text-lg">←</button><button type="button" aria-label="Mes siguiente" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="border border-border px-4 py-2 text-lg">→</button></div></div>
    <div className="mt-6 grid grid-cols-7 border-l border-t border-border">{weekdayNames.map((day) => <div key={day} className="border-b border-r border-border bg-secondary px-2 py-3 text-center font-mono text-xs font-bold">{day}</div>)}{Array.from({ length: start }).map((_, index) => <div key={`empty-${index}`} className="min-h-28 border-b border-r border-border bg-secondary/50" />)}{Array.from({ length: days }).map((_, index) => { const day = index + 1; const key = new Date(month.getFullYear(), month.getMonth(), day).toISOString().slice(0, 10); const reservation = reservedDates.get(key); return <div key={key} className={`min-h-28 border-b border-r border-border p-2 ${key === today ? 'bg-accent/10' : 'bg-background'}`}><span className={`inline-flex size-7 items-center justify-center font-mono text-xs font-bold ${reservation ? 'bg-accent text-accent-foreground' : ''}`}>{day}</span>{reservation && <div className="mt-3 text-xs font-semibold leading-5"><p>{new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(reservation.startsAt))}</p><p className="truncate text-muted-foreground">{reservation.training}</p></div>}</div> })}</div>
    <div className="mt-5 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="size-3 bg-accent" /> Reserva confirmada</span><span className="flex items-center gap-2"><span className="size-3 border border-border" /> Libre</span></div>
  </section>
}
