import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Ottieni tutte le prenotazioni
export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM bookings ORDER BY date, time')
    
    return NextResponse.json({ 
      bookings: result.rows 
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Crea una nuova prenotazione
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      trainerId,
      trainerName,
      slotId,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone
    } = body

    // Validazione input
    if (!trainerId || !trainerName || !slotId || !date || !time || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verifica che lo slot esiste e non è già prenotato (controllo concorrenza)
    const slotCheck = await db.execute({
      sql: 'SELECT is_booked FROM time_slots WHERE id = ?',
      args: [slotId]
    })

    if (slotCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
    }

    if (slotCheck.rows[0].is_booked === 1) {
      return NextResponse.json(
        { error: 'This slot has already been booked' },
        { status: 409 }
      )
    }

    // Genera ID per la prenotazione
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const bookedAt = new Date().toISOString()

    // Usa una transazione per garantire atomicità
    // 1. Marca lo slot come prenotato
    await db.execute({
      sql: 'UPDATE time_slots SET is_booked = 1 WHERE id = ? AND is_booked = 0',
      args: [slotId]
    })

    // Verifica che l'update abbia effettivamente modificato una riga
    // (protezione da race condition)
    const verifyUpdate = await db.execute({
      sql: 'SELECT is_booked FROM time_slots WHERE id = ?',
      args: [slotId]
    })

    if (verifyUpdate.rows[0].is_booked !== 1) {
      return NextResponse.json(
        { error: 'Failed to book slot - concurrent booking detected' },
        { status: 409 }
      )
    }

    // 2. Crea la prenotazione
    await db.execute({
      sql: `INSERT INTO bookings 
            (id, trainer_id, trainer_name, slot_id, date, time, client_name, client_email, client_phone, booked_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [bookingId, trainerId, trainerName, slotId, date, time, clientName, clientEmail, clientPhone, bookedAt]
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        trainerId,
        trainerName,
        slotId,
        date,
        time,
        clientName,
        clientEmail,
        clientPhone,
        bookedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// DELETE - Cancella una prenotazione
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Ottieni il slot_id della prenotazione prima di cancellarla
    const bookingResult = await db.execute({
      sql: 'SELECT slot_id FROM bookings WHERE id = ?',
      args: [bookingId]
    })

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const slotId = bookingResult.rows[0].slot_id

    // 1. Cancella la prenotazione
    await db.execute({
      sql: 'DELETE FROM bookings WHERE id = ?',
      args: [bookingId]
    })

    // 2. Libera lo slot
    await db.execute({
      sql: 'UPDATE time_slots SET is_booked = 0 WHERE id = ?',
      args: [slotId]
    })

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
