import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { migrateAddBookingStatus } from '@/lib/migrate-add-booking-status'
import { validateEmail, validatePhone, validateName } from '@/lib/types'

// ─── POST – Admin creates a booking on behalf of a client (status = confirmed) ──
export async function POST(request: Request) {
  try {
    await migrateAddBookingStatus()

    const body = await request.json()
    const { trainerId, trainerName, date, time, clientName, clientEmail, clientPhone } = body

    // Input validation
    if (!trainerId || !trainerName || !date || !time || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!validateName(clientName)) {
      return NextResponse.json({ error: 'Invalid name (2-100 characters required)' }, { status: 400 })
    }
    if (!validateEmail(clientEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!validatePhone(clientPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Validate date is not in the past
    const today = new Date().toISOString().split('T')[0]
    if (date < today) {
      return NextResponse.json({ error: 'Cannot book a date in the past' }, { status: 400 })
    }

    // Build the slot ID from convention
    const slotId = `${trainerId}-${date}-${time}`

    // Check if a slot exists and is not booked
    const slotCheck = await db.execute({
      sql: 'SELECT id, is_booked FROM time_slots WHERE id = ?',
      args: [slotId],
    })

    if (slotCheck.rows.length === 0) {
      // Slot doesn't exist yet – create it
      await db.execute({
        sql: 'INSERT INTO time_slots (id, time, date, trainer_id, is_booked) VALUES (?, ?, ?, ?, 0)',
        args: [slotId, time, date, trainerId],
      })
    } else if (slotCheck.rows[0].is_booked === 1) {
      return NextResponse.json({ error: 'This slot is already booked' }, { status: 409 })
    }

    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const bookedAt = new Date().toISOString()

    // Atomically mark slot as booked and create booking as 'confirmed'
    const batchResult = await db.batch(
      [
        {
          sql: 'UPDATE time_slots SET is_booked = 1 WHERE id = ? AND is_booked = 0',
          args: [slotId],
        },
        {
          sql: `INSERT INTO bookings 
              (id, trainer_id, trainer_name, slot_id, date, time, client_name, client_email, client_phone, booked_at, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
          args: [bookingId, trainerId, trainerName, slotId, date, time, clientName, clientEmail, clientPhone, bookedAt],
        },
      ],
      'write'
    )

    if (batchResult[0].rowsAffected === 0) {
      return NextResponse.json({ error: 'Slot was just booked by someone else' }, { status: 409 })
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: bookingId,
          trainer_id: trainerId,
          trainer_name: trainerName,
          slot_id: slotId,
          date,
          time,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          booked_at: bookedAt,
          status: 'confirmed',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
