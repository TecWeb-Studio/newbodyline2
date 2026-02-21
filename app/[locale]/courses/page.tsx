'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/app/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { ArrowRight, ChevronRight, Sparkles, Music } from 'lucide-react'
import { fitnessCourses, danceCourses, levelColors, type CourseData } from '@/lib/courses'

function CourseCard({ course, index, t }: { course: CourseData, index: number, t: ReturnType<typeof useTranslations> }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = course.icon
  const level = t(`${course.key}.level`)
  const levelColorClass = levelColors[level] || 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative z-0 hover:z-10"
    >
      <motion.div
        animate={isHovered
          ? { scale: 1.03, boxShadow: '0 20px 40px rgba(220,38,38,0.10), 0 0 0 1px rgba(220,38,38,0.25)' }
          : { scale: 1, boxShadow: '0 0px 0px rgba(220,38,38,0), 0 0 0 1px rgba(39,39,42,1)' }
        }
        transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative bg-[#0a0a0a] rounded-2xl overflow-hidden origin-center will-change-transform"
      >
        {/* Top gradient band */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${course.color}`} />
        
        <div className="p-7">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <motion.div
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`w-14 h-14 rounded-xl ${course.accent} border flex items-center justify-center`}
            >
              <Icon className={`w-7 h-7 ${course.iconColor}`} />
            </motion.div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${levelColorClass}`}>
              {level}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[#fafafa] mb-3 group-hover:text-[#dc2626] transition-colors duration-300">
            {t(`${course.key}.title`)}
          </h3>

          {/* Description - fixed height, no layout shift */}
          <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6 line-clamp-3">
            {t(`${course.key}.description`)}
          </p>

          {/* CTA */}
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#fafafa] hover:text-[#dc2626] transition-colors group/cta"
          >
            {t('cta')}
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
          </Link>
        </div>

        {/* Hover shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
    </motion.div>
  )
}

export default function CoursesPage() {
  const t = useTranslations('courses')
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero with parallax */}
        <section ref={heroRef} className="relative py-28 sm:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-[#0a0a0a]">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#dc2626]/8 rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#dc2626]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#dc2626]/3 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>

          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-6"
              >
                <Sparkles className="w-4 h-4" />
                {t('sectionLabel')}
              </motion.span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#fafafa] mb-6 tracking-tight">
                {t('title')}
              </h1>
              <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
                {t('subtitle')}
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Fitness Courses */}
        <section className="py-20 sm:py-28 bg-[#111111] relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#dc2626]/20 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14"
            >
              <div>
                <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-3 block">
                  {t('fitnessSectionLabel')}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa]">
                  {t('fitnessSection')}
                </h2>
              </div>
              <div className="h-px sm:h-auto sm:w-px flex-1 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-[#27272a] to-transparent" />
              <p className="text-[#a1a1aa] max-w-sm text-sm leading-relaxed">
                {t('subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fitnessCourses.map((course, index) => (
                <CourseCard key={course.key} course={course} index={index} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* Dance Courses */}
        <section className="py-20 sm:py-28 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dc2626]/3 rounded-full blur-[200px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14 max-w-3xl mx-auto"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold uppercase tracking-wider mb-6">
                <Music className="w-4 h-4" />
                {t('danceSectionLabel')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-4">
                {t('danceSection')}
              </h2>
              <p className="text-lg text-[#a1a1aa] leading-relaxed">
                {t('danceSubtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {danceCourses.map((course, index) => (
                <CourseCard key={course.key} course={course} index={index} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-28 sm:py-36 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/15 via-[#0a0a0a] to-[#dc2626]/10" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#dc2626]/8 rounded-full blur-[200px]" />
          </div>
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
                {t('ctaTitle')}
              </h2>
              <p className="text-lg text-[#a1a1aa] mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('ctaDescription')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="https://wa.me/3479633983" target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-4">
                  {t('ctaPrimary')}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link href="/location" className="btn-secondary text-lg px-8 py-4">
                  {t('ctaSecondary')}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}