import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensurePushTable } from '@/lib/push'

// Force Node.js runtime – web-push uses crypto/http unavailable in Edge
export const runtime = 'nodejs'

// GET – Push notification system diagnostics
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    vapidPublicKeySet: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPublicKeyLength: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length ?? 0,
    vapidPrivateKeySet: !!process.env.VAPID_PRIVATE_KEY,
    vapidSubject: process.env.VAPID_SUBJECT ?? '(not set)',
    subscriptionCount: 0,
    tableExists: false,
    error: null,
  }

  try {
    await ensurePushTable()
    diagnostics.tableExists = true

    const result = await db.execute('SELECT COUNT(*) as c FROM push_subscriptions')
    diagnostics.subscriptionCount = result.rows[0]?.c ?? 0
  } catch (err) {
    diagnostics.error = (err as Error).message
  }

  return NextResponse.json(diagnostics)
}
