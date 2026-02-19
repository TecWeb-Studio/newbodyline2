import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── GET /api/admin/schedules ─────────────────────────────────────────────────
// Returns all trainer schedules grouped by trainer
export async function GET() {
  try {
    const result = await db.execute(
      'SELECT * FROM trainer_schedules ORDER BY trainer_id, weekday, time'
    )
    return NextResponse.json({ schedules: result.rows })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

// ── POST /api/admin/schedules ────────────────────────────────────────────────
// Body: { trainerId, weekday, time }   → add a time slot
export async function POST(request: Request) {
  try {
    const { trainerId, weekday, time } = await request.json()
    if (!trainerId || weekday === undefined || !time) {
      return NextResponse.json({ error: 'trainerId, weekday and time are required' }, { status: 400 })
    }
    await db.execute({
      sql: 'INSERT OR IGNORE INTO trainer_schedules (trainer_id, weekday, time) VALUES (?, ?, ?)',
      args: [trainerId, weekday, time],
    })
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      await db.execute({ sql: 'DELETE FROM trainer_schedules WHERE id = ?', args: [Number(id)] })
    } else {
      const { trainerId, weekday, time } = await request.json()
      await db.execute({
        sql: 'DELETE FROM trainer_schedules WHERE trainer_id = ? AND weekday = ? AND time = ?',
        args: [trainerId, weekday, time],
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}
