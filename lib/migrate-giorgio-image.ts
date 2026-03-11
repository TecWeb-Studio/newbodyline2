import 'dotenv/config'
import { db } from './db'

async function migrate() {
  const result = await db.execute({
    sql: 'UPDATE trainers SET image = ? WHERE id = ? OR name = ?',
    args: ['/images/trainers/giorgio.png', 'trainer-1', 'Giorgio'],
  })

  console.log(`✅ Updated Giorgio image path (${result.rowsAffected ?? 0} row(s))`)
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })