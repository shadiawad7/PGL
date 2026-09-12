'use client'

import { useEffect, useMemo, useState } from 'react'

interface Training { id: string; name: string; description: string; durationMinutes: number; capacity: number; price: number; active: boolean }
interface Booking { id: string; startsAt: string; endsAt: string; training: string; customer: string; email: string; status: string }
interface DashboardData { bookings: Booking[]; users: { id: string; name: string; email: string; createdAt: string }[]; trainings: Training[]; stats: { users: number; bookings: number; sessions: number } }
const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const weekDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const madridFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' })
const madridDateKey = (value: Date | string) => madridFormatter.format(new Date(value))
const formatDate = (value: string) => new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(value))
const formatTime = (value: string) => new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date(value))

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [tab, setTab] = useState<'calendar' | 'clients' | 'sessions'>('sessions')
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editing, setEditing] = useState<Training | null>(null)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  async function refresh() {
    setLoadError('')
    try {
      const response = await fetch('/api/admin/overview', { cache: 'no-store' })
      if (!response.ok) throw new Error('No se ha podido cargar el panel. Comprueba tu sesión e inténtalo de nuevo.')
      setData(await response.json())
    } catch {
      setLoadError('No se ha podido cargar el panel. Comprueba tu conexión y vuelve a intentarlo.')
    }
  }
  useEffect(() => { refresh() }, [])
  const calendarDays = useMemo(() => { const first = new Date(month.getFullYear(), month.getMonth(), 1); const offset = (first.getDay() + 6) % 7; const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))] }, [month])
  const selectedBookings = selectedDay ? data?.bookings.filter((booking) => madridDateKey(booking.startsAt) === selectedDay) ?? [] : []
  async function removeBooking(id: string) { if (!window.confirm('¿Eliminar esta reserva?')) return; await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' }); setMessage('Reserva eliminada'); refresh() }
  async function removeUser(id: string) { if (!window.confirm('¿Eliminar este cliente?')) return; await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); setMessage('Cliente eliminado'); refresh() }
  async function saveTraining(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || saving) return
    setSaving(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') || '').trim(), description: String(form.get('description') || '').trim(),
      durationMinutes: Number(form.get('durationMinutes')), capacity: Number(form.get('capacity')),
      price: Number(form.get('price')), active: form.get('active') === 'on',
    }
    try {
      const response = await fetch(`/api/admin/trainings/${encodeURIComponent(editing.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'No se pudo actualizar el entrenamiento')
      }
      setEditing(null)
      setMessage('Entrenamiento actualizado. Los cambios ya están disponibles en la página de reservas.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar. Comprueba la conexión e inténtalo de nuevo.')
    } finally { setSaving(false) }
  }
  if (!data && loadError) return <div className="mt-12 bg-background p-8"><p role="alert">{loadError}</p><button onClick={() => void refresh()} className="mt-4 underline">Reintentar</button></div>
  if (!data) return <div className="mt-12 bg-background p-8 text-sm text-muted-foreground">Cargando panel de administración...</div>
  return <div className="mt-10 flex flex-col gap-8">{loadError && <p role="alert">{loadError}</p>}
    {message && <p className="border border-border bg-background p-4 text-sm font-semibold">{message}</p>}
    <div className="grid gap-px bg-border sm:grid-cols-3"><Stat label="Clientes" value={data.stats.users} /><Stat label="Reservas" value={data.stats.bookings} /><Stat label="Franjas creadas" value={data.stats.sessions} /></div>
    <nav className="flex flex-wrap gap-2 border-b border-border pb-3">{[['sessions','Entrenamientos'],['calendar','Calendario'],['clients','Clientes']].map(([key,label]) => <button key={key} onClick={() => setTab(key as typeof tab)} className={`px-4 py-3 text-sm font-semibold ${tab === key ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>{label}</button>)}</nav>
    {tab === 'calendar' && <section className="grid gap-6 xl:grid-cols-[1fr_380px]"><div className="bg-background p-5 sm:p-7"><div className="flex items-center justify-between"><button aria-label="Mes anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="px-3 py-2 text-xl">‹</button><h2 className="text-xl font-bold capitalize">{monthNames[month.getMonth()]} {month.getFullYear()}</h2><button aria-label="Mes siguiente" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="px-3 py-2 text-xl">›</button></div><div className="mt-6 grid grid-cols-7 gap-px bg-border">{weekDays.map((day) => <div key={day} className="bg-primary p-2 text-center font-mono text-[10px] uppercase text-primary-foreground">{day}</div>)}{calendarDays.map((date, index) => { const key = date ? madridDateKey(date) : null; const bookings = key ? data.bookings.filter((booking) => madridDateKey(booking.startsAt) === key) : []; return <button key={index} disabled={!date} onClick={() => key && setSelectedDay(key)} className={`min-h-20 bg-background p-2 text-left align-top ${key === selectedDay ? 'ring-2 ring-inset ring-accent' : ''} ${!date ? 'cursor-default opacity-30' : 'hover:bg-secondary'}`}><span className="text-sm font-semibold">{date?.getDate()}</span>{bookings.length > 0 && <span className="mt-2 block rounded-sm bg-accent px-1.5 py-1 text-[10px] font-bold text-accent-foreground">{bookings.length} reserva{bookings.length === 1 ? '' : 's'}</span>}</button> })}</div></div><aside className="bg-primary p-6 text-primary-foreground"><p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Detalle del día</p><h2 className="mt-3 text-2xl font-bold">{selectedDay ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date(`${selectedDay}T12:00:00`)) : 'Selecciona un día'}</h2>{selectedDay && <div className="mt-7 flex flex-col gap-4">{selectedBookings.length === 0 ? <p className="text-sm text-primary-foreground/60">No hay reservas. Todos los horarios están libres.</p> : selectedBookings.map((booking) => <article key={booking.id} className="border border-primary-foreground/20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{booking.customer}</p><p className="text-xs text-primary-foreground/65">{booking.email}</p></div><span className="font-mono text-xs text-accent">{formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}</span></div><p className="mt-3 text-sm">{booking.training}</p><div className="mt-4 flex gap-4 text-xs font-semibold"><button onClick={() => removeBooking(booking.id)} className="text-accent underline">Eliminar</button><span className="text-primary-foreground/60">{booking.status}</span></div></article>)}</div>}</aside></section>}
    {tab === 'clients' && <section className="overflow-x-auto bg-background"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border"><tr>{['Cliente','Email','Alta','Acciones'].map((heading) => <th key={heading} className="p-5 font-mono text-xs uppercase tracking-[0.12em]">{heading}</th>)}</tr></thead><tbody>{data.users.map((client) => <tr key={client.id} className="border-b border-border last:border-0"><td className="p-5 font-semibold">{client.name}</td><td className="p-5 text-muted-foreground">{client.email}</td><td className="p-5 text-muted-foreground">{formatDate(client.createdAt)}</td><td className="p-5"><button onClick={() => removeUser(client.id)} className="text-accent underline">Eliminar</button></td></tr>)}</tbody></table></section>}
    {tab === 'sessions' && <section className="grid gap-4 md:grid-cols-3"><p className="text-sm text-muted-foreground md:col-span-3">Edita los formatos que ven tus clientes al reservar. Para hacer una reserva, utiliza Vista cliente.</p>{data.trainings.map((training) => <article key={training.id} className="flex flex-col gap-5 bg-background p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{training.name}</h3><p className="mt-1 text-sm text-muted-foreground">{training.durationMinutes} min · {training.capacity} plazas · {training.price} €</p></div><span className={`text-xs font-bold uppercase tracking-[0.1em] ${training.active ? 'text-accent' : 'text-muted-foreground'}`}>{training.active ? 'Activa' : 'Inactiva'}</span></div><p className="text-sm text-muted-foreground">{training.description}</p><button onClick={() => setEditing(training)} className="self-start border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">Editar entrenamiento</button></article>)}</section>}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 p-5" role="dialog" aria-modal="true" aria-label="Editar entrenamiento"><form onSubmit={saveTraining} className="w-full max-w-xl bg-background p-6 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Editar entrenamiento</h2><button type="button" onClick={() => setEditing(null)} disabled={saving} aria-label="Cerrar" className="text-2xl">×</button></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-semibold">Nombre<input name="name" maxLength={120} defaultValue={editing.name} required className="border border-border bg-background p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Descripción<textarea name="description" maxLength={2000} defaultValue={editing.description} required rows={4} className="border border-border bg-background p-3 font-normal" /></label><div className="grid gap-4 sm:grid-cols-3"><label className="grid gap-2 text-sm font-semibold">Duración (min)<input name="durationMinutes" type="number" min="15" max="240" step="1" defaultValue={editing.durationMinutes} required className="border border-border bg-background p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Plazas<input name="capacity" type="number" min="1" max="50" defaultValue={editing.capacity} required className="border border-border bg-background p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Precio (€)<input name="price" type="number" min="0" step="1" defaultValue={editing.price} required className="border border-border bg-background p-3 font-normal" /></label></div></div><label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={editing.active} />Visible para reservar</label>{message && <p role="status" className="mt-4 text-sm">{message}</p>}<button type="submit" disabled={saving} className="mt-6 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">{saving ? 'Guardando…' : 'Guardar cambios'}</button></form></div>}
  </div>
}
function Stat({ label, value }: { label: string; value: number }) { return <div className="bg-background p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-4xl font-bold tracking-[-0.05em]">{value}</p></div> }
