import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULT_TIMES = [
  '09:00', '10:30', '12:00', '13:30',
  '15:00', '16:30', '18:00', '19:30',
]

/**
 * Returns the list of times a trainer works on a given weekday.
 * Falls back to DEFAULT_TIMES if no trainer_schedules table or rows exist.
 */
async function getScheduleForDay(trainerId: string, weekday: number): Promise<string[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT time FROM trainer_schedules WHERE trainer_id = ? AND weekday = ? ORDER BY time',
      args: [trainerId, weekday],
    })
    if (result.rows.length > 0) {
      return result.rows.map(r => r.time as string)
    }
  } catch {
    // table may not exist yet → fall back
  }
  return DEFAULT_TIMES
}

/**
 * Checks if a trainer is on vacation on a given date.
 */
async function isOnVacation(trainerId: string, date: string): Promise<boolean> {
  try {
    const result = await db.execute({
      sql: `SELECT id FROM trainer_vacations
            WHERE trainer_id = ? AND ? >= start_date AND ? <= end_date
            LIMIT 1`,
      args: [trainerId, date, date],
    })
    return result.rows.length > 0
  } catch {
    return false // table may not exist yet
  }
}

// Syncs time_slots for a trainer+date with the current schedule.
// Adds missing slots, removes unbooked slots whose time is no longer in the schedule.
async function syncSlotsForDate(trainerId: string, date: string) {
  // Verify the trainer exists
  const trainerCheck = await db.execute({
    sql: 'SELECT id FROM trainers WHERE id = ?',
    args: [trainerId],
  })
  if (trainerCheck.rows.length === 0) return

  // Get the weekday for the date (0=Mon … 6=Sun)
  const d = new Date(date + 'T00:00:00')
  const jsDay = d.getDay() // 0=Sun
  const weekday = jsDay === 0 ? 6 : jsDay - 1 // convert to Mon=0

  const scheduledTimes = await getScheduleForDay(trainerId, weekday)

  // Get existing slots for this trainer+date
  const existing = await db.execute({
    sql: 'SELECT id, time, is_booked FROM time_slots WHERE trainer_id = ? AND date = ?',
    args: [trainerId, date],
  })

  const existingTimes = new Set(existing.rows.map(r => r.time as string))

  // 1) Add missing slot rows
  for (const time of scheduledTimes) {
    if (!existingTimes.has(time)) {
      const id = `${trainerId}-${date}-${time}`
      await db.execute({
        sql: 'INSERT OR IGNORE INTO time_slots (id, time, date, trainer_id, is_booked) VALUES (?, ?, ?, ?, 0)',
        args: [id, time, date, trainerId],
      })
    }
  }

  // 2) Remove unbooked slots whose time is no longer in the schedule
  const scheduledSet = new Set(scheduledTimes)
  for (const row of existing.rows) {
    if (!scheduledSet.has(row.time as string) && (row.is_booked as number) === 0) {
      await db.execute({
        sql: 'DELETE FROM time_slots WHERE id = ?',
        args: [row.id],
      })
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // If the trainer is on vacation, return empty slots
    if (await isOnVacation(trainerId, date)) {
      return NextResponse.json({ slots: [], onVacation: true })
    }

    // Auto-generate / sync slots for this date
    await syncSlotsForDate(trainerId, date)

    const result = await db.execute({
      sql: `SELECT * FROM time_slots
            WHERE trainer_id = ?
            AND date = ?
            AND is_booked = 0
            ORDER BY time`,
      args: [trainerId, date]
    })

    // Filter out past time slots for today
    const now = new Date()
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const slots = date === todayISO
      ? result.rows.filter(slot => {
          const [h, m] = (slot.time as string).split(':').map(Number)
          return h * 60 + m > currentMinutes
        })
      : result.rows

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
