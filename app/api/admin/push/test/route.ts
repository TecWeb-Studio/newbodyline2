import { NextResponse } from 'next/server'
import { sendPushToAdmins } from '@/lib/push'

// Force Node.js runtime – web-push uses crypto/http unavailable in Edge
export const runtime = 'nodejs'

// POST – Send a test push notification to all subscribed admin devices
export async function POST() {
  try {
    await sendPushToAdmins({
      title: '🔔 Test Notifica',
      body: 'Se vedi questo messaggio, le notifiche push funzionano!',
      url: '/it/admin/dashboard',
    })

    return NextResponse.json({ success: true, message: 'Test notification sent' })
  } catch (err) {
    console.error('[Push Test] error:', err)
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 })
  }
}
