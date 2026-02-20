import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { validateEmail, validatePhone, validateName } from '@/lib/types'
import {
  notifyCustomerBookingConfirmed,
  notifyTrainerNewBooking,
  notifyCustomerBookingCancelled,
  notifyTrainerBookingCancelled,
} from '@/lib/whatsapp'

function buildManageUrl(bookingId: string, clientEmail: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return `${base}/personal-training/manage?id=${bookingId}&email=${encodeURIComponent(clientEmail)}`
}

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

// POST - Create a new booking
export async function POST(request: Request) {
  try {
    // Rate limit: max 5 bookings per minute per IP
    const rlKey = getRateLimitKey(request, 'booking')
    const rl = checkRateLimit(rlKey, 5, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

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

    // Input validation
    if (!trainerId || !trainerName || !slotId || !date || !time || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate field formats
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
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const bookedAt = new Date().toISOString()

    // Use batch for atomicity
    const batchResult = await db.batch([
      {
        sql: 'UPDATE time_slots SET is_booked = 1 WHERE id = ? AND is_booked = 0',
        args: [slotId]
      },
      {
        sql: `INSERT INTO bookings 
            (id, trainer_id, trainer_name, slot_id, date, time, client_name, client_email, client_phone, booked_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [bookingId, trainerId, trainerName, slotId, date, time, clientName, clientEmail, clientPhone, bookedAt]
      }
    ], 'write')

    // Verify the UPDATE actually modified a row (race condition protection)
    if (batchResult[0].rowsAffected === 0) {
      return NextResponse.json(
        { error: 'This slot has already been booked by someone else' },
        { status: 409 }
      )
    }

    // ── WhatsApp notifications (isolated – must never break the booking response) ──
    try {
      let trainerPhone: string | undefined
      try {
        const trainerResult = await db.execute({
          sql: 'SELECT phone FROM trainers WHERE id = ?',
          args: [trainerId]
        })
        trainerPhone = trainerResult.rows[0]?.phone as string | undefined
      } catch {
        // phone column may not exist yet – skip
      }

      const manageUrl = buildManageUrl(bookingId, clientEmail)

      await Promise.allSettled([
        notifyCustomerBookingConfirmed({
          bookingId,
          clientName,
          clientPhone,
          trainerName,
          date,
          time,
          manageUrl,
        }),
        notifyTrainerNewBooking({
          bookingId,
          clientName,
          clientPhone,
          trainerName,
          trainerPhone,
          date,
          time,
          manageUrl,
        }),
      ])
    } catch (waErr) {
      console.error('[WhatsApp] notification error (booking was still created):', waErr)
    }

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
      sql: 'SELECT slot_id, client_name, client_phone, trainer_id, date, time FROM bookings WHERE id = ?',
      args: [bookingId]
    })

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const slotId = bookingResult.rows[0].slot_id as string
    const { client_name, client_phone, trainer_id, date, time } = bookingResult.rows[0] as unknown as {
      slot_id: string; client_name: string; client_phone: string; trainer_id: string; date: string; time: string
    }

    // Fetch trainer phone (may not exist)
    let trainerPhone: string | undefined
    try {
      const trainerRes = await db.execute({
        sql: 'SELECT phone FROM trainers WHERE id = ?',
        args: [trainer_id]
      })
      trainerPhone = trainerRes.rows[0]?.phone as string | undefined
    } catch { /* phone column may not exist */ }

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

    // 3. Send WhatsApp notifications (isolated – must never break the response)
    try {
      await Promise.allSettled([
        notifyCustomerBookingCancelled(client_name, client_phone, bookingId, date, time),
        trainerPhone
          ? notifyTrainerBookingCancelled(trainerPhone, client_name, bookingId, date, time)
          : Promise.resolve({ success: false }),
      ])
    } catch (waErr) {
      console.error('[WhatsApp] cancel notification error:', waErr)
    }

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
