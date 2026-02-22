'use client'

import { useI18n } from '@/app/contexts/I18nContext'
import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

const galleryImages = [
  { src: '/images/gallery/gym-1.jpg', alt: 'Sala attrezzi', span: 'col-span-2 row-span-2' },
  { src: '/images/gallery/gym-2.jpg', alt: 'Sala corsi', span: 'col-span-1 row-span-1' },
  { src: '/images/gallery/gym-3.jpg', alt: 'Sala danza', span: 'col-span-1 row-span-1' },
  { src: '/images/gallery/gym-4.jpg', alt: 'Allenamento', span: 'col-span-1 row-span-1' },
  { src: '/images/gallery/gym-5.jpg', alt: 'Spinning', span: 'col-span-1 row-span-1' },
]

function GalleryImage({ src, alt, span }: { src: string; alt: string; span: string }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden rounded-2xl group ${span}`}>
      <div className="relative w-full h-full min-h-50 sm:min-h-62.5 bg-[#111111] border border-[#27272a]">
        {!hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={span.includes('col-span-2') ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111111]">
            <ImageIcon className="w-10 h-10 text-[#27272a] mb-2" />
            <span className="text-[#3f3f46] text-xs">{alt}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#0a0a0a]/0 group-hover:bg-[#0a0a0a]/30 transition-colors duration-300" />
      </div>
    </div>
  )
}

export default function GallerySection() {
  const { t } = useI18n()

  return (
    <section className="py-16 sm:py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#dc2626]/5 rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {galleryImages.map((img, index) => (
            <GalleryImage key={index} src={img.src} alt={img.alt} span={img.span} />
          ))}
        </div>
      </div>
    </section>
  )
}
