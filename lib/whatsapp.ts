/**
 * WhatsApp notification utility via Twilio
 *
 * SETUP CHECKLIST (see bottom of file for details):
 *  1. Run: npm install twilio
 *  2. Add to .env.local:
 *       TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
 *       TWILIO_AUTH_TOKEN=xxxxxxxxxx
 *       TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   ← sandbox number, or your approved business number
 *  3. Add trainer WhatsApp numbers to the trainers table (see init-db.ts)
 *  4. For production: apply for a WhatsApp Business sender on Twilio console
 */

interface BookingDetails {
  bookingId: string
  clientName: string
  clientPhone: string
  trainerName: string
  trainerPhone?: string
  date: string
  time: string
  manageUrl: string // link the customer can use to edit the booking
}

interface WhatsAppResult {
  success: boolean
  sid?: string
  error?: string
}

// Dynamically import twilio so the app still boots without the package installed
async function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    return null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require('twilio')
    return twilio(accountSid, authToken)
  } catch {
    console.warn('[WhatsApp] twilio package not installed – run: npm install twilio')
    return null
  }
}

function formatPhoneForWhatsApp(phone: string): string {
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? `whatsapp:${cleaned}` : `whatsapp:+${cleaned}`
}

async function sendMessage(to: string, body: string): Promise<WhatsAppResult> {
  const client = await getTwilioClient()
  if (!client) {
    console.warn('[WhatsApp] Twilio not configured – message NOT sent to', to)
    return { success: false, error: 'Twilio not configured' }
  }

  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!from) {
    return { success: false, error: 'TWILIO_WHATSAPP_FROM not set' }
  }

  try {
    const message = await client.messages.create({
      from,
      to: formatPhoneForWhatsApp(to),
      body,
    })
    console.log('[WhatsApp] Sent to', to, '– SID:', message.sid)
    return { success: true, sid: message.sid }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[WhatsApp] Failed to send to', to, '–', msg)
    return { success: false, error: msg }
  }
}

// ─── Customer notification ────────────────────────────────────────────────────

export async function notifyCustomerBookingConfirmed(booking: BookingDetails): Promise<WhatsAppResult> {
  const body =
    `✅ *Booking Confirmed – New Body Line*\n\n` +
    `Hi ${booking.clientName}! Your session has been booked.\n\n` +
    `📅 *Date:* ${booking.date}\n` +
    `🕐 *Time:* ${booking.time}\n` +
    `💪 *Trainer:* ${booking.trainerName}\n` +
    `🆔 *Booking ID:* ${booking.bookingId}\n\n` +
    `Need to change something? You can modify your booking up to 12 hours before the session:\n` +
    `🔗 ${booking.manageUrl}\n\n` +
    `See you soon! 🏋️`

  return sendMessage(booking.clientPhone, body)
}

export async function notifyCustomerBookingUpdated(booking: BookingDetails): Promise<WhatsAppResult> {
  const body =
    `✏️ *Booking Updated – New Body Line*\n\n` +
    `Hi ${booking.clientName}! Your booking has been changed.\n\n` +
    `📅 *New Date:* ${booking.date}\n` +
    `🕐 *New Time:* ${booking.time}\n` +
    `💪 *Trainer:* ${booking.trainerName}\n` +
    `🆔 *Booking ID:* ${booking.bookingId}\n\n` +
    `Manage your booking:\n` +
    `🔗 ${booking.manageUrl}`

  return sendMessage(booking.clientPhone, body)
}

export async function notifyCustomerBookingCancelled(
  clientName: string,
  clientPhone: string,
  bookingId: string,
  date: string,
  time: string
): Promise<WhatsAppResult> {
  const body =
    `❌ *Booking Cancelled – New Body Line*\n\n` +
    `Hi ${clientName}! Your session on ${date} at ${time} (ID: ${bookingId}) has been cancelled.\n\n` +
    `Book a new session at: https://newbodyline.com/personal-training`

  return sendMessage(clientPhone, body)
}

// ─── Employee / Trainer notification ─────────────────────────────────────────

export async function notifyTrainerNewBooking(booking: BookingDetails): Promise<WhatsAppResult> {
  if (!booking.trainerPhone) return { success: false, error: 'No trainer phone' }

  const body =
    `📌 *New Booking – New Body Line*\n\n` +
    `You have a new session:\n\n` +
    `📅 *Date:* ${booking.date}\n` +
    `🕐 *Time:* ${booking.time}\n` +
    `👤 *Client:* ${booking.clientName}\n` +
    `📞 *Client phone:* ${booking.clientPhone}\n` +
    `🆔 *Booking ID:* ${booking.bookingId}`

  return sendMessage(booking.trainerPhone, body)
}

export async function notifyTrainerBookingUpdated(booking: BookingDetails): Promise<WhatsAppResult> {
  if (!booking.trainerPhone) return { success: false, error: 'No trainer phone' }

  const body =
    `🔄 *Booking Changed – New Body Line*\n\n` +
    `A client updated their booking:\n\n` +
    `📅 *New Date:* ${booking.date}\n` +
    `🕐 *New Time:* ${booking.time}\n` +
    `👤 *Client:* ${booking.clientName}\n` +
    `📞 *Client phone:* ${booking.clientPhone}\n` +
    `🆔 *Booking ID:* ${booking.bookingId}`

  return sendMessage(booking.trainerPhone, body)
}

export async function notifyTrainerBookingCancelled(
  trainerPhone: string,
  clientName: string,
  bookingId: string,
  date: string,
  time: string
): Promise<WhatsAppResult> {
  const body =
    `❌ *Booking Cancelled – New Body Line*\n\n` +
    `The session with ${clientName} on ${date} at ${time} (ID: ${bookingId}) has been cancelled.`

  return sendMessage(trainerPhone, body)
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT YOU NEED TO ACTIVATE WHATSAPP MESSAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. INSTALL TWILIO SDK
   npm install twilio
   npm install -D @types/twilio   (optional, has built-in types)

2. TWILIO ACCOUNT
   Sign up at https://www.twilio.com
   Get your Account SID and Auth Token from the console dashboard.

3. WHATSAPP SANDBOX (development / testing)
   - In Twilio console → Messaging → Try it out → Send a WhatsApp message
   - Each person who wants to receive test messages must send the join code
     (e.g. "join <word>-<word>") to the sandbox number (+1 415 523 8886)
   - TWILIO_WHATSAPP_FROM = whatsapp:+14155238886

4. WHATSAPP BUSINESS SENDER (production)
   - In Twilio console → Messaging → Senders → WhatsApp senders
   - Submit your business details for Meta review (takes 1–5 business days)
   - Once approved, use your registered number as TWILIO_WHATSAPP_FROM

5. ADD ENV VARS to .env.local
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

6. ADD TRAINER PHONE NUMBERS
   Add a `phone` column to the trainers table (run the migration in
   lib/migrate-add-trainer-phone.ts) and fill in real mobile numbers.
   Format: +39XXXXXXXXXX  (always include country code)

7. SITE URL ENV VAR (for the manage-booking link in messages)
   NEXT_PUBLIC_SITE_URL=https://yoursite.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
