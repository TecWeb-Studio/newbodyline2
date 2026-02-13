'use client'

import { useTranslations } from 'next-intl'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { Clock, BarChart3, Dumbbell, Zap, Heart, Flame } from 'lucide-react'

const coursesList = [
  { key: 'strength', icon: Dumbbell },
  { key: 'cardio', icon: Zap },
  { key: 'hiit', icon: Flame },
  { key: 'yoga', icon: Heart },
  { key: 'boxing', icon: Flame },
  { key: 'pilates', icon: Heart },
]

export default function CoursesPage() {
  const t = useTranslations('courses')

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Page Header */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full mobile-blur-light" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full mobile-blur-light" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center css-fade-in-up"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
                Courses
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] mb-6">
                {t('title')}
              </h1>
              <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16 sm:py-24 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coursesList.map((course, index) => {
                const Icon = course.icon
                return (
                  <div
                    key={course.key}
                    className={`group relative bg-[#0a0a0a] border border-[#27272a] rounded-2xl p-8 hover:border-[#dc2626]/30 transition-all duration-300 hover:transform hover:-translate-y-1 css-fade-in-up css-delay-${(index + 1) * 100}`}
                  >
                    {/* Course Icon */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#dc2626]/20 to-[#991b1b]/20 border border-[#dc2626]/20 flex items-center justify-center mb-6 group-hover:from-[#dc2626]/30 group-hover:to-[#991b1b]/30 transition-all">
                      <Icon className="w-8 h-8 text-[#dc2626]" />
                    </div>

                    {/* Course Info */}
                    <h3 className="text-2xl font-bold text-[#fafafa] mb-3">
                      {t(`${course.key}.title`)}
                    </h3>
                    <p className="text-[#a1a1aa] mb-6 leading-relaxed">
                      {t(`${course.key}.description`)}
                    </p>

                    {/* Course Meta */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2 text-sm text-[#71717a]">
                        <Clock className="w-4 h-4 text-[#dc2626]" />
                        <span>{t(`${course.key}.duration`)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#71717a]">
                        <BarChart3 className="w-4 h-4 text-[#dc2626]" />
                        <span>{t(`${course.key}.level`)}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full py-3 rounded-lg border border-[#27272a] text-[#fafafa] font-medium hover:bg-[#dc2626] hover:border-[#dc2626] transition-all">
                      {t('cta')}
                    </button>

                    {/* Hover Accent */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#dc2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/20 to-[#0a0a0a]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#dc2626]/10 rounded-full mobile-blur-light" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div
              className="css-fade-in-up"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
                Join NEWBODYLINE2 today and get access to all our premium courses, state-of-the-art equipment, and expert trainers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="btn-primary text-lg px-8 py-4">
                  Get Started Today
                </button>
                <button className="btn-secondary text-lg px-8 py-4">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}