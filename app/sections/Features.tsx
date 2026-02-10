'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Dumbbell, Users, Zap, Clock } from 'lucide-react'

const features = [
  {
    key: 'equipment',
    icon: Dumbbell,
  },
  {
    key: 'trainers',
    icon: Users,
  },
  {
    key: 'atmosphere',
    icon: Zap,
  },
  {
    key: 'hours',
    icon: Clock,
  },
]

export default function Features() {
  const t = useTranslations('features')

  return (
    <section className="section bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#dc2626] text-sm font-semibold uppercase tracking-wider mb-4 block">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#fafafa] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[#a1a1aa] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group card hover:border-[#dc2626]/30"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center mb-6 group-hover:bg-[#dc2626]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[#dc2626]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed">
                  {t(`${feature.key}.description`)}
                </p>

                {/* Hover Accent Line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-b-2xl group-hover:w-full transition-all duration-500" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}