'use client'

import React, { useState } from 'react'
import { useI18n } from '@/app/contexts/I18nContext'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)

  const locales: { code: string; name: string }[] = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
  ]

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-2 rounded-lg bg-[#111111] border border-[#27272a] text-sm text-[#fafafa] shadow-md"
        >
          {locale.toUpperCase()}
        </button>

        {open && (
          <div className="mt-2 w-44 bg-[#0a0a0a] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2">
              {locales.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code as any)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${locale === l.code ? 'text-[#dc2626]' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
