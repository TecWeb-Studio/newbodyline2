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
  addBooking: (booking: Omit<Booking, 'id' | 'bookedAt'>) => void
  cancelBooking: (bookingId: string) => void
  getAvailableSlotsForTrainer: (trainerId: string, date: string) => TimeSlot[]
  isLoading: boolean
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

const trainersData: Trainer[] = [
  {
    id: 'trainer-1',
    name: 'Marcus Johnson',
    specialty: 'Strength & Conditioning',
    image: '/trainers/marcus.jpg',
    description: 'Former professional athlete with 10+ years of experience in strength training and athletic performance.',
    rating: 4.9
  },
  {
    id: 'trainer-2',
    name: 'Sarah Chen',
    specialty: 'HIIT & Cardio',
    image: '/trainers/sarah.jpg',
    description: 'Certified HIIT specialist known for high-energy sessions that maximize calorie burn and endurance.',
    rating: 4.8
  },
  {
    id: 'trainer-3',
    name: 'Elena Rodriguez',
    specialty: 'Yoga & Flexibility',
    image: '/trainers/elena.jpg',
    description: 'Yoga master with expertise in power yoga, vinyasa flow, and mobility training for all levels.',
    rating: 5.0
  },
  {
    id: 'trainer-4',
    name: 'David Kim',
    specialty: 'Boxing & Combat',
    image: '/trainers/david.jpg',
    description: 'Professional boxing coach focusing on technique, conditioning, and confidence building.',
    rating: 4.9
  }
]

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const trainers = trainersData
  const dates = [
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 172800000).toISOString().split('T')[0],
    new Date(Date.now() + 259200000).toISOString().split('T')[0],
    new Date(Date.now() + 345600000).toISOString().split('T')[0],
  ]
  
  const times = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00']
  
  trainers.forEach(trainer => {
    dates.forEach(date => {
      times.forEach(time => {
        slots.push({
          id: `${trainer.id}-${date}-${time}`,
          time,
          date,
          trainerId: trainer.id,
          isBooked: false
        })
      })
    })
  })
  
  return slots
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const savedBookings = localStorage.getItem('gym-bookings')
    const savedSlots = localStorage.getItem('gym-slots')
    
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings))
    }
    
    if (savedSlots) {
      setAvailableSlots(JSON.parse(savedSlots))
    } else {
      const initialSlots = generateTimeSlots()
      setAvailableSlots(initialSlots)
      localStorage.setItem('gym-slots', JSON.stringify(initialSlots))
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('gym-bookings', JSON.stringify(bookings))
      localStorage.setItem('gym-slots', JSON.stringify(availableSlots))
    }
  }, [bookings, availableSlots, isLoading])

  const addBooking = (bookingData: Omit<Booking, 'id' | 'bookedAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      bookedAt: new Date().toISOString()
    }
    
    setBookings(prev => [...prev, newBooking])
    
    // Mark slot as booked
    setAvailableSlots(prev => 
      prev.map(slot => 
        slot.id === bookingData.slotId 
          ? { ...slot, isBooked: true }
          : slot
      )
    )
  }

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setBookings(prev => prev.filter(b => b.id !== bookingId))
      
      // Free up the slot
      setAvailableSlots(prev => 
        prev.map(slot => 
          slot.id === booking.slotId 
            ? { ...slot, isBooked: false }
            : slot
        )
      )
    }
  }

  const getAvailableSlotsForTrainer = (trainerId: string, date: string) => {
    return availableSlots.filter(
      slot => slot.trainerId === trainerId && slot.date === date && !slot.isBooked
    )
  }

  return (
    <BookingContext.Provider value={{
      bookings,
      availableSlots,
      trainers: trainersData,
      addBooking,
      cancelBooking,
      getAvailableSlotsForTrainer,
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