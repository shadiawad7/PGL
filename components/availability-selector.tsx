'use client'

import { useMemo, useState } from 'react'

interface Slot { id: string; startsAt: string; endsAt: string; remaining: number }

const madridFormatter = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })

export function AvailabilitySelector({ training }: { training: string }) {
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const availability = useMemo(() => {
    const selected = date ? new Date(`${date}T12:00:00`) : null
    const day = selected?.getDay()
    return day === 0 ? 'Domingo cerrado' : day === 6 ? 'Sábados · 08:00–14:00' : 'Lunes–viernes · 08:00–14:00 y 16:00–22:00'
  }, [date])

  async function loadSlots(value: string) {
    setDate(value); setMessage(''); setSlots([])
    if (!value) return
    setLoading(true)
    try {
      const response = await fetch(`/api/bookings?date=${encodeURIComponent(value)}&training=${encodeURIComponent(training)}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se han podido cargar los horarios')
      setSlots(data.slots || [])
      if (data.message) setMessage(data.message)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se han podido cargar los horarios') } finally { setLoading(false) }
  }

  async function reserve(timeSlotId: string) {
    setLoading(true); setMessage('')
    try {
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeSlotId }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se ha podido completar la reserva')
      setMessage(`Reserva confirmada: ${madridFormatter.format(new Date(data.startsAt))}–${madridFormatter.format(new Date(data.endsAt))}.`)
      await loadSlots(date)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se ha podido completar la reserva') } finally { setLoading(false) }
  }

  return <div className="mt-12 border-t border-border pt-8">
    <div className="flex flex-col gap-6 border border-border bg-background p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Calendario de reservas</p><h2 className="mt-2 text-2xl font-bold">Elige fecha y hora</h2><p className="mt-2 text-sm text-muted-foreground">{availability}. Cada hueco dura {training === 'Valoración inicial' ? 45 : training === 'Small group' ? 50 : 60} minutos.</p></div>
      <label className="flex w-full max-w-xs flex-col gap-2 text-sm font-semibold">Fecha<input type="date" value={date} min={new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' })} onChange={(event) => loadSlots(event.target.value)} className="border border-border bg-secondary px-4 py-3 font-normal" /></label>
    </div>
    {loading && <p className="mt-8 text-sm text-muted-foreground">Consultando reservas y huecos libres...</p>}
    {!loading && date && slots.length === 0 && !message && <p className="mt-8 border border-border bg-background p-5 text-sm text-muted-foreground">No hay huecos libres para este día.</p>}
    {message && <p className="mt-6 border border-accent bg-background p-4 text-sm font-semibold">{message}</p>}
    <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{slots.map((slot) => <button key={slot.id} type="button" disabled={loading || slot.remaining < 1} onClick={() => reserve(slot.id)} className="flex flex-col gap-2 border border-border bg-background p-4 text-left transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"><span className="font-mono text-lg font-bold">{madridFormatter.format(new Date(slot.startsAt))}–{madridFormatter.format(new Date(slot.endsAt))}</span><span className="text-xs text-muted-foreground">{slot.remaining} {slot.remaining === 1 ? 'plaza disponible' : 'plazas disponibles'}</span></button>)}</div>
  </div>
}
