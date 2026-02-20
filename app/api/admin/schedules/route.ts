import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureTables } from '@/lib/ensure-tables'

// ── GET /api/admin/schedules ─────────────────────────────────────────────────────
// Returns all trainer schedules grouped by trainer
export async function GET() {
  try {
    await ensureTables()
    const result = await db.execute(
      'SELECT * FROM trainer_schedules ORDER BY trainer_id, weekday, time'
    )
    return NextResponse.json({ schedules: result.rows })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

/**
 * Clears future (and today's) unbooked time_slots for a specific trainer+weekday
 * so they get regenerated with the updated schedule on next access.
 * weekday: 0=Mon … 6=Sun (our convention)
 * SQLite strftime('%w'): 0=Sun … 6=Sat → conversion: strftime = (weekday + 1) % 7
 */
async function clearFutureUnbookedSlots(trainerId: string, weekday: number) {
  try {
    const strftimeWeekday = (weekday + 1) % 7
    await db.execute({
      sql: `DELETE FROM time_slots
            WHERE trainer_id = ?
              AND date >= date('now')
              AND is_booked = 0
              AND CAST(strftime('%w', date) AS INTEGER) = ?`,
      args: [trainerId, strftimeWeekday],
    })
  } catch {
    // time_slots table may not exist yet
  }
}

// ── POST /api/admin/schedules ────────────────────────────────────────────────
// Body: { trainerId, weekday, time }   → add a time slot
export async function POST(request: Request) {
  try {
    await ensureTables()
    const { trainerId, weekday, time } = await request.json()
    if (!trainerId || weekday === undefined || !time) {
      return NextResponse.json({ error: 'trainerId, weekday and time are required' }, { status: 400 })
    }
    await db.execute({
      sql: 'INSERT OR IGNORE INTO trainer_schedules (trainer_id, weekday, time) VALUES (?, ?, ?)',
      args: [trainerId, weekday, time],
    })
    // Clear cached future slots so they regenerate with the new schedule
    await clearFutureUnbookedSlots(trainerId, weekday)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error adding schedule:', error)
    return NextResponse.json({ error: 'Failed to add schedule' }, { status: 500 })
  }
}

// ── DELETE /api/admin/schedules?id=... ───────────────────────────────────────
// Or body: { trainerId, weekday, time }   → remove a time slot
export async function DELETE(request: Request) {
  try {
    await ensureTables()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Fetch the row first so we can clear cached slots
      const row = await db.execute({ sql: 'SELECT trainer_id, weekday FROM trainer_schedules WHERE id = ?', args: [Number(id)] })
      await db.execute({ sql: 'DELETE FROM trainer_schedules WHERE id = ?', args: [Number(id)] })
      if (row.rows.length > 0) {
        await clearFutureUnbookedSlots(row.rows[0].trainer_id as string, row.rows[0].weekday as number)
      }
    } else {
      const { trainerId, weekday, time } = await request.json()
      await db.execute({
        sql: 'DELETE FROM trainer_schedules WHERE trainer_id = ? AND weekday = ? AND time = ?',
        args: [trainerId, weekday, time],
      })
      await clearFutureUnbookedSlots(trainerId, weekday)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}
