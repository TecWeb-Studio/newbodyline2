import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureTables } from '@/lib/ensure-tables'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { validateEmail, validateName } from '@/lib/types'

// GET /api/reviews?trainerId=xxx — fetch reviews for a trainer (or all)
export async function GET(request: Request) {
  try {
    await ensureTables()
    const { searchParams } = new URL(request.url)
    const trainerId = searchParams.get('trainerId')

    let result
    if (trainerId) {
      result = await db.execute({
        sql: 'SELECT * FROM trainer_reviews WHERE trainer_id = ? ORDER BY created_at DESC',
        args: [trainerId],
      })
    } else {
      result = await db.execute('SELECT * FROM trainer_reviews ORDER BY created_at DESC')
    }

    // Also compute average ratings per trainer
    const avgResult = await db.execute(
      'SELECT trainer_id, AVG(rating) as avg_rating, COUNT(*) as review_count FROM trainer_reviews GROUP BY trainer_id'
    )

    return NextResponse.json({
      reviews: result.rows,
      averages: avgResult.rows,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews — submit a new review
export async function POST(request: Request) {
  try {
    await ensureTables()

    // Rate limit: 3 reviews per minute per IP
    const ipKey = getRateLimitKey(request, 'review')
    const limit = checkRateLimit(ipKey, 3, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many reviews. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { trainerId, reviewerName, reviewerEmail, rating, title, comment } = body

    // Validation
    if (!trainerId || !reviewerName || !reviewerEmail || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!validateName(reviewerName)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (!validateEmail(reviewerEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const ratingNum = Number(rating)
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const commentTrimmed = comment.trim()
    if (commentTrimmed.length < 10 || commentTrimmed.length > 1000) {
      return NextResponse.json({ error: 'Comment must be 10-1000 characters' }, { status: 400 })
    }

    const titleTrimmed = title ? title.trim().slice(0, 100) : null

    // Verify trainer exists
    const trainerCheck = await db.execute({ sql: 'SELECT id FROM trainers WHERE id = ?', args: [trainerId] })
    if (trainerCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Prevent duplicate review from same email for same trainer (one review per trainer per email)
    const existingReview = await db.execute({
      sql: 'SELECT id FROM trainer_reviews WHERE trainer_id = ? AND reviewer_email = ?',
      args: [trainerId, reviewerEmail.trim()],
    })
    if (existingReview.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this trainer' },
        { status: 409 }
      )
    }

    // Insert review
    const result = await db.execute({
      sql: `INSERT INTO trainer_reviews (trainer_id, reviewer_name, reviewer_email, rating, title, comment)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [trainerId, reviewerName.trim(), reviewerEmail.trim(), ratingNum, titleTrimmed, commentTrimmed],
    })

    // Recalculate and update trainer's average rating
    const avgResult = await db.execute({
      sql: 'SELECT AVG(rating) as avg_rating FROM trainer_reviews WHERE trainer_id = ?',
      args: [trainerId],
    })
    const newAvg = Number(avgResult.rows[0]?.avg_rating ?? 0)
    const roundedAvg = Math.round(newAvg * 10) / 10

    await db.execute({
      sql: 'UPDATE trainers SET rating = ? WHERE id = ?',
      args: [roundedAvg, trainerId],
    })

    return NextResponse.json({
      review: {
        id: Number(result.lastInsertRowid),
        trainer_id: trainerId,
        reviewer_name: reviewerName.trim(),
        rating: ratingNum,
        title: titleTrimmed,
        comment: commentTrimmed,
        created_at: new Date().toISOString(),
      },
      newRating: roundedAvg,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
