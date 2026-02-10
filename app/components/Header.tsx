'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/app/i18n/navigation'
import { routing, localeNames } from '@/app/i18n/routing'
import { Menu, X, Globe, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.language-switcher')) {
        setIsLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) {
      setIsLangMenuOpen(false)
      return
    }
    
    setIsChanging(true)
    setIsLangMenuOpen(false)
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      router.push(pathname, { locale: newLocale })
      setIsChanging(false)
    }, 300)
  }

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/courses', label: t('courses') },
    { href: '/personal-training', label: t('personalTraining') },
    { href: '/location', label: t('location') },
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
            className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
              {/* Language Switcher - Improved */}
              <div className="relative language-switcher">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg border ${
                    isLangMenuOpen 
                      ? 'bg-[#dc2626]/10 border-[#dc2626] text-[#dc2626]' 
                      : 'text-[#a1a1aa] hover:text-[#fafafa] border-[#27272a] hover:border-[#3f3f46]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="uppercase font-semibold tracking-wider">{locale}</span>
                  <motion.svg 
                    animate={{ rotate: isLangMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-[#111111] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-2">
                        {routing.locales.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => handleLocaleChange(loc)}
                            className={`w-full px-4 py-3 text-left text-sm rounded-lg transition-all duration-200 flex items-center justify-between group ${
                              locale === loc
                                ? 'text-[#dc2626] bg-[#dc2626]/10'
                                : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                locale === loc ? 'bg-[#dc2626] text-white' : 'bg-[#27272a] text-[#71717a]'
                              }`}>
                                {loc.toUpperCase()}
                              </span>
                              <span className="font-medium">{localeNames[loc]}</span>
                            </span>
                            {locale === loc && (
                              <Check className="w-4 h-4 text-[#dc2626]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="btn-primary">
                {t('joinNow')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#fafafa] hover:text-[#dc2626] transition-colors"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
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
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-[#27272a] overflow-hidden"
              >
                <nav className="flex flex-col py-4 gap-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
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
                  
                  {/* Mobile Language Switcher - Improved */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="px-4 py-4 border-t border-[#27272a] mt-2"
                  >
                    <p className="text-xs text-[#71717a] mb-3 uppercase tracking-wider font-semibold">{t('selectLanguage')}</p>
                    <div className="flex gap-2">
                      {routing.locales.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => handleLocaleChange(loc)}
                          className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                            locale === loc
                              ? 'bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/25'
                              : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                          }`}
                        >
                          <span className="uppercase font-bold">{loc}</span>
                          <span className="text-xs opacity-70">{localeNames[loc]}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>

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