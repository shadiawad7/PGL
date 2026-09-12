import { Pool } from 'pg'

// Reuse connections across development hot reloads and between auth and Drizzle.
const globalDatabase = globalThis as typeof globalThis & { pglPool?: Pool }

export const pool = globalDatabase.pglPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  max: 10,
})

if (!globalDatabase.pglPool) {
  pool.on('error', (error) => {
    console.error('PostgreSQL idle connection failed', { code: (error as Error & { code?: string }).code })
  })
}
globalDatabase.pglPool = pool
