'use client'

import { useI18n } from '@/app/contexts/I18nContext'
import { Link } from '@/app/i18n/navigation'
import { ArrowRight, MapPin } from 'lucide-react'

export default function Hero() {
  const { t } = useI18n()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {/* Gradient Orbs */}
        <div className="hidden md:block absolute top-1/4 left-1/4 w-72 h-72 bg-[#dc2626]/20 rounded-full blur-[60px] animate-pulse" />
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#dc2626]/10 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Tagline */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-600">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#dc2626] text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
              {t('hero.tagline')}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-top-4 duration-600 delay-100">
            <span className="block text-[#fafafa]">{t('hero.title')}</span>
            <span className="block gradient-text mt-2">{t('hero.titleAccent')}</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#a1a1aa] mb-10 leading-relaxed animate-in fade-in slide-in-from-top-4 duration-600 delay-200">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-top-4 duration-600 delay-300">
            <Link href="/courses" className="btn-primary text-lg px-8 py-4">
              {t('hero.ctaPrimary')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/location" className="btn-secondary text-lg px-8 py-4">
              <MapPin className="w-5 h-5" />
              {t('hero.ctaSecondary')}
            </Link>
          </div>

          {/* Stats Preview */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-600 delay-500">
            {[
              { value: '10K+', label: 'Members' },
              { value: '50+', label: 'Classes/Week' },
              { value: '25+', label: 'Trainers' },
              { value: '15', label: 'Years' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-1">{stat.value}</div>
                <div className="text-sm text-[#71717a]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll / Explore Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-in fade-in duration-600 delay-1000">
        <div className="flex flex-col items-center gap-2 text-[#71717a]">
          <span className="text-xs uppercase tracking-widest">{t('hero.scrollLabel')}</span>
          <div className="w-10 h-6 flex items-center justify-center">
            <svg width="36" height="14" viewBox="0 0 36 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#dc2626] animate-bounce">
              <rect x="14" y="5" width="8" height="4" rx="1" fill="#dc2626" />
              <rect x="0" y="3" width="4" height="8" rx="1" fill="#dc2626" />
              <rect x="32" y="3" width="4" height="8" rx="1" fill="#dc2626" />
              <rect x="6" y="4" width="2" height="6" rx="0.5" fill="#dc2626" />
              <rect x="28" y="4" width="2" height="6" rx="0.5" fill="#dc2626" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}