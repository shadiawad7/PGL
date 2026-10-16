'use client'

import { useEffect, useState } from 'react'
import { startMinutes, timeLabel } from '@/lib/schedule'

type Training = { id: string; durationMinutes: number }
type Day = { weekday: number; minutes: number[]; configured: boolean }
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function AdminSchedule({ trainings }: { trainings: Training[] }) {
  const [weekday, setWeekday] = useState(0)
  const [week, setWeek] = useState<Day[]>([])
  const [targets, setTargets] = useState([0])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(0)
  const minutes = startMinutes(Math.max(...trainings.map((type) => type.durationMinutes)))

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    fetch('/api/admin/schedule', { cache: 'no-store', signal: controller.signal }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se ha podido cargar la agenda')
      if (controller.signal.aborted) return
      setWeek(data.week); setSelected(data.week[weekday].minutes); setTargets([weekday]); setDirty(false)
    }).catch((err) => { if (!controller.signal.aborted) setError(err.message) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [weekday, reload])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function changeDay(value: number) {
    if (dirty && !window.confirm('Hay cambios sin publicar. ¿Quieres descartarlos?')) return
    setMessage(''); setWeekday(value)
  }
  async function save() {
    setSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/admin/schedule', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weekdays: targets, minutes: selected }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se ha podido guardar')
      setDirty(false); setMessage(`Plantilla publicada para ${data.days} día(s). Se repetirá todas las semanas para todos los entrenamientos.`); setReload((value) => value + 1)
    } catch (err) { setError(err instanceof Error ? err.message : 'Error de conexión') }
    finally { setSaving(false) }
  }
  const editable = !saving && !loading && week.length === 7
  return <section className="rounded-xl border border-border bg-background p-4 sm:p-7">
    <h2 className="text-2xl font-bold">Horario general de la semana</h2>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Esta plantilla se repite cada semana y se aplica a todos los entrenamientos. Puedes editar cualquier día y hora, aunque ya hayan pasado esta semana. Los clientes solo podrán reservar sesiones futuras.</p>
    <p className="mt-2 text-xs text-muted-foreground">Hora de Madrid · inicios cada 10 minutos desde las 08:00 · final máximo a las 23:00. Cada entrenamiento mantiene su duración y aforo. Las reservas existentes no se cancelan.</p>
    <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">{days.map((day, index) => <button key={day} type="button" disabled={saving || loading} aria-pressed={weekday === index} onClick={() => changeDay(index)} className={`min-h-14 rounded border p-2 text-xs font-semibold ${weekday === index ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{day}</button>)}</div>
    {loading ? <p className="py-8 text-sm">Cargando plantilla…</p> : editable || saving ? <>
      {!week[weekday]?.configured && <p className="mt-4 text-sm text-muted-foreground">Este día aún no tiene plantilla. Publica sus horarios para sustituir la disponibilidad que se hubiera configurado por fechas.</p>}
      <p className="mt-5 font-semibold">{days[weekday]} · {selected.length} horas seleccionadas</p>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={saving} onClick={() => { setSelected(minutes); setDirty(true) }} className="min-h-11 rounded border border-border px-3 text-sm">Seleccionar todas</button><button type="button" disabled={saving} onClick={() => { setSelected([]); setDirty(true) }} className="min-h-11 rounded border border-border px-3 text-sm">Desmarcar todas</button></div>
      <div className="mt-4 grid max-h-[32rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">{[...new Set([...minutes, ...selected])].sort((a,b) => a-b).map((minute) => {
        const checked = selected.includes(minute)
        return <label key={minute} className={`flex min-h-16 cursor-pointer items-center gap-2 rounded border p-3 text-sm ${checked ? 'border-red-600 bg-red-500/15' : 'border-border'}`}><input type="checkbox" checked={checked} disabled={saving} onChange={() => { setSelected((values) => checked ? values.filter((v) => v !== minute) : [...values, minute]); setDirty(true); setMessage('') }} className="size-4 shrink-0 accent-red-600" /><span><span className="font-mono font-bold">{timeLabel(minute)}</span><span className="block text-[11px] text-muted-foreground">{checked ? 'Seleccionado' : 'No seleccionado'}</span></span></label>
      })}</div>
      <fieldset disabled={saving} className="mt-7 rounded border border-border p-4"><legend className="px-2 font-semibold">Aplicar también a otros días</legend><p className="text-sm text-muted-foreground">Se sustituirá la plantilla de los días seleccionados para todas las semanas futuras.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setTargets([0,1,2,3,4]); setDirty(true) }} className="min-h-11 rounded border border-border px-3 text-sm">Lunes a viernes</button><button type="button" onClick={() => { setTargets([0,1,2,3,4,5,6]); setDirty(true) }} className="min-h-11 rounded border border-border px-3 text-sm">Toda la semana</button><button type="button" onClick={() => { setTargets([weekday]); setDirty(true) }} className="min-h-11 rounded border border-border px-3 text-sm">Solo {days[weekday].toLowerCase()}</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{days.map((day, index) => <label key={day} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={targets.includes(index)} onChange={(event) => { setTargets((values) => event.target.checked ? [...values, index] : values.filter((value) => value !== index)); setDirty(true) }} className="size-4 accent-red-600" />{day}</label>)}</div></fieldset>
      {!selected.length && <p className="mt-4 text-sm">Publicar sin horas dejará esos días cerrados a nuevas reservas.</p>}
      <button type="button" disabled={!dirty || saving || !targets.length} onClick={() => void save()} className="mt-6 min-h-12 rounded bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40">{saving ? 'Publicando…' : `Publicar plantilla · ${targets.length} día(s)`}</button>{dirty && <p className="mt-3 text-sm text-muted-foreground">Cambios sin publicar</p>}
    </> : null}
    {error && <div className="mt-4 text-sm"><p role="alert">{error}</p><button type="button" disabled={saving} onClick={() => { if (!dirty || window.confirm('¿Descartar los cambios y recargar?')) setReload((value) => value + 1) }} className="mt-2 underline">Volver a cargar</button></div>}
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
  </section>
}
