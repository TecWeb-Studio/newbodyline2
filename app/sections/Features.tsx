'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Home, Users, Heart, Sparkles, ImageIcon } from 'lucide-react'
import Image from 'next/image'

function FeatureImage({ src, alt, objectPosition = 'center' }: { src: string; alt: string; objectPosition?: string }) {
  const [hasError, setHasError] = useState(false)
  return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden mb-6 bg-[#0a0a0a] border border-[#27272a]">
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <ImageIcon className="w-8 h-8 text-[#27272a] mb-1" />
          <span className="text-[#3f3f46] text-xs">{alt}</span>
        </div>
      )}
    </div>
  )
}

const features = [
  {
    key: 'equipment',
    icon: Home,
    image: '/images/features/equipment.jpeg',
    objectPosition: 'center 10%',
  },
  {
    key: 'trainers',
    icon: Users,
    image: '/images/features/trainers.jpeg',
    objectPosition: undefined,
  },
  {
    key: 'atmosphere',
    icon: Heart,
    image: '/images/features/atmosphere.jpg',
    objectPosition: undefined,
  },
  {
    key: 'hours',
    icon: Sparkles,
    image: '/images/features/wellbeing.jpg',
    objectPosition: undefined,
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
                {/* Feature Image */}
                <FeatureImage
                  src={feature.image}
                  alt={t(`${feature.key}.title`)}
                  objectPosition={feature.objectPosition}
                />

                <div className="w-14 h-14 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center mb-6 group-hover:bg-[#dc2626]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[#dc2626]" />
                </div>
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">{t(`${feature.key}.title`)}</h3>
                <p className="text-[#a1a1aa] leading-relaxed">{t(`${feature.key}.description`)}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-linear-to-r from-[#dc2626] to-[#ef4444] rounded-b-2xl group-hover:w-full transition-all duration-500" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}