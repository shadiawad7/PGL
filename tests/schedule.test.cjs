const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, dependencies = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => dependencies[id] ?? require(id), Date, Intl, URL, Response, crypto: require('node:crypto').webcrypto })
  return module.exports
}
const availability = load('lib/booking-availability.ts')
const schedule = load('lib/schedule.ts')
const weekly = load('lib/weekly-schedule.ts', { './schedule': schedule })

test('real calendar dates only', () => {
  for (const date of ['2026-02-30', '2026-13-01', 'invalid', null]) assert.equal(schedule.isDateKey(date), false)
  assert.equal(schedule.isDateKey('2028-02-29'), true)
})
test('10-minute starts, opening at 08:00 and sessions finishing by 23:00', () => {
  const minutes = Array.from(schedule.startMinutes(50))
  assert.equal(minutes[0], 480)
  assert.equal(minutes.at(-1), 1330)
  assert.ok(minutes.every((m, i) => i === 0 || m - minutes[i - 1] === 10))
  assert.equal(schedule.startMinutes(45).at(-1), 1330)
  assert.equal(schedule.startMinutes(60).at(-1), 1320)
  assert.equal(schedule.startMinutes(0).length, 0)
})
test('Madrid dates respect winter, summer and transition Sundays', () => {
  for (const [date, utc] of [['2026-01-15','07:00'],['2026-07-15','06:00'],['2026-03-29','06:00'],['2026-10-25','07:00']]) {
    const value = schedule.madridDate(date, 480)
    assert.equal(value.toISOString(), `${date}T${utc}:00.000Z`)
    assert.equal(schedule.minuteInMadrid(value), 480)
    assert.equal(schedule.dateKey(value), date)
  }
  assert.equal((schedule.madridDate('2026-03-30',0) - schedule.madridDate('2026-03-29',0))/3600000,23)
  assert.equal((schedule.madridDate('2026-10-26',0) - schedule.madridDate('2026-10-25',0))/3600000,25)
})
test('week navigation crosses months and years', () => {
  assert.equal(schedule.mondayOf('2027-01-03'), '2026-12-28')
  assert.equal(schedule.addDays('2026-12-28', 7), '2027-01-04')
})

function bookingApi({ session = { user: { id: 'client-1' } }, slot, count = 0, existing = [], lookup = true, recurring = null, overlaps = [] } = {}) {
  const calls = []
  const client = {
    query: async (sql, values) => {
      calls.push({ sql, values })
      if (sql.startsWith('SELECT "trainingTypeId"')) return { rows: lookup ? [{ trainingTypeId: 'training-1' }] : [] }
      if (sql.startsWith('SELECT * FROM training_type')) return { rows: [{ id: 'training-1', active: true, durationMinutes: 50, capacity: 1 }] }
      if (sql.includes('FROM time_slot WHERE id')) return { rows: slot ? [slot] : [] }
      if (sql.startsWith('SELECT id, status FROM booking')) return { rows: existing }
      if (sql.includes('FROM booking b JOIN time_slot')) return { rows: overlaps }
      if (sql.startsWith('SELECT count')) return { rows: [{ count }] }
      return { rows: [] }
    }, release: () => calls.push({ sql: 'RELEASE' }),
  }
  return { calls, api: load('app/api/bookings/route.ts', {
    'next/headers': { headers: async () => ({}) },
    'next/server': { NextResponse: { json: (value, options) => Response.json(value, options) } },
    '@/lib/auth': { auth: { api: { getSession: async () => session } } },
    '@/lib/db': { pool: { connect: async () => client, query: client.query } },
    '@/lib/booking-availability': availability,
    '@/lib/schedule': schedule,
    '@/lib/weekly-schedule': { ...weekly, readWeeklySchedule: async () => recurring },
  }) }
}
const request = (id = 'slot-1') => new Request('http://localhost/api/bookings', { method: 'POST', body: JSON.stringify({ timeSlotId: id }) })
const futureSlot = { id: 'slot-1', status: 'available', capacity: 1, startsAt: new Date('2099-10-20T08:00:00Z'), endsAt: new Date('2099-10-20T09:00:00Z') }
test('unauthenticated bookings cannot access the database', async () => {
  const { api, calls } = bookingApi({ session: null })
  assert.equal((await api.POST(request())).status, 401)
  assert.equal(calls.length, 0)
})
test('hidden or invented slots cannot be reserved', async () => {
  for (const options of [{ slot: { ...futureSlot, status: 'hidden' } }, { lookup: false }]) {
    const { api, calls } = bookingApi(options)
    assert.equal((await api.POST(request('generated:training-1:2099-10-20:480'))).status, 409)
    assert.ok(calls.some(c => c.sql === 'ROLLBACK'))
    assert.ok(!calls.some(c => c.sql.startsWith('INSERT')))
  }
})
test('full slots are rejected before insertion', async () => {
  const { api, calls } = bookingApi({ slot: futureSlot, count: 1 })
  assert.equal((await api.POST(request())).status, 409)
  assert.ok(!calls.some(c => c.sql.startsWith('INSERT')))
})
test('booking is confirmed with server session ownership under a transaction', async () => {
  const { api, calls } = bookingApi({ slot: futureSlot })
  assert.equal((await api.POST(request())).status, 200)
  assert.equal(calls[0].sql, 'BEGIN')
  assert.ok(calls.findIndex(c => c.sql.includes('FOR UPDATE')) < calls.findIndex(c => c.sql.startsWith('SELECT count')))
  const insert = calls.find(c => c.sql.startsWith('INSERT INTO booking'))
  assert.equal(insert.values[1], 'client-1')
  assert.ok(calls.some(c => c.sql === 'COMMIT'))
})

function adminApi({ role = 'admin', existing = [] } = {}) {
  const calls = []
  const client = {
    query: async (sql, values) => {
      calls.push({ sql, values })
      if (sql.includes('to_regclass')) return { rows: [{ name: 'weekly_schedule' }] }
      if (sql.startsWith('SELECT * FROM training_type')) return { rows: [{ id: 'training-1', durationMinutes: 50, capacity: 4 }, { id: 'training-2', durationMinutes: 60, capacity: 1 }, { id: 'training-3', durationMinutes: 45, capacity: 1 }] }
      if (sql.includes('FROM time_slot')) return { rows: existing }
      return { rows: [] }
    }, release: () => {},
  }
  const chain = { from() { return this }, where() { return this }, async limit() { return [{ role }] } }
  return { calls, api: load('app/api/admin/schedule/route.ts', {
    'next/headers': { headers: async () => ({}) },
    'next/server': { NextResponse: { json: (value, options) => Response.json(value, options) } },
    'drizzle-orm': { eq: () => null },
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { id: 'admin-1' } }) } } },
    '@/lib/db': { db: { select: () => chain }, pool: { connect: async () => client, query: client.query } },
    '@/lib/db/schema': { user: { role: 'role', id: 'id' } },
    '@/lib/booking-availability': availability,
    '@/lib/schedule': schedule,
  }) }
}
const publish = (minutes) => new Request('http://localhost/api/admin/schedule', { method: 'PUT', body: JSON.stringify({ weekdays: [0], minutes }) })
test('clients cannot read or publish administrative schedules', async () => {
  const { api, calls } = adminApi({ role: 'client' })
  assert.equal((await api.PUT(publish([480]))).status, 403)
  assert.equal((await api.GET()).status, 403)
  assert.equal(calls.length, 0)
})
test('admin cannot publish off-grid times or a session finishing after 23:00', async () => {
  for (const minutes of [[485], [1340], [479], [1380]]) {
    const { api, calls } = adminApi()
    assert.equal((await api.PUT(publish(minutes))).status, 400)
    assert.ok(!calls.some(c => c.sql.startsWith('UPDATE') || c.sql.startsWith('INSERT')))
  }
})

test('closing a weekday stores an empty recurring template without touching bookings', async () => {
  const { api, calls } = adminApi()
  assert.equal((await api.PUT(publish([]))).status, 200)
  const insert = calls.find(c => c.sql.startsWith('INSERT INTO weekly_schedule'))
  assert.equal(insert.values[0], 0)
  assert.equal(insert.values[1].length, 0)
  assert.ok(!calls.some(c => /DELETE|UPDATE booking|INSERT INTO time_slot/.test(c.sql)))
})
test('all weekdays can be edited without a current-date restriction', async () => {
  const { api, calls } = adminApi()
  const response = await api.PUT(new Request('http://localhost/api/admin/schedule', { method: 'PUT', body: JSON.stringify({ weekdays: [0,1,2,3,4,5,6], minutes: [480,540] }) }))
  assert.equal(response.status, 200)
  assert.equal(calls.filter(c => c.sql.startsWith('INSERT INTO weekly_schedule')).length, 7)
  assert.equal(calls.filter(c => c.sql === 'COMMIT').length, 1)
})
test('weekly configuration rejects invalid weekdays and overlong sessions', async () => {
  for (const body of [{ weekdays: [7], minutes: [480] }, { weekdays: [-1], minutes: [480] }, { weekdays: [], minutes: [480] }, { weekdays: [0], minutes: [1330] }]) {
    const { api, calls } = adminApi()
    const response = await api.PUT(new Request('http://localhost/api/admin/schedule', { method: 'PUT', body: JSON.stringify(body) }))
    assert.equal(response.status, 400)
    assert.ok(!calls.some(c => c.sql.startsWith('INSERT')))
  }
})
test('a closed weekly template blocks previously published date-specific slots', async () => {
  const { api } = bookingApi({ slot: futureSlot, recurring: [] })
  assert.equal((await api.POST(request())).status, 409)
})
test('weekly openings override old hidden date-specific slots', async () => {
  const { api } = bookingApi({ slot: { ...futureSlot, status: 'hidden' }, recurring: [schedule.minuteInMadrid(futureSlot.startsAt)] })
  assert.equal((await api.POST(request())).status, 200)
})
test('past bookings remain forbidden even with a published weekly template', async () => {
  const { api } = bookingApi({ slot: { ...futureSlot, startsAt: new Date('2000-01-01T08:00:00Z') }, recurring: [540] })
  assert.equal((await api.POST(request())).status, 409)
})
test('weekly virtual slots validate dates and preserve arbitrary training ids', () => {
  const id = weekly.weeklySlotId('group: one', '2099-10-20', 480)
  assert.equal(weekly.parseWeeklySlotId(id).trainingId, 'group: one')
  assert.equal(weekly.parseWeeklySlotId('weekly:one:2099-02-30:480'), null)
  assert.equal(weekly.weekdayFor('2026-10-12'), 0)
})

const time = (value) => new Date(`2099-10-20T${value}:00Z`)
const occupied = { timeSlotId: 'other-session', userId: 'another-client', startsAt: time('09:50'), endsAt: time('10:35') }
test('09:50–10:35 blocks earlier, contained, later and encompassing sessions', () => {
  for (const [start,end] of [['09:20','10:05'],['10:00','10:45'],['10:10','10:20'],['10:30','11:15'],['09:00','11:00']]) {
    assert.equal(availability.remainingPlaces({ id: 'candidate', capacity: 6, startsAt: time(start), endsAt: time(end) }, [occupied], 'client-1'), 0)
  }
})
test('adjacent sessions do not overlap', () => {
  for (const [start,end] of [['09:00','09:50'],['10:35','11:20'],['10:40','11:25']]) {
    assert.equal(availability.remainingPlaces({ id: 'candidate', capacity: 1, startsAt: time(start), endsAt: time(end) }, [occupied], 'client-1'), 1)
  }
})
test('same group keeps remaining capacity but prevents a client booking twice', () => {
  const slot = { id: occupied.timeSlotId, capacity: 4, startsAt: occupied.startsAt, endsAt: occupied.endsAt }
  assert.equal(availability.remainingPlaces(slot, [occupied], 'client-1'), 3)
  assert.equal(availability.remainingPlaces(slot, [occupied], occupied.userId), 0)
  assert.equal(availability.remainingPlaces({ ...slot, capacity: 1 }, [occupied], 'client-1'), 0)
})
test('server rejects overlapping bookings even when the requested slot has capacity', async () => {
  const { api, calls } = bookingApi({ slot: { ...futureSlot, startsAt: time('10:00'), endsAt: time('10:45'), capacity: 6 }, overlaps: [occupied] })
  assert.equal((await api.POST(request())).status, 409)
  assert.ok(!calls.some(c => c.sql.startsWith('INSERT INTO booking')))
  assert.ok(calls.some(c => c.sql === 'ROLLBACK'))
})

test('availability marks overlapping slots occupied for both weekly and date-specific schedules', async () => {
  const date = '2099-10-20'
  const localOccupied = { timeSlotId: 'another-format-slot', userId: 'other-client', startsAt: schedule.madridDate(date, 590), endsAt: schedule.madridDate(date, 635) }
  const minutes = [590,600,630,640]
  for (const recurring of [minutes, null]) {
    const api = load('app/api/bookings/route.ts', {
      'next/headers': { headers: async () => ({}) },
      'next/server': { NextResponse: { json: (value, options) => Response.json(value, options) } },
      '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { id: 'client-1' } }) } } },
      '@/lib/db': { pool: { query: async (sql) => {
        if (sql.includes('FROM booking b JOIN time_slot')) return { rows: [localOccupied] }
        if (sql.startsWith('SELECT * FROM training_type')) return { rows: [{ id: 'training-1', durationMinutes: 45, capacity: 1 }] }
        if (recurring) return { rows: [] }
        return { rows: minutes.map((minute) => ({ id: `slot-${minute}`, capacity: 1, startsAt: schedule.madridDate(date, minute), endsAt: schedule.madridDate(date, minute + 45) })) }
      } } },
      '@/lib/schedule': schedule,
      '@/lib/weekly-schedule': { ...weekly, readWeeklySchedule: async () => recurring },
      '@/lib/booking-availability': availability,
    })
    const response = await api.GET(new Request(`http://localhost/api/bookings?date=${date}&trainingId=training-1`))
    assert.equal(response.status, 200)
    assert.deepEqual((await response.json()).slots.map(slot => slot.remaining), [0,0,0,1])
  }
})
