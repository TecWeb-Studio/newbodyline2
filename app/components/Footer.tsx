 'use client'

import { useI18n } from '@/app/contexts/I18nContext'
import { Link } from '@/app/i18n/navigation'
import { Instagram, Facebook, MapPin, Phone, Mail, Lock, MessageCircle } from 'lucide-react'

export default function Footer() {
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    quickLinks: [
      { label: t('nav.home'), href: '/' },
      { label: t('nav.courses'), href: '/courses' },
      { label: t('nav.personalTraining'), href: '/personal-training' },
      { label: t('nav.location'), href: '/location' },
    ],
  }

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/newbodyline2/', label: 'Instagram' },
    { icon: Facebook, href: 'https://www.facebook.com/p/New-Body-Line-2-100063828272330/', label: 'Facebook' },
    { icon: MessageCircle, href: 'https://wa.me/3479633983', label: 'WhatsApp' },
  ]

  return (
    <footer className="bg-[#111111] border-t border-[#27272a]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                NEWBODYLINE<span className="text-[#dc2626]">2</span>
              </span>
            </Link>
            <p className="text-[#a1a1aa] text-sm mb-2">Not Only Fitness</p>
            <p className="text-[#a1a1aa] mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-[#27272a] hover:bg-[#dc2626] flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 text-[#a1a1aa] group-hover:text-white transition-colors" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#fafafa] font-semibold mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#a1a1aa] hover:text-[#dc2626] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-[#fafafa] font-semibold mb-6">{t('location.hours.title')}</h4>
            <ul className="space-y-4">
              <li className="text-[#a1a1aa] text-sm">{t('location.hours.monWedFri')}</li>
              <li className="text-[#a1a1aa] text-sm">{t('location.hours.tueThu')}</li>
              <li className="text-[#a1a1aa] text-sm">{t('location.hours.saturday')}</li>
              <li className="text-[#a1a1aa] text-sm">{t('location.hours.sunday')}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[#fafafa] font-semibold mb-6">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#dc2626] mt-0.5 shrink-0" />
                <span className="text-[#a1a1aa]">{t('location.address')}<br />{t('location.city')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#dc2626] shrink-0" />
                <a href={`tel:${t('location.phone')}`} className="text-[#a1a1aa] hover:text-[#dc2626] transition-colors">
                  {t('location.phone')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#dc2626] shrink-0" />
                <a href={`mailto:${t('location.email')}`} className="text-[#a1a1aa] hover:text-[#dc2626] transition-colors">
                  {t('location.email')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[#71717a] text-sm">
              © {currentYear} NEWBODYLINE2. {t('footer.rights')}
            </p>
            <div className="flex items-center gap-6">
              <Link href="/courses" className="text-[#71717a] hover:text-[#dc2626] text-sm transition-colors">
                {t('nav.courses')}
              </Link>
              <Link href="/personal-training" className="text-[#71717a] hover:text-[#dc2626] text-sm transition-colors">
                {t('nav.personalTraining')}
              </Link>
              <Link href="/location" className="text-[#71717a] hover:text-[#dc2626] text-sm transition-colors">
                {t('nav.location')}
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 text-[#71717a] hover:text-[#dc2626] text-sm transition-colors"
              >
                <Lock className="w-3 h-3" />
                {t('footer.staff')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}