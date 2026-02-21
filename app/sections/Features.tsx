'use client'

import { useTranslations } from 'next-intl'
import { Home, Users, Heart, Sparkles } from 'lucide-react'

const features = [
  {
    key: 'equipment',
    icon: Home,
  },
  {
    key: 'trainers',
    icon: Users,
  },
  {
    key: 'atmosphere',
    icon: Heart,
  },
  {
    key: 'hours',
    icon: Sparkles,
  },
]

export default function Features() {
  const t = useTranslations('features')

  return (
    <section className="section bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-600">
          <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
            {t('sectionLabel')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#fafafa] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={feature.key} 
                className="group card hover:border-[#dc2626]/30 animate-in fade-in slide-in-from-top-4 duration-600"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center mb-6 group-hover:bg-[#dc2626]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[#dc2626]" />
                </div>
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">{t(`${feature.key}.title`)}</h3>
                <p className="text-[#a1a1aa] leading-relaxed">{t(`${feature.key}.description`)}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-b-2xl group-hover:w-full transition-all duration-500" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}