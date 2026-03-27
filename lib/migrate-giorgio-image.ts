import 'dotenv/config'
import { db } from './db'

async function migrate() {
  const [giorgioResult, filippoResult, teresaResult] = await db.batch([
    {
      sql: 'UPDATE trainers SET image = ? WHERE id = ? OR name = ?',
      args: ['/images/trainers/giorgio.jpeg', 'trainer-1', 'Giorgio'],
    },
    {
      sql: 'UPDATE trainers SET image = ? WHERE id = ? OR name = ?',
      args: ['/images/trainers/filippo.png', 'trainer-5', 'Filippo'],
    },
    {
      sql: 'UPDATE trainers SET image = ? WHERE id = ? OR name = ?',
      args: ['/images/trainers/teresa.jpeg', 'trainer-2', 'Teresa'],
    },
  ], 'write')

  console.log(
    `✅ Updated trainer image paths (Giorgio: ${giorgioResult.rowsAffected ?? 0}, Filippo: ${filippoResult.rowsAffected ?? 0}, Teresa: ${teresaResult.rowsAffected ?? 0})`
  )
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })