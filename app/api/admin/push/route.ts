import { NextResponse } from 'next/server'
import { saveSubscription, removeSubscription } from '@/lib/push'

// POST – save a push subscription
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subscription } = body

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    await saveSubscription(subscription)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Push API] save error:', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

// DELETE – remove a push subscription
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    await removeSubscription(endpoint)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Push API] delete error:', err)
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
