'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { useBooking } from '@/app/contexts/BookingContext'
import { Star, Calendar, Clock, User, Mail, Phone, Check, ChevronLeft, Award, Users, Target, Shield } from 'lucide-react'

export default function PersonalTrainingPage() {
  const t = useTranslations('personalTraining')
  const { trainers, getAvailableSlotsForTrainer, addBooking, isLoading } = useBooking()
  
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Generate dates for next 5 days
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  })

  const availableSlots = selectedTrainer && selectedDate 
    ? getAvailableSlotsForTrainer(selectedTrainer, selectedDate)
    : []

  const selectedTrainerData = trainers.find(t => t.id === selectedTrainer)

  const handleBook = () => {
    if (selectedTrainerData && selectedSlot) {
      const slot = availableSlots.find(s => s.id === selectedSlot)
      if (slot) {
        addBooking({
          trainerId: selectedTrainerData.id,
          trainerName: selectedTrainerData.name,
          slotId: slot.id,
          date: slot.date,
          time: slot.time,
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone
        })
        setBookingSuccess(true)
      }
    }
  }

  const resetBooking = () => {
    setSelectedTrainer(null)
    setSelectedDate('')
    setSelectedSlot(null)
    setFormData({ name: '', email: '', phone: '' })
    setShowBookingForm(false)
    setBookingSuccess(false)
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#27272a] border-t-[#dc2626] rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full mobile-blur-light" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full mobile-blur-light" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center max-w-3xl mx-auto css-fade-in-up"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                {t('title')}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-lg sm:text-xl text-[#a1a1aa]">
                {t('heroDescription')}
              </p>
            </div>
          </div>
        </section>

        {/* Trainers Section */}
        <section className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center mb-16 css-fade-in-up"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
                {t('trainers.title')}
              </h2>
              <p className="text-[#a1a1aa] text-lg">{t('trainers.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trainers.map((trainer, index) => (
                <div
                  key={trainer.id}
                  onClick={() => {
                    setSelectedTrainer(trainer.id)
                    setShowBookingForm(true)
                  }}
                  className={`group relative bg-[#0a0a0a] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 css-fade-in-up ${
                    selectedTrainer === trainer.id 
                      ? 'border-[#dc2626] shadow-lg shadow-[#dc2626]/20' 
                      : 'border-[#27272a] hover:border-[#dc2626]/50'
                  }`}
                >
                  {/* Trainer Image Placeholder */}
                  <div className="aspect-[4/5] bg-gradient-to-b from-[#27272a] to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    <User className="w-24 h-24 text-[#3f3f46]" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#27272a]">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-[#fafafa] font-semibold text-sm">{trainer.rating}</span>
                    </div>
                  </div>

                  {/* Trainer Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#fafafa] mb-2">{trainer.name}</h3>
                    <p className="text-[#dc2626] font-medium text-sm mb-3">{trainer.specialty}</p>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed line-clamp-2">
                      {trainer.description}
                    </p>
                    
                    <button className="mt-4 w-full py-2.5 rounded-lg border border-[#27272a] text-[#fafafa] font-medium hover:bg-[#dc2626] hover:border-[#dc2626] transition-all">
                      {t('booking.bookSession')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Section */}
        {showBookingForm && (
            <section className="py-16 sm:py-24 bg-[#0a0a0a] relative">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className="bg-[#111111] border border-[#27272a] rounded-3xl p-8 sm:p-12 css-fade-in-up"
                >
                  {bookingSuccess ? (
                    <div
                      className="text-center py-12 css-fade-in"
                    >
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#fafafa] mb-4">{t('booking.bookingSuccess')}</h3>
                      <p className="text-[#a1a1aa] mb-8">{t('booking.bookingSuccessMessage')}</p>
                      
                      <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                        <h4 className="text-[#dc2626] font-semibold mb-4">{t('booking.sessionDetails')}</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">{t('booking.trainer')}</span>
                            <span className="text-[#fafafa]">{selectedTrainerData?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">{t('booking.date')}</span>
                            <span className="text-[#fafafa]">{selectedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">{t('booking.time')}</span>
                            <span className="text-[#fafafa]">
                              {availableSlots.find(s => s.id === selectedSlot)?.time}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#71717a]">{t('booking.duration')}</span>
                            <span className="text-[#fafafa]">{t('booking.sessionDuration')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button onClick={resetBooking} className="btn-primary">
                        {t('booking.bookSession')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-8">
                        <button 
                          onClick={() => {
                            if (selectedSlot) {
                              setSelectedSlot(null)
                            } else if (selectedDate) {
                              setSelectedDate('')
                            } else {
                              setSelectedTrainer(null)
                              setShowBookingForm(false)
                            }
                          }}
                          className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#a1a1aa]" />
                        </button>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa]">{t('booking.title')}</h2>
                      </div>

                      {!selectedTrainer ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {trainers.map((trainer) => (
                            <button
                              key={trainer.id}
                              onClick={() => setSelectedTrainer(trainer.id)}
                              className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl hover:border-[#dc2626] transition-all text-left"
                            >
                              <div className="w-16 h-16 rounded-full bg-[#27272a] flex items-center justify-center">
                                <User className="w-8 h-8 text-[#71717a]" />
                              </div>
                              <div>
                                <p className="text-[#fafafa] font-semibold">{trainer.name}</p>
                                <p className="text-[#dc2626] text-sm">{trainer.specialty}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : !selectedDate ? (
                        <div>
                          <p className="text-[#a1a1aa] mb-6">{t('booking.selectDate')}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {dates.map((date) => (
                              <button
                                key={date.value}
                                onClick={() => setSelectedDate(date.value)}
                                className="p-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl hover:border-[#dc2626] transition-all text-center"
                              >
                                <Calendar className="w-5 h-5 text-[#dc2626] mx-auto mb-2" />
                                <p className="text-[#fafafa] text-sm font-medium">{date.label}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : !selectedSlot ? (
                        <div>
                          <p className="text-[#a1a1aa] mb-6">{t('booking.selectTime')}</p>
                          {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className="p-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl hover:border-[#dc2626] hover:bg-[#dc2626]/10 transition-all text-center"
                                >
                                  <Clock className="w-5 h-5 text-[#dc2626] mx-auto mb-2" />
                                  <p className="text-[#fafafa] font-medium">{slot.time}</p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[#a1a1aa] text-center py-8">{t('booking.noSlots')}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-[#a1a1aa] text-sm mb-2">{t('booking.yourName')}</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:border-[#dc2626] focus:outline-none transition-colors"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-[#a1a1aa] text-sm mb-2">{t('booking.yourEmail')}</label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:border-[#dc2626] focus:outline-none transition-colors"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-[#a1a1aa] text-sm mb-2">{t('booking.yourPhone')}</label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#fafafa] focus:border-[#dc2626] focus:outline-none transition-colors"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          <button
                            onClick={handleBook}
                            disabled={!formData.name || !formData.email || !formData.phone}
                            className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t('booking.bookSession')}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

        {/* Benefits Section */}
        <section className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center mb-16 css-fade-in-up"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
                {t('benefits.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: 'customized', icon: Target },
                { key: 'accountability', icon: Users },
                { key: 'faster', icon: Award },
                { key: 'technique', icon: Shield },
              ].map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={benefit.key}
                    className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all css-fade-in-up"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
                      {t(`benefits.${benefit.key}.title`)}
                    </h3>
                    <p className="text-[#a1a1aa] text-sm">
                      {t(`benefits.${benefit.key}.description`)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}