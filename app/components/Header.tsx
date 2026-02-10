 'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link, usePathname, useRouter } from '@/app/i18n/navigation'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/app/contexts/I18nContext'

// Throttle function for scroll events
const throttle = (func: Function, delay: number) => {
  let lastCall = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

export default function Header() {
  const { t, locale } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReducedMotion(prefersReducedMotion)

    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 20)
    }, 150)
    
    window.addEventListener('scroll', handleScroll as EventListener)
    return () => window.removeEventListener('scroll', handleScroll as EventListener)
  }, [])

  // language switching handled by floating LanguageSwitcher

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/courses', label: t('nav.courses') },
    { href: '/personal-training', label: t('nav.personalTraining') },
    { href: '/location', label: t('nav.location') },
  ]

  return (
    <>
      {/* Language Change Overlay */}
      <AnimatePresence>
        {isChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reducedMotion ? {} : { scale: 0.9, opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-[#27272a] border-t-[#dc2626] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#a1a1aa]">{t('changingLanguage')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#27272a] shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                NEWBODYLINE<span className="text-[#dc2626]">2</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 relative group ${
                    pathname === link.href
                      ? 'text-[#dc2626]'
                      : 'text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#dc2626] transition-all duration-300 ${
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Right side: Language + CTA */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language switcher moved to floating LanguageSwitcher component */}

              <button className="btn-primary">
                {t('nav.joinNow')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#fafafa] hover:text-[#dc2626] transition-colors"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
                className="md:hidden border-t border-[#27272a] overflow-hidden"
              >
                <nav className="flex flex-col py-4 gap-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          pathname === link.href
                            ? 'text-[#dc2626] bg-[#dc2626]/10'
                            : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pathname === link.href ? 'bg-[#dc2626]' : 'bg-[#3f3f46]'}`} />
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="px-4 pt-2"
                  >
                    <button className="btn-primary w-full justify-center py-4">
                      {t('joinNow')}
                    </button>
                  </motion.div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  )
}