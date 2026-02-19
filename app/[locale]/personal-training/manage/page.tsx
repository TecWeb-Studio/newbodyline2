'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import BookingCalendar from '@/app/components/BookingCalendar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
  Lock,
} from 'lucide-react'

interface Booking {
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
}

interface TimeSlot {
  id: string
  time: string
  date: string
  trainerId: string
  isBooked: boolean
}

interface Trainer {
  id: string
  name: string
  specialty: string
  image: string
}

export default function ManageBookingPage() {
  const searchParams = useSearchParams()

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [bookingId, setBookingId] = useState(searchParams.get('id') ?? '')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ── Data ────────────────────────────────────────────────────────────────────
  const [booking, setBooking] = useState<Booking | null>(null)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [canEdit, setCanEdit] = useState(true)
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null)

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const checkEditWindow = useCallback((b: Booking) => {
    const appointmentDatetime = new Date(`${b.date}T${b.time}:00`)
    const now = new Date()
    const hours = (appointmentDatetime.getTime() - now.getTime()) / (1000 * 60 * 60)
    setHoursRemaining(Math.max(0, hours))
    setCanEdit(hours >= 12)
  }, [])

  // Auto-lookup if id+email are in URL
  useEffect(() => {
    if (bookingId && email && !isAuthenticated) {
      handleLookup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load trainers for the change-trainer dropdown
  useEffect(() => {
    fetch('/api/trainers')
      .then((r) => r.json())
      .then((d) => setTrainers(d.trainers ?? []))
      .catch(() => {})
  }, [])

  // Fetch slots when trainer + date change
  useEffect(() => {
    if (!selectedTrainer || !selectedDate) {
      setAvailableSlots([])
      return
    }
    fetch(`/api/slots/${selectedTrainer}?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        const slots: TimeSlot[] = (d.slots ?? []).map((s: Record<string, unknown>) => ({
          id: s.id,
          time: s.time,
          date: s.date,
          trainerId: s.trainer_id,
          isBooked: s.is_booked === 1,
        }))
        setAvailableSlots(slots.filter((s) => !s.isBooked))
      })
      .catch(() => setAvailableSlots([]))
  }, [selectedTrainer, selectedDate])

  // ── Actions ──────────────────────────────────────────────────────────────────
  async function handleLookup() {
    if (!bookingId.trim() || !email.trim()) {
      setError('Please enter your booking ID and email.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(bookingId)}?email=${encodeURIComponent(email)}`
      )
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Booking not found')
      }
      const { booking: b } = await res.json()
      setBooking(b)
      setIsAuthenticated(true)
      checkEditWindow(b)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not find the booking.')
    } finally {
      setIsLoading(false)
    }
  }

  function startEditing() {
    if (!booking) return
    setSelectedTrainer(booking.trainerId)
    setSelectedDate(booking.date)
    setSelectedSlot('')
    setIsEditing(true)
    setError('')
  }

  async function handleSave() {
    if (!selectedSlot) {
      setError('Please select a new time slot.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: email,
          newSlotId: selectedSlot,
          newTrainerId: selectedTrainer !== booking?.trainerId ? selectedTrainer : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          data.code === 'TOO_LATE_TO_CHANGE'
            ? 'Changes are no longer possible – the appointment is less than 12 hours away.'
            : data.error ?? 'Failed to update booking'
        throw new Error(msg)
      }
      setBooking(data.booking)
      setIsEditing(false)
      setSuccess(true)
      checkEditWindow(data.booking)
      setTimeout(() => setSuccess(false), 5000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2">Manage Booking</h1>
          <p className="text-zinc-400 mb-8">
            Look up your booking by ID and email to view or modify it.
          </p>

          {/* ── Lookup form ── */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 space-y-4"
            >
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Booking ID</label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="booking-1234567890-abc"
                  className="w-full bg-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
              <button
                onClick={handleLookup}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
              >
                {isLoading ? 'Looking up…' : 'Find My Booking'}
              </button>
            </motion.div>
          )}

          {/* ── Booking card ── */}
          <AnimatePresence>
            {isAuthenticated && booking && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Success banner */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-green-900/50 border border-green-700 rounded-xl px-4 py-3 text-green-300 text-sm"
                  >
                    <CheckCircle size={16} />
                    Booking updated successfully!
                  </motion.div>
                )}

                <div className="bg-zinc-900 rounded-2xl p-6 space-y-3">
                  <h2 className="font-semibold text-lg">Your Booking</h2>

                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <User size={15} className="text-amber-500 shrink-0" />
                    {booking.trainerName}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Calendar size={15} className="text-amber-500 shrink-0" />
                    {booking.date}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Clock size={15} className="text-amber-500 shrink-0" />
                    {booking.time}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Mail size={15} className="text-amber-500 shrink-0" />
                    {booking.clientEmail}
                  </div>

                  {/* Edit window notice */}
                  {!canEdit && (
                    <div className="flex items-start gap-2 bg-zinc-800 rounded-xl px-4 py-3 text-amber-400 text-xs mt-2">
                      <Lock size={13} className="shrink-0 mt-0.5" />
                      Changes are locked. The appointment is less than 12 hours away.
                    </div>
                  )}
                  {canEdit && hoursRemaining !== null && (
                    <div className="text-xs text-zinc-500 mt-1">
                      Changes allowed — {Math.floor(hoursRemaining)}h remaining before lock
                    </div>
                  )}
                </div>

                {/* ── Edit form ── */}
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    disabled={!canEdit}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition"
                  >
                    <RefreshCw size={16} />
                    Change Date / Time / Trainer
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 rounded-2xl p-6 space-y-4"
                  >
                    <h3 className="font-semibold">Modify Booking</h3>

                    {/* Trainer */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Trainer</label>
                      <select
                        value={selectedTrainer}
                        onChange={(e) => {
                          setSelectedTrainer(e.target.value)
                          setSelectedSlot('')
                        }}
                        className="w-full bg-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} – {t.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Date</label>
                      <BookingCalendar
                        value={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date)
                          setSelectedSlot('')
                        }}
                        accent="amber"
                      />
                    </div>

                    {/* Time slots */}
                    {selectedTrainer && selectedDate && (
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Available Times</label>
                        {availableSlots.length === 0 ? (
                          <p className="text-zinc-500 text-sm">No available slots for this date.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`py-2 rounded-lg text-sm font-medium transition border ${
                                  selectedSlot === slot.id
                                    ? 'bg-amber-500 border-amber-500 text-black'
                                    : 'bg-zinc-800 border-zinc-700 hover:border-amber-500 text-zinc-200'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {error && (
                      <p className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={14} /> {error}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setError('')
                        }}
                        className="flex-1 flex items-center justify-center gap-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 py-2.5 rounded-xl text-sm transition"
                      >
                        <ChevronLeft size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!selectedSlot || isSaving}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-xl text-sm transition"
                      >
                        {isSaving ? 'Saving…' : 'Confirm Change'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Back link */}
                <button
                  onClick={() => {
                    setIsAuthenticated(false)
                    setBooking(null)
                    setIsEditing(false)
                    setError('')
                  }}
                  className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 transition"
                >
                  <ChevronLeft size={14} /> Look up a different booking
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
