export const TIME_ZONE = 'Europe/Madrid'
export const OPEN_MINUTE = 8 * 60
export const CLOSE_MINUTE = 23 * 60
export const STEP_MINUTES = 10

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function dateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  return ['year', 'month', 'day'].map((type) => parts.find((part) => part.type === type)!.value).join('-')
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function mondayOf(date: string) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay()
  return addDays(date, -((day + 6) % 7))
}

export function timeLabel(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

export function startMinutes(duration: number) {
  if (!Number.isInteger(duration) || duration < 1) return []
  const result: number[] = []
  for (let minute = OPEN_MINUTE; minute + duration <= CLOSE_MINUTE; minute += STEP_MINUTES) result.push(minute)
  return result
}

// Find the UTC instant for a Madrid wall-clock time, including winter/summer time.
export function madridDate(date: string, minute: number) {
  if (!isDateKey(date) || !Number.isInteger(minute) || minute < 0 || minute >= 1440) throw new Error('Invalid date/time')
  const desired = Date.parse(`${date}T${timeLabel(minute)}:00Z`)
  let instant = desired
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(new Date(instant))
    const get = (type: string) => parts.find((part) => part.type === type)!.value
    const wall = Date.parse(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`)
    instant += desired - wall
  }
  return new Date(instant)
}

export function minuteInMadrid(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  return Number(parts.find((p) => p.type === 'hour')!.value) * 60 + Number(parts.find((p) => p.type === 'minute')!.value)
}
