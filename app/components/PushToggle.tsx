'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Smartphone } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

type State = 'loading' | 'unsupported' | 'ios-not-installed' | 'subscribed' | 'unsubscribed'

export default function PushToggle() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream
    const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isIOS && !isStandalone) {
      setState('ios-not-installed')
      return
    }

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    if (!supported) {
      setState('unsupported')
      return
    }

    navigator.serviceWorker
      .register('/admin-sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'subscribed' : 'unsubscribed'))
      .catch(() => setState('unsupported'))
  }, [])

  const subscribe = async () => {
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.register('/admin-sw.js')
      await new Promise<void>((resolve) => {
        if (reg.active) { resolve(); return }
        const sw = reg.installing || reg.waiting
        if (sw) {
          sw.addEventListener('statechange', function handler() {
            if ((sw as ServiceWorker).state === 'activated') {
              sw.removeEventListener('statechange', handler)
              resolve()
            }
          })
        } else { resolve() }
      })
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })
      setState('subscribed')
    } catch (err) {
      console.error('[Push] subscribe error:', err)
      setState('unsubscribed')
    }
  }

  const unsubscribe = async () => {
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.register('/admin-sw.js')
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        await fetch('/api/admin/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }
      setState('unsubscribed')
    } catch (err) {
      console.error('[Push] unsubscribe error:', err)
      setState('subscribed')
    }
  }

  if (state === 'unsupported') return null

  if (state === 'ios-not-installed') {
    return (
      <div className="group relative">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 cursor-default">
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Installa app per notifiche</span>
          <span className="sm:hidden">Installa notifiche</span>
        </div>
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#18181b] border border-amber-500/30 rounded-xl p-3 shadow-xl z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs text-[#a1a1aa] leading-relaxed">
          <p className="text-amber-400 font-semibold mb-1">Push su iPhone</p>
          Tocca <strong className="text-[#fafafa]">Condividi</strong> &rarr; <strong className="text-[#fafafa]">Aggiungi a Home</strong>, poi riapri l&apos;app e attiva le notifiche.
        </div>
      </div>
    )
  }

  const isLoading = state === 'loading'
  const isSubscribed = state === 'subscribed'

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isSubscribed
          ? 'bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 hover:bg-[#dc2626]/30'
          : 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46] hover:text-[#fafafa] hover:border-[#dc2626]/30'
      } disabled:opacity-50`}
      title={isSubscribed ? 'Disattiva notifiche' : 'Attiva notifiche nuove prenotazioni'}
    >
      {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      <span className="hidden sm:inline">
        {isLoading ? '...' : isSubscribed ? 'Notifiche attive' : 'Attiva notifiche'}
      </span>
    </button>
  )
}
