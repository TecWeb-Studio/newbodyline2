import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureTables } from '@/lib/ensure-tables'

// GET /api/admin/reviews — fetch all reviews for admin management
export async function GET() {
  try {
    await ensureTables()

    const result = await db.execute(
      `SELECT r.*, t.name as trainer_name 
       FROM trainer_reviews r 
       LEFT JOIN trainers t ON r.trainer_id = t.id 
       ORDER BY r.created_at DESC`
    )

    return NextResponse.json({ reviews: result.rows })
  } catch (error) {
    console.error('Error fetching admin reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// DELETE /api/admin/reviews?id=xxx — delete a review and recalculate rating
export async function DELETE(request: Request) {
  try {
    await ensureTables()

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 })
    }

    // Get the review first to know which trainer to recalculate
    const review = await db.execute({
      sql: 'SELECT trainer_id FROM trainer_reviews WHERE id = ?',
      args: [reviewId],
    })

    if (review.rows.length === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const trainerId = review.rows[0].trainer_id as string

    // Delete the review
    await db.execute({
      sql: 'DELETE FROM trainer_reviews WHERE id = ?',
      args: [reviewId],
    })

    // Recalculate trainer's average rating
    const avgResult = await db.execute({
      sql: 'SELECT AVG(rating) as avg_rating FROM trainer_reviews WHERE trainer_id = ?',
      args: [trainerId],
    })

    const newAvg = Number(avgResult.rows[0]?.avg_rating ?? 0)
    const roundedAvg = newAvg > 0 ? Math.round(newAvg * 10) / 10 : 4.8 // Default when no reviews

    await db.execute({
      sql: 'UPDATE trainers SET rating = ? WHERE id = ?',
      args: [roundedAvg, trainerId],
    })

    return NextResponse.json({ success: true, newRating: roundedAvg })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
