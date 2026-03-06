'use client'

import { useState, useEffect } from 'react'
import { X, Share, PlusSquare } from 'lucide-react'

/**
 * On iOS (Safari), Web Push notifications only work when the site is installed
 * as a PWA via "Add to Home Screen". This banner guides the admin user through
 * that one-time step.
 *
 * It is shown only when ALL of the following are true:
 *  - Running on iOS Safari (not standalone / already installed)
 *  - 'PushManager' is NOT available (proxy for "not installed as PWA yet")
 *  - The user hasn't dismissed the banner this session
 */
export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream

    // `standalone` is true when running as an installed PWA on iOS
    const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    const dismissed = sessionStorage.getItem('ios-install-dismissed') === '1'

    if (isIOS && !isStandalone && !dismissed) {
      // Use setTimeout to avoid setting state synchronously inside the effect
      const t = setTimeout(() => setShow(true), 0)
      return () => clearTimeout(t)
    }
  }, [])

  if (!show) return null

  const handleDismiss = () => {
    sessionStorage.setItem('ios-install-dismissed', '1')
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="bg-[#18181b] border border-[#dc2626]/40 rounded-2xl shadow-2xl p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-[#fafafa] text-sm font-semibold mb-1">
              Attiva le notifiche su iPhone
            </p>
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Su iOS le notifiche push funzionano solo dall&apos;app installata.
            </p>
            <ol className="text-[#a1a1aa] text-xs mt-2 space-y-1">
              <li className="flex items-center gap-1.5">
                <span className="text-[#dc2626] font-bold">1.</span>
                Tocca{' '}
                <Share className="inline w-3.5 h-3.5 text-[#60a5fa]" />{' '}
                <span className="text-[#fafafa]">&quot;Condividi&quot;</span> in basso
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#dc2626] font-bold">2.</span>
                Scegli{' '}
                <PlusSquare className="inline w-3.5 h-3.5 text-[#60a5fa]" />{' '}
                <span className="text-[#fafafa]">&quot;Aggiungi a Home&quot;</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#dc2626] font-bold">3.</span>
                Riapri l&apos;app e attiva le notifiche
              </li>
            </ol>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#71717a] hover:text-[#fafafa] transition-colors shrink-0 mt-0.5"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
