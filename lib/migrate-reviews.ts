/**
 * Migration: Create trainer_reviews table for the review/rating system.
 * Run with: npx tsx lib/migrate-reviews.ts
 */
import { db } from './db'

async function migrate() {
  console.log('Creating trainer_reviews table...')

  await db.execute(`
    CREATE TABLE IF NOT EXISTS trainer_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      reviewer_email TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (trainer_id) REFERENCES trainers(id)
    )
  `)

  console.log('trainer_reviews table created successfully!')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
