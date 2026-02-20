import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureTables } from '@/lib/ensure-tables'

// ── GET /api/admin/vacations ─────────────────────────────────────────────────
export async function GET() {
  try {
    await ensureTables()
    const result = await db.execute(
      'SELECT * FROM trainer_vacations ORDER BY start_date'
    )
    return NextResponse.json({ vacations: result.rows })
  } catch (error) {
    console.error('Error fetching vacations:', error)
    return NextResponse.json({ error: 'Failed to fetch vacations' }, { status: 500 })
  }
}

// ── POST /api/admin/vacations ────────────────────────────────────────────────
// Body: { trainerId, startDate, endDate, note? }
export async function POST(request: Request) {
  try {
    await ensureTables()
    const { trainerId, startDate, endDate, note } = await request.json()
    if (!trainerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'trainerId, startDate and endDate are required' },
        { status: 400 }
      )
    }
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'startDate must be before or equal to endDate' },
        { status: 400 }
      )
    }
    const result = await db.execute({
      sql: 'INSERT INTO trainer_vacations (trainer_id, start_date, end_date, note) VALUES (?, ?, ?, ?)',
      args: [trainerId, startDate, endDate, note ?? null],
    })
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) }, { status: 201 })
  } catch (error) {
    console.error('Error adding vacation:', error)
    return NextResponse.json({ error: 'Failed to add vacation' }, { status: 500 })
  }
}

// ── DELETE /api/admin/vacations?id=... ───────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    await ensureTables()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    await db.execute({ sql: 'DELETE FROM trainer_vacations WHERE id = ?', args: [Number(id)] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vacation:', error)
    return NextResponse.json({ error: 'Failed to delete vacation' }, { status: 500 })
  }
}
