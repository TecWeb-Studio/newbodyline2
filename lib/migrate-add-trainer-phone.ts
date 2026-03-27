/**
 * Migration: add `phone` column to trainers table
 * Run once: npx tsx lib/migrate-add-trainer-phone.ts
 *
 * After running, update the phone numbers below with real values.
 */
import 'dotenv/config'
import { db } from './db'

const trainerPhones: Record<string, string> = {
  'trainer-1': '+393293508756',  // Giorgio
  'trainer-2': '+393283394711',  // Teresa
  'trainer-3': '+393479633983',  // Diego
  'trainer-4': '+393463510095',  // Cleo
  'trainer-5': '+393404858684',  // Filippo
}

async function migrate() {
  try {
    // Add column (SQLite/Turso: ALTER TABLE only supports ADD COLUMN)
    await db.execute(`ALTER TABLE trainers ADD COLUMN phone TEXT`)
    console.log('✅ Column `phone` added to trainers')
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('duplicate column')) {
      console.log('ℹ️  Column already exists, skipping ALTER')
    } else {
      throw e
    }
  }

  // Fill in phone numbers
  for (const [id, phone] of Object.entries(trainerPhones)) {
    await db.execute({
      sql: 'UPDATE trainers SET phone = ? WHERE id = ?',
      args: [phone, id],
    })
  }
  console.log('✅ Trainer phone numbers updated')

  // Also add edit_token support to bookings if not present
  try {
    await db.execute(`ALTER TABLE bookings ADD COLUMN edit_token TEXT`)
    console.log('✅ Column `edit_token` added to bookings')
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('duplicate column')) {
      console.log('ℹ️  edit_token column already exists, skipping')
    } else {
      throw e
    }
  }

  console.log('🎉 Migration complete')
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
