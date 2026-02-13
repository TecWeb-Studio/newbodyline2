import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const result = await db.execute({
      sql: `SELECT * FROM time_slots 
            WHERE trainer_id = ? 
            AND date = ? 
            AND is_booked = 0 
            ORDER BY time`,
      args: [trainerId, date]
    })

    return NextResponse.json({ 
      slots: result.rows 
    })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}
