/**
 * Migration: Add `status` column to bookings table.
 * Existing rows get 'confirmed'; new bookings start as 'pending'.
 * Safe to run multiple times (checks if column exists first).
 */
import { db } from './db'

let migrated = false

export async function migrateAddBookingStatus() {
  if (migrated) return

  try {
    const info = await db.execute("PRAGMA table_info(bookings)")
    const hasStatus = info.rows.some((r) => r.name === 'status')

    if (!hasStatus) {
      await db.execute(
        "ALTER TABLE bookings ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'"
      )
      console.log('[migrate] Added status column to bookings table')
    }
  } catch (err) {
    console.error('[migrate] Error adding status column:', err)
  }

  migrated = true
}
