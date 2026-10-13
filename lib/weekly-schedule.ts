import type { Pool, PoolClient } from 'pg'
import { isDateKey } from './schedule'

export function weekdayFor(date: string) {
  return (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7
}

export async function readWeeklySchedule(connection: Pool | PoolClient, weekday: number) {
  // to_regclass avoids aborting a booking transaction before the migration is applied.
  const ready = await connection.query("SELECT to_regclass('public.weekly_schedule') AS name")
  if (!ready.rows[0]?.name) return null
  const { rows } = await connection.query('SELECT minutes FROM weekly_schedule WHERE weekday = $1', [weekday])
  return rows[0] ? rows[0].minutes as number[] : null
}

export function weeklySlotId(trainingId: string, date: string, minute: number) {
  return `weekly:${encodeURIComponent(trainingId)}:${date}:${minute}`
}

export function parseWeeklySlotId(value: string) {
  const match = /^weekly:([^:]+):(\d{4}-\d{2}-\d{2}):(\d{3,4})$/.exec(value)
  if (!match || !isDateKey(match[2])) return null
  try { return { trainingId: decodeURIComponent(match[1]), date: match[2], minute: Number(match[3]) } } catch { return null }
}
