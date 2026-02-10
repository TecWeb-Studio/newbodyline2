 'use client'

import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { useI18n } from '@/app/contexts/I18nContext'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Navigation, Car, Train } from 'lucide-react'

export default function LocationPage() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Page Header */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Location
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] mb-6">
                {t('location.title')}
              </h1>
              <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto">
                {t('location.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Location Content */}
        <section className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Address Card */}
                <div className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#fafafa] mb-2">{t('location.title')}</h3>
                      <p className="text-[#a1a1aa]">{t('location.address')}</p>
                      <p className="text-[#a1a1aa]">{t('location.city')}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#fafafa] mb-2">Contact</h3>
                      <a href={`tel:${t('phone').replace(/\s/g, '')}`} className="text-[#a1a1aa] hover:text-[#dc2626] transition-colors block mb-1">
                        {t('phone')}
                      </a>
                      <a href={`mailto:${t('email')}`} className="text-[#a1a1aa] hover:text-[#dc2626] transition-colors flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('email')}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#fafafa] mb-4">{t('location.hours.title')}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-[#27272a]">
                          <span className="text-[#a1a1aa]">{t('location.hours.monWedFri').split(':')[0]}</span>
                          <span className="text-[#fafafa] font-medium">{t('location.hours.monWedFri').split(':').slice(1).join(':').trim()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#27272a]">
                          <span className="text-[#a1a1aa]">{t('location.hours.tueThu').split(':')[0]}</span>
                          <span className="text-[#fafafa] font-medium">{t('location.hours.tueThu').split(':').slice(1).join(':').trim()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#27272a]">
                          <span className="text-[#a1a1aa]">{t('location.hours.saturday').split(':')[0]}</span>
                          <span className="text-[#fafafa] font-medium">{t('location.hours.saturday').split(':').slice(1).join(':').trim()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-[#a1a1aa]">{t('location.hours.sunday')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Getting Here */}
                <div className="bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-[#fafafa] mb-4">Getting Here</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center">
                        <Car className="w-5 h-5 text-[#dc2626]" />
                      </div>
                      <div>
                        <p className="text-[#fafafa] font-medium">By Car</p>
                        <p className="text-[#a1a1aa] text-sm">Free parking available</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center">
                        <Train className="w-5 h-5 text-[#dc2626]" />
                      </div>
                      <div>
                        <p className="text-[#fafafa] font-medium">By Public Transit</p>
                        <p className="text-[#a1a1aa] text-sm">Metro Line 4 - Fitness Station</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="sticky top-24 bg-[#0a0a0a] border border-[#27272a] rounded-2xl overflow-hidden">
                  {/* Map Placeholder - In production, use Google Maps or similar */}
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-[#111111] relative flex items-center justify-center">
                    {/* Decorative Map Background */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 400 400">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3f3f46" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        {/* Streets */}
                        <line x1="0" y1="200" x2="400" y2="200" stroke="#52525b" strokeWidth="8" />
                        <line x1="200" y1="0" x2="200" y2="400" stroke="#52525b" strokeWidth="8" />
                        <line x1="100" y1="0" x2="100" y2="400" stroke="#3f3f46" strokeWidth="4" />
                        <line x1="300" y1="0" x2="300" y2="400" stroke="#3f3f46" strokeWidth="4" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#3f3f46" strokeWidth="4" />
                        <line x1="0" y1="300" x2="400" y2="300" stroke="#3f3f46" strokeWidth="4" />
                      </svg>
                    </div>

                    {/* Location Pin */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#dc2626] flex items-center justify-center shadow-lg shadow-[#dc2626]/30 animate-bounce">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div className="mt-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl px-6 py-4 shadow-xl">
                        <p className="text-[#fafafa] font-semibold">NEWBODYLINE2</p>
                        <p className="text-[#a1a1aa] text-sm">{t('location.address')}</p>
                      </div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                      <button className="w-10 h-10 bg-[#0a0a0a] border border-[#27272a] rounded-lg flex items-center justify-center hover:border-[#dc2626] transition-colors">
                        <span className="text-[#fafafa] text-xl">+</span>
                      </button>
                      <button className="w-10 h-10 bg-[#0a0a0a] border border-[#27272a] rounded-lg flex items-center justify-center hover:border-[#dc2626] transition-colors">
                        <span className="text-[#fafafa] text-xl">−</span>
                      </button>
                    </div>
                  </div>

                  {/* Directions Button */}
                  <div className="p-4 border-t border-[#27272a]">
                    <a 
                      href="https://maps.google.com/?q=Via+Grisolera,+30013+Cavallino-Treporti+VE,+newbodyline2" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium rounded-xl transition-colors"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/20 to-[#0a0a0a]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#dc2626]/10 rounded-full blur-[150px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-6">
                Visit Us Today
              </h2>
              <p className="text-lg text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
                Come experience our state-of-the-art facility and meet our team. Your first session is on us!
              </p>
              <button className="btn-primary text-lg px-8 py-4">
                Book a Free Trial
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}