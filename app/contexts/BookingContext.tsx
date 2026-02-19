'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

export interface Trainer {
  id: string
  name: string
  specialty: string
  image: string
  description: string
  rating: number
}

export interface TimeSlot {
  id: string
  time: string
  date: string
  trainerId: string
  isBooked: boolean
}

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
}

interface BookingContextType {
  bookings: Booking[]
  availableSlots: TimeSlot[]
  trainers: Trainer[]
  addBooking: (booking: Omit<Booking, 'id' | 'bookedAt'>) => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  editBooking: (bookingId: string, clientEmail: string, newSlotId: string, newTrainerId?: string) => Promise<Booking>
  getAvailableSlotsForTrainer: (trainerId: string, date: string) => Promise<{ slots: TimeSlot[]; onVacation: boolean }>
  refreshBookings: () => Promise<void>
  isLoading: boolean
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Funzione per caricare le prenotazioni dal database
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      // Mappa i dati dal database al formato del frontend
      const mappedBookings = data.bookings.map((booking: {
        id: string
        trainer_id: string
        trainer_name: string
        slot_id: string
        date: string
        time: string
        client_name: string
        client_email: string
        client_phone: string
        booked_at: string
      }) => ({
        id: booking.id,
        trainerId: booking.trainer_id,
        trainerName: booking.trainer_name,
        slotId: booking.slot_id,
        date: booking.date,
        time: booking.time,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        bookedAt: booking.booked_at
      }))
      setBookings(mappedBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  // Carica i trainers e le prenotazioni all'avvio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/trainers')
        const data = await response.json()
        setTrainers(data.trainers)
        
        // Carica anche le prenotazioni
        await fetchBookings()
      } catch (error) {
        console.error('Error fetching trainers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'bookedAt'>) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerId: bookingData.trainerId,
          trainerName: bookingData.trainerName,
          slotId: bookingData.slotId,
          date: bookingData.date,
          time: bookingData.time,
          clientName: bookingData.clientName,
          clientEmail: bookingData.clientEmail,
          clientPhone: bookingData.clientPhone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      const data = await response.json()
      setBookings(prev => [...prev, data.booking])
    } catch (error) {
      console.error('Error adding booking:', error)
      throw error
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      setBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (error) {
      console.error('Error cancelling booking:', error)
      throw error
    }
  }

  const editBooking = async (
    bookingId: string,
    clientEmail: string,
    newSlotId: string,
    newTrainerId?: string
  ): Promise<Booking> => {
    const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientEmail, newSlotId, newTrainerId }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error ?? 'Failed to update booking')
    }

    const updated: Booking = {
      id: data.booking.id,
      trainerId: data.booking.trainer_id ?? data.booking.trainerId,
      trainerName: data.booking.trainer_name ?? data.booking.trainerName,
      slotId: data.booking.slot_id ?? data.booking.slotId,
      date: data.booking.date,
      time: data.booking.time,
      clientName: data.booking.client_name ?? data.booking.clientName,
      clientEmail: data.booking.client_email ?? data.booking.clientEmail,
      clientPhone: data.booking.client_phone ?? data.booking.clientPhone,
      bookedAt: data.booking.booked_at ?? data.booking.bookedAt,
    }

    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b))
    return updated
  }

  const getAvailableSlotsForTrainer = async (trainerId: string, date: string): Promise<{ slots: TimeSlot[]; onVacation: boolean }> => {
    try {
      const response = await fetch(`/api/slots/${trainerId}?date=${date}`)
      const data = await response.json()
      
      // Mappa i dati dal database al formato del frontend
      const slots = data.slots.map((slot: { id: string; time: string; date: string; trainer_id: string; is_booked: number }) => ({
        id: slot.id,
        time: slot.time,
        date: slot.date,
        trainerId: slot.trainer_id,
        isBooked: slot.is_booked === 1
      }))
      return { slots, onVacation: !!data.onVacation }
    } catch (error) {
      console.error('Error fetching slots:', error)
      return { slots: [], onVacation: false }
    }
  }

  return (
    <BookingContext.Provider value={{
      bookings,
      availableSlots: [], // Non più necessario mantenerlo in stato
      trainers,
      addBooking,
      cancelBooking,
      editBooking,
      getAvailableSlotsForTrainer,
      refreshBookings: fetchBookings,
      isLoading
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
