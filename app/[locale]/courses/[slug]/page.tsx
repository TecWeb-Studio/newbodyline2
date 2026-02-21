'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/app/i18n/navigation'
import { useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowLeft, ArrowRight, Clock, Flame, CalendarDays,
  Backpack, Users, ChevronRight, Sparkles, Target, Star,
} from 'lucide-react'
import { getCourseBySlug, getRelatedCourses, levelColors, type CourseData } from '@/lib/courses'

/* ------------------------------------------------------------------ */
/*  Intensity visual bar                                               */
/* ------------------------------------------------------------------ */
function IntensityBar({ level }: { level: string }) {
  const map: Record<string, number> = {
    'Bassa': 1, 'Low': 1, 'Niedrig': 1,
    'Leggera': 1, 'Light': 1, 'Leicht': 1,
    'Media': 2, 'Medium': 2, 'Mittel': 2,
    'Media-Alta': 3, 'Medium-High': 3, 'Mittel-Hoch': 3,
    'Alta': 3, 'High': 3, 'Hoch': 3,
    'Variabile': 2, 'Variable (individually adjustable)': 2, 'Variabel (individuell einstellbar)': 2,
  }
  const bars = map[level] ?? 2
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`h-2.5 w-8 rounded-full transition-colors ${
            i <= bars ? 'bg-[#dc2626]' : 'bg-[#27272a]'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-[#a1a1aa]">{level}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Benefit card                                                       */
/* ------------------------------------------------------------------ */
function BenefitCard({ index, title, description, accentColor }: {
  index: number; title: string; description: string; accentColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-[#111111] rounded-2xl p-7 border border-[#27272a] hover:border-[#3f3f46] transition-colors duration-300"
    >
      <div className={`w-12 h-12 rounded-xl ${accentColor} border flex items-center justify-center mb-5`}>
        <Star className={`w-5 h-5 ${accentColor.includes('rose') || accentColor.includes('red') ? 'text-rose-500' : accentColor.includes('orange') ? 'text-orange-500' : accentColor.includes('pink') ? 'text-pink-400' : accentColor.includes('violet') ? 'text-violet-400' : accentColor.includes('fuchsia') ? 'text-fuchsia-400' : accentColor.includes('purple') ? 'text-purple-400' : 'text-[#dc2626]'}`} />
      </div>
      <h4 className="text-lg font-bold text-[#fafafa] mb-2">{title}</h4>
      <p className="text-sm text-[#a1a1aa] leading-relaxed">{description}</p>
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  )
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function CourseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const course = getCourseBySlug(slug)

  const t = useTranslations('courses')
  const td = useTranslations('courseDetail')

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])

  /* 404-ish guard */
  if (!course) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#fafafa] mb-4">404</h1>
            <p className="text-[#a1a1aa] mb-8">Course not found</p>
            <Link href="/courses" className="btn-primary">
              <ArrowLeft className="w-5 h-5" />
              {td('backToCourses')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const Icon = course.icon
  const level = t(`${course.key}.level`)
  const levelClass = levelColors[level] || 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'
  const related = getRelatedCourses(course, 3)

  const benefits = [1, 2, 3, 4].map(i => ({
    title: td(`${course.key}.benefit${i}Title`),
    desc: td(`${course.key}.benefit${i}Desc`),
  }))

  const infoItems = [
    { icon: Flame, label: td('intensityLabel'), value: td(`${course.key}.intensity`), isIntensity: true },
    { icon: Clock, label: td('durationLabel'), value: td(`${course.key}.duration`), isIntensity: false },
    { icon: CalendarDays, label: td('frequencyLabel'), value: td(`${course.key}.frequency`), isIntensity: false },
    { icon: Backpack, label: td('equipmentTitle'), value: td(`${course.key}.equipment`), isIntensity: false },
  ]

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">

        {/* ─── HERO ─── */}
        <section ref={heroRef} className="relative py-28 sm:py-40 overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div className={`absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br ${course.color} rounded-full blur-[200px] opacity-40 animate-pulse`} />
            <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl ${course.color} rounded-full blur-[160px] opacity-20 animate-pulse`} style={{ animationDelay: '2s' }} />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)',
                backgroundSize: '80px 80px',
              }}
            />
          </div>

          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-sm font-medium mb-10"
              >
                <ArrowLeft className="w-4 h-4" />
                {td('backToCourses')}
              </Link>
            </motion.div>

            <div className="flex flex-col lg:flex-row lg:items-start gap-10">
              {/* Left: text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-1"
              >
                {/* Category badge */}
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-6 ${
                  course.category === 'dance'
                    ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                    : 'bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#dc2626]'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  {t(course.category === 'dance' ? 'danceSectionLabel' : 'fitnessSectionLabel')}
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] mb-4 tracking-tight">
                  {t(`${course.key}.title`)}
                </h1>

                <p className="text-lg sm:text-xl text-[#a1a1aa] leading-relaxed mb-8 max-w-2xl">
                  {t(`${course.key}.description`)}
                </p>

                {/* Level + quick stats */}
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${levelClass}`}>
                    {level}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
                    <Clock className="w-4 h-4 text-[#dc2626]" />
                    {td(`${course.key}.duration`)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
                    <CalendarDays className="w-4 h-4 text-[#dc2626]" />
                    {td(`${course.key}.frequency`)}
                  </span>
                </div>
              </motion.div>

              {/* Right: icon accent block */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className={`relative w-40 h-40 rounded-3xl ${course.accent} border flex items-center justify-center`}>
                  <Icon className={`w-20 h-20 ${course.iconColor}`} />
                  {/* Decorative ring */}
                  <div className={`absolute -inset-3 rounded-[2rem] border ${course.accent.replace('bg-', 'border-')} opacity-30`} />
                  <div className={`absolute -inset-6 rounded-[2.5rem] border ${course.accent.replace('bg-', 'border-')} opacity-10`} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ─── LONG DESCRIPTION ─── */}
        <section className="py-20 sm:py-28 bg-[#111111] relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#dc2626]/20 to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg sm:text-xl text-[#d4d4d8] leading-relaxed tracking-wide">
                {td(`${course.key}.longDescription`)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── BENEFITS ─── */}
        <section className="py-20 sm:py-28 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dc2626]/3 rounded-full blur-[200px]" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-3 block">
                {td('benefitsTitle')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa]">
                {td('benefitsTitle')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((b, i) => (
                <BenefitCard
                  key={i}
                  index={i}
                  title={b.title}
                  description={b.desc}
                  accentColor={course.accent}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHO IS IT FOR ─── */}
        <section className="py-20 sm:py-28 bg-[#111111] relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row gap-10 items-start"
            >
              <div className="md:w-1/3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#fafafa]">{td('whoIsItFor')}</h3>
                </div>
              </div>
              <div className="md:w-2/3">
                <p className="text-lg text-[#d4d4d8] leading-relaxed">
                  {td(`${course.key}.targetAudience`)}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── PRACTICAL INFO ─── */}
        <section className="py-20 sm:py-28 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[#dc2626]/3 rounded-full blur-[200px]" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-3 block">
                <Target className="w-4 h-4 inline mr-2" />
                {td('practicalInfo')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa]">
                {td('practicalInfo')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {infoItems.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="bg-[#111111] rounded-2xl p-6 border border-[#27272a]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center flex-shrink-0">
                        <ItemIcon className="w-5 h-5 text-[#dc2626]" />
                      </div>
                      <span className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider">{item.label}</span>
                    </div>
                    {item.isIntensity ? (
                      <IntensityBar level={item.value} />
                    ) : (
                      <p className="text-[#d4d4d8] leading-relaxed">{item.value}</p>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* What to expect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 bg-[#111111] rounded-2xl p-8 border border-[#27272a]"
            >
              <h3 className="text-xl font-bold text-[#fafafa] mb-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#dc2626]" />
                {td('whatToExpectTitle')}
              </h3>
              <p className="text-[#d4d4d8] leading-relaxed text-lg">
                {td(`${course.key}.whatToExpect`)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-28 sm:py-36 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/15 via-[#0a0a0a] to-[#dc2626]/10" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#dc2626]/8 rounded-full blur-[200px]" />
          </div>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#dc2626]/30 rounded-full"
                style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-6 tracking-tight">
                {td('startJourney')}
              </h2>
              <p className="text-lg text-[#a1a1aa] mb-10 max-w-2xl mx-auto leading-relaxed">
                {td(`${course.key}.targetAudience`)}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wa.me/3479633983"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-lg px-8 py-4"
                >
                  {td('contactWhatsApp')}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link href="/courses" className="btn-secondary text-lg px-8 py-4">
                  {td('backToCourses')}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── RELATED COURSES ─── */}
        {related.length > 0 && (
          <section className="py-20 sm:py-28 bg-[#111111]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-14"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa]">
                  {td('relatedCourses')}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(rc => {
                  const RcIcon = rc.icon
                  return (
                    <Link key={rc.key} href={`/courses/${rc.slug}`} className="group block">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="relative bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#27272a] hover:border-[#3f3f46] transition-all duration-300"
                      >
                        <div className={`h-1.5 w-full bg-gradient-to-r ${rc.color}`} />
                        <div className="p-6">
                          <div className={`w-12 h-12 rounded-xl ${rc.accent} border flex items-center justify-center mb-4`}>
                            <RcIcon className={`w-6 h-6 ${rc.iconColor}`} />
                          </div>
                          <h4 className="text-lg font-bold text-[#fafafa] mb-2 group-hover:text-[#dc2626] transition-colors">
                            {t(`${rc.key}.title`)}
                          </h4>
                          <p className="text-sm text-[#a1a1aa] line-clamp-2 mb-4">
                            {t(`${rc.key}.description`)}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#dc2626]">
                            {td('discoverOtherCourses')}
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  )
}
