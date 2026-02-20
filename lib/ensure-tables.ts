/**
 * Ensures trainer_schedules and trainer_vacations tables exist.
 * Called at the start of API routes that use them — safe to call on every request
 * because CREATE TABLE IF NOT EXISTS is a no-op when tables already exist.
 * On the very first call it also seeds a default schedule for all trainers.
 */
import { db } from './db'

let tablesEnsured = false

export async function ensureTables() {
  if (tablesEnsured) return // already done in this server process

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

  // Seed default schedule if the table was just created (no rows at all)
  const existing = await db.execute('SELECT COUNT(*) as cnt FROM trainer_schedules')
  const count = (existing.rows[0]?.cnt as number) ?? 0

  if (count === 0) {
    const trainers = await db.execute('SELECT id FROM trainers')
    const defaultTimes = [
      '09:00', '10:30', '12:00', '13:30',
      '15:00', '16:30', '18:00', '19:30',
    ]
    for (const trainer of trainers.rows) {
      for (let weekday = 0; weekday <= 5; weekday++) { // Mon(0)–Sat(5)
        for (const time of defaultTimes) {
          await db.execute({
            sql: 'INSERT OR IGNORE INTO trainer_schedules (trainer_id, weekday, time) VALUES (?, ?, ?)',
            args: [trainer.id as string, weekday, time],
          })
        }
      }
    }
  }

  tablesEnsured = true
}

