import 'dotenv/config'
import { db } from './db'

const trainersData = [
  {
    id: 'trainer-1',
    name: 'Giorgio',
    specialty: 'Strength & Conditioning',
    image: '/trainers/giorgio.jpg',
    description: 'Former professional athlete with 10+ years of experience in strength training and athletic performance.',
    rating: 4.9
  },
  {
    id: 'trainer-2',
    name: 'Teresa',
    specialty: 'HIIT & Cardio',
    image: '/trainers/teresa.jpg',
    description: 'Certified HIIT specialist known for high-energy sessions that maximize calorie burn and endurance.',
    rating: 4.8
  },
  {
    id: 'trainer-3',
    name: 'Diego',
    specialty: 'Yoga & Flexibility',
    image: '/trainers/diego.jpg',
    description: 'Yoga master with expertise in power yoga, vinyasa flow, and mobility training for all levels.',
    rating: 5.0
  },
  {
    id: 'trainer-4',
    name: 'Cleo',
    specialty: 'Boxing & Combat',
    image: '/trainers/cleo.jpg',
    description: 'Professional boxing coach focusing on technique, conditioning, and confidence building.',
    rating: 4.9
  },
  {
    id: 'trainer-5',
    name: 'Filippo',
    specialty: 'Pilates & Core',
    image: '/trainers/filippo.jpg',
    description: 'Expert in pilates and core strengthening with a focus on posture correction and injury prevention.',
    rating: 4.9
  }
]

const generateTimeSlots = () => {
  const slots: Array<{ id: string; time: string; date: string; trainer_id: string; is_booked: number }> = []
  const dates = [
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 172800000).toISOString().split('T')[0],
    new Date(Date.now() + 259200000).toISOString().split('T')[0],
    new Date(Date.now() + 345600000).toISOString().split('T')[0],
  ]
  
  const times = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00']
  
  trainersData.forEach(trainer => {
    dates.forEach(date => {
      times.forEach(time => {
        slots.push({
          id: `${trainer.id}-${date}-${time}`,
          time,
          date,
          trainer_id: trainer.id,
          is_booked: 0
        })
      })
    })
  })
  
  return slots
}

async function initDatabase() {
  try {
    console.log('🚀 Inizializzazione database Turso...')

    // Drop tabelle esistenti se ci sono (per ricominciare da zero)
    await db.execute('DROP TABLE IF EXISTS bookings')
    await db.execute('DROP TABLE IF EXISTS time_slots')
    await db.execute('DROP TABLE IF EXISTS trainers')
    console.log('🗑️  Tabelle esistenti rimosse')

    // Crea tabella trainers
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trainers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        rating REAL NOT NULL
      )
    `)
    console.log('✅ Tabella trainers creata')

    // Crea tabella time_slots
    await db.execute(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id TEXT PRIMARY KEY,
        time TEXT NOT NULL,
        date TEXT NOT NULL,
        trainer_id TEXT NOT NULL,
        is_booked INTEGER DEFAULT 0,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id)
      )
    `)
    console.log('✅ Tabella time_slots creata')

    // Crea indice per migliorare le query
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_slots_trainer_date ON time_slots(trainer_id, date, is_booked)
    `)
    console.log('✅ Indice creato su time_slots')

    // Crea tabella bookings
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        trainer_id TEXT NOT NULL,
        trainer_name TEXT NOT NULL,
        slot_id TEXT NOT NULL UNIQUE,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        booked_at TEXT NOT NULL,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id),
        FOREIGN KEY (slot_id) REFERENCES time_slots(id)
      )
    `)
    console.log('✅ Tabella bookings creata')

    // Verifica se ci sono già dati
    const existingTrainers = await db.execute('SELECT COUNT(*) as count FROM trainers')
    const trainerCount = existingTrainers.rows[0]?.count as number

    if (trainerCount === 0) {
      // Inserisci trainers
      for (const trainer of trainersData) {
        await db.execute({
          sql: 'INSERT INTO trainers (id, name, specialty, image, description, rating) VALUES (?, ?, ?, ?, ?, ?)',
          args: [trainer.id, trainer.name, trainer.specialty, trainer.image, trainer.description, trainer.rating]
        })
      }
      console.log('✅ Trainers inseriti')

      // Inserisci time slots
      const slots = generateTimeSlots()
      for (const slot of slots) {
        await db.execute({
          sql: 'INSERT INTO time_slots (id, time, date, trainer_id, is_booked) VALUES (?, ?, ?, ?, ?)',
          args: [slot.id, slot.time, slot.date, slot.trainer_id, slot.is_booked]
        })
      }
      console.log(`✅ ${slots.length} time slots inseriti`)
    } else {
      console.log('ℹ️  Database già popolato, skip inserimento dati')
    }

    console.log('🎉 Database inizializzato con successo!')
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error)
    throw error
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { initDatabase }
