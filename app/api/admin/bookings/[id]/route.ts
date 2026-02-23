import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { migrateAddBookingStatus } from '@/lib/migrate-add-booking-status'
import {
  notifyCustomerBookingConfirmed,
  notifyCustomerBookingCancelled,
  notifyTrainerNewBooking,
} from '@/lib/whatsapp'

// ─── PATCH – Approve or reject a booking request ─────────────────────────────
// Body: { action: 'approve' | 'reject' }

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params

  try {
    await migrateAddBookingStatus()

    const body = await request.json()
    const { action } = body as { action: 'approve' | 'reject' }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject".' },
        { status: 400 }
      )
    }

    // Fetch the booking
    const bookingResult = await db.execute({
      sql: 'SELECT * FROM bookings WHERE id = ?',
      args: [bookingId],
    })

    if (bookingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingResult.rows[0] as Record<string, unknown>

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 409 }
      )
    }

    if (action === 'approve') {
      // Update status to confirmed
      await db.execute({
        sql: "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
        args: [bookingId],
      })

      // Send confirmation notifications
      try {
        let trainerPhone: string | undefined
        try {
          const trainerRes = await db.execute({
            sql: 'SELECT phone FROM trainers WHERE id = ?',
            args: [booking.trainer_id as string],
          })
          trainerPhone = trainerRes.rows[0]?.phone as string | undefined
        } catch { /* phone column may not exist */ }

        const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        const manageUrl = `${base}/personal-training/manage?id=${bookingId}&email=${encodeURIComponent(booking.client_email as string)}`

        await Promise.allSettled([
          notifyCustomerBookingConfirmed({
            bookingId,
            clientName: booking.client_name as string,
            clientPhone: booking.client_phone as string,
            trainerName: booking.trainer_name as string,
            date: booking.date as string,
            time: booking.time as string,
            manageUrl,
          }),
          notifyTrainerNewBooking({
            bookingId,
            clientName: booking.client_name as string,
            clientPhone: booking.client_phone as string,
            trainerName: booking.trainer_name as string,
            trainerPhone,
            date: booking.date as string,
            time: booking.time as string,
            manageUrl,
          }),
        ])
      } catch (waErr) {
        console.error('[WhatsApp] approval notification error:', waErr)
      }

      return NextResponse.json({
        success: true,
        status: 'confirmed',
        message: 'Booking approved successfully',
      })
    } else {
      // Reject: update status and free the slot
      await db.batch([
        {
          sql: "UPDATE bookings SET status = 'rejected' WHERE id = ?",
          args: [bookingId],
        },
        {
          sql: 'UPDATE time_slots SET is_booked = 0 WHERE id = ?',
          args: [booking.slot_id as string],
        },
      ], 'write')

      // Notify customer of rejection
      try {
        await notifyCustomerBookingCancelled(
          booking.client_name as string,
          booking.client_phone as string,
          bookingId,
          booking.date as string,
          booking.time as string,
        )
      } catch (waErr) {
        console.error('[WhatsApp] rejection notification error:', waErr)
      }

      return NextResponse.json({
        success: true,
        status: 'rejected',
        message: 'Booking rejected successfully',
      })
    }
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
