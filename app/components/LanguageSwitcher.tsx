'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useI18n, type Locale } from '@/app/contexts/I18nContext'
import { Globe } from 'lucide-react'

const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  return (
    <div className="fixed right-4 bottom-6 z-50" ref={ref}>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111111] border border-[#27272a] text-sm text-[#fafafa] shadow-md hover:border-[#dc2626]/50 transition-colors"
          aria-label="Change language"
          aria-expanded={open}
        >
          <Globe className="w-4 h-4 text-[#dc2626]" />
          <span>{current.flag}</span>
          <span>{locale.toUpperCase()}</span>
        </button>

        {open && (
          <div className="absolute bottom-full mb-2 right-0 w-48 bg-[#0a0a0a] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-2">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    locale === l.code
                      ? 'text-[#dc2626] bg-[#dc2626]/10'
                      : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.name}</span>
                  {locale === l.code && (
                    <span className="ml-auto text-[#dc2626]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
