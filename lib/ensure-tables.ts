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
    // Default times aligned with actual gym opening hours
    // Mon, Wed, Fri: 6:00-22:00 | Tue, Thu: 7:00-22:00 | Sat: 7:00-12:00, 16:00-20:00
    const weekdayTimes: Record<number, string[]> = {
      0: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'], // Mon
      1: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'], // Tue
      2: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'], // Wed
      3: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'], // Thu
      4: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'], // Fri
      5: ['08:00', '09:30', '11:00', '16:00', '17:30', '19:00'],                   // Sat (split hours)
      // 6 = Sun: no schedule (gym closed)
    }
    const batch: { sql: string; args: (string | number)[] }[] = []
    for (const trainer of trainers.rows) {
      for (const [weekday, times] of Object.entries(weekdayTimes)) {
        for (const time of times) {
          batch.push({
            sql: 'INSERT OR IGNORE INTO trainer_schedules (trainer_id, weekday, time) VALUES (?, ?, ?)',
            args: [trainer.id as string, Number(weekday), time],
          })
        }
      }
    }
    if (batch.length > 0) {
      await db.batch(batch, 'write')
    }
  }

  tablesEnsured = true
}

