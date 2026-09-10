'use client'

import { useEffect, useMemo, useState } from 'react'

interface Slot {
  id: string
  startsAt: string
  endsAt: string
  remaining: number
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const madridTime = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function daysFor(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  return {
    offset: (first.getDay() + 6) % 7,
    count: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
  }
}

function keyFor(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function AvailabilityCalendar({ training }: { training: string }) {
  const [month, setMonth] = useState(() => new Date())
  const [selected, setSelected] = useState(() => keyFor(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { offset, count } = daysFor(month)
  const today = keyFor(new Date())
  const title = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(month)

  async function loadSlots(date: string) {
    setSelected(date)
    setSelectedSlot(null)
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`/api/bookings?date=${date}&training=${encodeURIComponent(training)}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se han podido cargar los horarios')
      setSlots(data.slots || [])
    } catch (error) {
      setSlots([])
      setMessage(error instanceof Error ? error.message : 'No se han podido cargar los horarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSlots(selected)
    // The selected date intentionally drives the availability request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, training])

  const selectedLabel = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date(`${selected}T12:00:00`))
  const availableCount = slots.filter((slot) => slot.remaining > 0).length
  const sortedSlots = useMemo(() => [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt)), [slots])

  async function reserve() {
    if (!selectedSlot) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlotId: selectedSlot }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se ha podido completar la reserva')
      setMessage('Reserva confirmada. Te esperamos en PGL TRAINNING.')
      await loadSlots(selected)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se ha podido completar la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-background p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Calendario de reservas</p>
              <h2 className="mt-2 text-2xl font-bold capitalize tracking-[-0.04em]">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Mes anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="border border-border px-3 py-2">←</button>
              <button type="button" aria-label="Mes siguiente" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="border border-border px-3 py-2">→</button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-7 border-l border-t border-border">
            {WEEKDAYS.map((day) => <div key={day} className="border-b border-r border-border bg-secondary py-3 text-center font-mono text-xs font-bold">{day}</div>)}
            {Array.from({ length: offset }).map((_, index) => <div key={`empty-${index}`} className="min-h-20 border-b border-r border-border bg-secondary/50" />)}
            {Array.from({ length: count }).map((_, index) => {
              const day = index + 1
              const date = new Date(month.getFullYear(), month.getMonth(), day)
              const key = keyFor(date)
              const past = key < today
              const chosen = key === selected
              const sunday = date.getDay() === 0
              return <button key={key} type="button" disabled={past || sunday} onClick={() => void loadSlots(key)} className={`min-h-20 border-b border-r border-border p-2 text-left transition-colors ${chosen ? 'bg-accent text-accent-foreground' : 'bg-background hover:bg-secondary'} ${past || sunday ? 'cursor-not-allowed opacity-35' : ''}`}><span className="font-mono text-xs font-bold">{day}</span>{key === today && <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wide">Hoy</span>}</button>
            })}
          </div>
        </div>

        <div className="bg-background p-5 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Horarios disponibles</p>
          <h3 className="mt-2 text-xl font-bold capitalize">{selectedLabel}</h3>
          <p className="mt-2 text-sm text-muted-foreground">Cada 15 minutos · selecciona una hora y confirma tu reserva.</p>
          {loading && <p className="mt-6 text-sm text-muted-foreground">Consultando reservas...</p>}
          {!loading && slots.length === 0 && <p className="mt-6 border border-border p-4 text-sm text-muted-foreground">No hay horarios disponibles para este día.</p>}
          {!loading && slots.length > 0 && <>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="size-3 bg-background ring-1 ring-border" /> Libre ({availableCount})</span><span className="flex items-center gap-2"><span className="size-3 bg-muted opacity-50" /> Ocupado</span></div>
            <div className="mt-4 grid max-h-[30rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {sortedSlots.map((slot) => {
                const available = slot.remaining > 0
                const chosen = selectedSlot === slot.id
                return <button key={slot.id} type="button" disabled={!available || loading} onClick={() => setSelectedSlot(slot.id)} aria-pressed={chosen} className={`flex items-center justify-between border p-3 text-left transition-colors ${chosen ? 'border-accent bg-accent text-accent-foreground' : available ? 'border-border bg-background hover:border-accent' : 'cursor-not-allowed border-border bg-muted opacity-50'}`}><span className="font-mono text-sm font-bold">{madridTime.format(new Date(slot.startsAt))}–{madridTime.format(new Date(slot.endsAt))}</span><span className="text-[11px]">{available ? 'Libre' : 'Ocupado'}</span></button>
              })}
            </div>
            <button type="button" disabled={!selectedSlot || loading} onClick={() => void reserve()} className="mt-6 w-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40">{loading ? 'Procesando...' : 'Confirmar reserva'}</button>
          </>}
          {message && <p className="mt-5 border border-accent p-4 text-sm font-semibold">{message}</p>}
        </div>
      </div>
    </section>
  )
}
