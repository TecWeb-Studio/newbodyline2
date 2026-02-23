// ─── Shared TypeScript types ───────────────────────────────────────────────
// Used by both API routes and client-side components

export interface Trainer {
  id: string
  name: string
  specialty: string
  image: string
  description: string
  rating: number
  phone?: string
}

export interface TimeSlot {
  id: string
  time: string
  date: string
  trainerId: string
  isBooked: boolean
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected'

export interface Booking {
  id: string
  trainerId: string
  trainerName: string
  slotId: string
  date: string
  time: string
  clientName: string
  clientEmail: string
  clientPhone: string
  bookedAt: string
  status: BookingStatus
}

export interface ScheduleRow {
  id: number
  trainer_id: string
  weekday: number
  time: string
}

export interface VacationRow {
  id: number
  trainer_id: string
  start_date: string
  end_date: string
  note: string | null
}

// ─── Gym opening hours configuration ──────────────────────────────────────
export interface HourRange {
  open: string
  close: string
}

export const GYM_HOURS: Record<number, HourRange[]> = {
  0: [{ open: '06:00', close: '22:00' }], // Mon
  1: [{ open: '07:00', close: '22:00' }], // Tue
  2: [{ open: '06:00', close: '22:00' }], // Wed
  3: [{ open: '07:00', close: '22:00' }], // Thu
  4: [{ open: '06:00', close: '22:00' }], // Fri
  5: [{ open: '07:00', close: '12:00' }, { open: '16:00', close: '20:00' }], // Sat
  // 6 = Sun: closed (no entry)
}

export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

// ─── Validation utilities ─────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export function validatePhone(phone: string): boolean {
  return PHONE_RE.test(phone.trim())
}

export function validateName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateBookingForm(data: {
  name: string
  email: string
  phone: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  if (!validateName(data.name)) {
    errors.name = 'Name must be 2-100 characters'
  }
  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }
  if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
