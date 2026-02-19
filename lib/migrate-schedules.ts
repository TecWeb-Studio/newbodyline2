/**
 * Migration: add trainer_schedules and trainer_vacations tables
 * Run: npx tsx lib/migrate-schedules.ts
 */
import 'dotenv/config'
import { db } from './db'

async function migrate() {
  // ── trainer_schedules ─────────────────────────────────────────────────────
  // Each row = one time slot that a trainer offers on a given weekday (0=Mon … 6=Sun)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trainer_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id TEXT NOT NULL,
      weekday INTEGER NOT NULL CHECK(weekday >= 0 AND weekday <= 6),
      time TEXT NOT NULL,
      FOREIGN KEY (trainer_id) REFERENCES trainers(id),
      UNIQUE(trainer_id, weekday, time)
    )
  `)
  console.log('✅ trainer_schedules table created')

  // ── trainer_vacations ─────────────────────────────────────────────────────
  // Each row = a vacation range [start_date, end_date] inclusive
  await db.execute(`
    CREATE TABLE IF NOT EXISTS trainer_vacations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (trainer_id) REFERENCES trainers(id)
    )
  `)
  console.log('✅ trainer_vacations table created')

  // ── Seed default schedule for all trainers (Mon-Sat, 8 slots) ────────────
  const trainers = await db.execute('SELECT id FROM trainers')
  const defaultTimes = ['09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30']

  for (const trainer of trainers.rows) {
    for (let weekday = 0; weekday <= 5; weekday++) { // Mon(0) to Sat(5)
      for (const time of defaultTimes) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO trainer_schedules (trainer_id, weekday, time) VALUES (?, ?, ?)',
          args: [trainer.id as string, weekday, time],
        })
      }
    }
  }
  console.log('✅ Default schedules seeded (Mon–Sat, 09:00–19:30)')

  console.log('🎉 Migration complete')
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
