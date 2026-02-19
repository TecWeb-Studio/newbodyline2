import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  notifyCustomerBookingUpdated,
  notifyTrainerBookingUpdated,
} from '@/lib/whatsapp'

// ─── GET – Fetch a single booking (by id + email for auth) ───────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const result = await db.execute({
      sql: `SELECT b.*, t.phone as trainer_phone
            FROM bookings b
            LEFT JOIN trainers t ON b.trainer_id = t.id
            WHERE b.id = ? AND LOWER(b.client_email) = LOWER(?)`,
      args: [id, email],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const row = result.rows[0] as Record<string, unknown>

    return NextResponse.json({
      booking: {
        id: row.id,
        trainerId: row.trainer_id,
        trainerName: row.trainer_name,
        slotId: row.slot_id,
        date: row.date,
        time: row.time,
        clientName: row.client_name,
        clientEmail: row.client_email,
        clientPhone: row.client_phone,
        bookedAt: row.booked_at,
      },
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

// ─── PATCH – Edit a booking (change slot / trainer) ──────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params

  try {
    const body = await request.json()
    const { clientEmail, newSlotId, newTrainerId } = body as {
      clientEmail: string
      newSlotId: string
      newTrainerId?: string
    }

    if (!clientEmail || !newSlotId) {
      return NextResponse.json(
        { error: 'clientEmail and newSlotId are required' },
        { status: 400 }
      )
    }

    // 1. Fetch current booking (authenticate by email)
    const bookingResult = await db.execute({
      sql: `SELECT b.*, t.phone as trainer_phone
            FROM bookings b
            LEFT JOIN trainers t ON b.trainer_id = t.id
            WHERE b.id = ? AND LOWER(b.client_email) = LOWER(?)`,
      args: [bookingId, clientEmail],
    })

    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const current = bookingResult.rows[0] as Record<string, unknown>

    // 2. Enforce 12-hour change window
    const appointmentDatetime = new Date(`${current.date}T${current.time}:00`)
    const now = new Date()
    const hoursUntil = (appointmentDatetime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntil < 12) {
      return NextResponse.json(
        {
          error: 'Changes are only allowed up to 12 hours before the appointment.',
          code: 'TOO_LATE_TO_CHANGE',
        },
        { status: 422 }
      )
    }

    // 3. Validate the new slot
    const newSlotResult = await db.execute({
      sql: 'SELECT * FROM time_slots WHERE id = ? AND is_booked = 0',
      args: [newSlotId],
    })

    if (newSlotResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'The selected slot is not available' },
        { status: 409 }
      )
    }

    const newSlot = newSlotResult.rows[0] as Record<string, unknown>

    // 4. Resolve new trainer (default to same trainer if not changing)
    const resolvedTrainerId = newTrainerId ?? (current.trainer_id as string)

    // If switching trainer, validate slot belongs to that trainer
    if (newSlot.trainer_id !== resolvedTrainerId) {
      return NextResponse.json(
        { error: 'Slot does not belong to the selected trainer' },
        { status: 400 }
      )
    }

    // 5. Fetch new trainer details
    const newTrainerResult = await db.execute({
      sql: 'SELECT name, phone FROM trainers WHERE id = ?',
      args: [resolvedTrainerId],
    })
    const newTrainer = (newTrainerResult.rows[0] as unknown) as { name: string; phone?: string } | undefined

    // 6. Apply changes atomically
    // 6a. Free old slot
    await db.execute({
      sql: 'UPDATE time_slots SET is_booked = 0 WHERE id = ?',
      args: [current.slot_id as string],
    })

    // 6b. Reserve new slot
    await db.execute({
      sql: 'UPDATE time_slots SET is_booked = 1 WHERE id = ?',
      args: [newSlotId],
    })

    // 6c. Update booking record
    await db.execute({
      sql: `UPDATE bookings
            SET slot_id = ?, date = ?, time = ?, trainer_id = ?, trainer_name = ?
            WHERE id = ?`,
      args: [
        newSlotId,
        newSlot.date as string,
        newSlot.time as string,
        resolvedTrainerId,
        (newTrainer?.name ?? current.trainer_name) as string,
        bookingId,
      ],
    })

    const updatedDetails = {
      bookingId,
      clientName: current.client_name as string,
      clientPhone: current.client_phone as string,
      trainerName: (newTrainer?.name ?? current.trainer_name) as string,
      trainerPhone: newTrainer?.phone,
      date: newSlot.date as string,
      time: newSlot.time as string,
      manageUrl: buildManageUrl(bookingId, current.client_email as string),
    }

    // 7. Send WhatsApp notifications (non-blocking)
    await Promise.allSettled([
      notifyCustomerBookingUpdated(updatedDetails),
      newTrainer?.phone
        ? notifyTrainerBookingUpdated(updatedDetails)
        : Promise.resolve({ success: false }),
      // Also notify previous trainer if trainer changed
      ...(newTrainerId && newTrainerId !== current.trainer_id && current.trainer_phone
        ? [
            notifyTrainerBookingUpdated({
              ...updatedDetails,
              trainerPhone: current.trainer_phone as string,
            }),
          ]
        : []),
    ])

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        trainerId: resolvedTrainerId,
        trainerName: newTrainer?.name ?? current.trainer_name,
        slotId: newSlotId,
        date: newSlot.date,
        time: newSlot.time,
        clientName: current.client_name,
        clientEmail: current.client_email,
        clientPhone: current.client_phone,
        bookedAt: current.booked_at,
      },
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

function buildManageUrl(bookingId: string, clientEmail: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return `${base}/personal-training/manage?id=${bookingId}&email=${encodeURIComponent(clientEmail)}`
}
