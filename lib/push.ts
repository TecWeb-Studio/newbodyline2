// @ts-expect-error – web-push has no bundled types
import webpush from 'web-push'
import { db } from './db'

// ── VAPID keys ───────────────────────────────────────────────────────────────
// Set these in .env.local:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_SUBJECT=mailto:admin@newbodyline2.it

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@newbodyline2.it'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

// ── Ensure subscriptions table exists ────────────────────────────────────────
let tableReady = false

export async function ensurePushTable() {
  if (tableReady) return
  await db.execute(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT UNIQUE NOT NULL,
      keys_p256dh TEXT NOT NULL,
      keys_auth TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
  tableReady = true
}

// ── Save a subscription ──────────────────────────────────────────────────────
export async function saveSubscription(sub: PushSubscription & { keys: { p256dh: string; auth: string } }) {
  await ensurePushTable()
  await db.execute({
    sql: `INSERT OR REPLACE INTO push_subscriptions (endpoint, keys_p256dh, keys_auth) VALUES (?, ?, ?)`,
    args: [sub.endpoint, sub.keys.p256dh, sub.keys.auth],
  })
}

// ── Remove a subscription ────────────────────────────────────────────────────
export async function removeSubscription(endpoint: string) {
  await ensurePushTable()
  await db.execute({ sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?', args: [endpoint] })
}

// ── Send push to all admin subscribers ───────────────────────────────────────
export async function sendPushToAdmins(payload: { title: string; body: string; url?: string }) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[Push] VAPID keys not configured – skipping push')
    return
  }

  await ensurePushTable()
  const result = await db.execute('SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions')

  const notifications = result.rows.map(async (row) => {
    const subscription = {
      endpoint: row.endpoint as string,
      keys: {
        p256dh: row.keys_p256dh as string,
        auth: row.keys_auth as string,
      },
    }

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload))
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode
      // If subscription expired / invalid, remove it
      if (status === 404 || status === 410) {
        await removeSubscription(subscription.endpoint)
      } else {
        console.error('[Push] send error:', err)
      }
    }
  })

  await Promise.allSettled(notifications)
}
