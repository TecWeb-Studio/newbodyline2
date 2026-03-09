'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, Share, PlusSquare, Bell, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'ios-install-dismissed-at'
const DISMISS_DAYS = 7 // Re-show after 7 days

function isDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
  return daysSince < DISMISS_DAYS
}

function isIOSDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  )
}

function isStandaloneMode(): boolean {
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  return false
}

/**
 * On iOS Safari, Web Push only works when installed as PWA via "Add to Home Screen".
 *
 * Two modes:
 * - Admin pages: full-screen onboarding overlay (first visit / after 7 days)
 * - Other pages: compact bottom banner
 *
 * Persists dismissal in localStorage so it re-shows after DISMISS_DAYS.
 */
export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const isAdminPage = pathname?.includes('/admin') ?? false

  useEffect(() => {
    if (!isIOSDevice() || isStandaloneMode() || isDismissedRecently()) return
    const t = setTimeout(() => setShow(true), 300)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  // ── Full-screen admin onboarding ──────────────────────────────────────────
  if (isAdminPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="bg-[#18181b] border border-[#dc2626]/40 rounded-3xl shadow-2xl p-6 max-w-sm w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[#fafafa] font-bold text-base">Installa NBL2 Admin</p>
                <p className="text-[#71717a] text-xs">Per ricevere le notifiche</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-[#71717a] hover:text-[#fafafa] transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Why */}
          <div className="bg-[#27272a]/50 rounded-xl p-3 mb-5">
            <p className="text-[#a1a1aa] text-xs leading-relaxed">
              Su iPhone le notifiche push funzionano <strong className="text-[#fafafa]">solo dall&apos;app installata</strong>.
              Segui questi 3 passaggi per non perdere nessuna prenotazione.
            </p>
          </div>

          {/* Steps */}
          <ol className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#dc2626] text-white flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <div>
                <p className="text-[#fafafa] text-sm font-medium">Tocca Condividi</p>
                <p className="text-[#71717a] text-xs mt-0.5 flex items-center gap-1">
                  L&apos;icona <Share className="inline w-3.5 h-3.5 text-[#60a5fa]" /> in basso nello schermo
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#dc2626] text-white flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <div>
                <p className="text-[#fafafa] text-sm font-medium">Aggiungi a Home</p>
                <p className="text-[#71717a] text-xs mt-0.5 flex items-center gap-1">
                  Scorri e tocca <PlusSquare className="inline w-3.5 h-3.5 text-[#60a5fa]" /> &quot;Aggiungi alla schermata Home&quot;
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#dc2626] text-white flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <div>
                <p className="text-[#fafafa] text-sm font-medium">Apri e attiva notifiche</p>
                <p className="text-[#71717a] text-xs mt-0.5 flex items-center gap-1">
                  Riapri dall&apos;icona <Smartphone className="inline w-3.5 h-3.5 text-[#60a5fa]" /> e premi &quot;Attiva notifiche&quot;
                </p>
              </div>
            </li>
          </ol>

          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold text-sm transition-colors"
          >
            Ho capito
          </button>
        </div>
      </div>
    )
  }

  // ── Compact banner for non-admin pages ────────────────────────────────────
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
