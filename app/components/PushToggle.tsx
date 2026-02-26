'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

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

export default function PushToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    setIsSupported(supported)

    if (!supported) {
      setIsLoading(false)
      return
    }

    // Check current subscription state
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
        setIsLoading(false)
      })
    })
  }, [])

  const subscribe = async () => {
    setIsLoading(true)
    try {
      // Register admin service worker (replaces generic one on this scope)
      const reg = await navigator.serviceWorker.register('/admin-sw.js')
      await navigator.serviceWorker.ready

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Send subscription to server
      await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('[Push] subscribe error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        await fetch('/api/admin/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('[Push] unsubscribe error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) return null

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isSubscribed
          ? 'bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 hover:bg-[#dc2626]/30'
          : 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46] hover:text-[#fafafa] hover:border-[#dc2626]/30'
      } disabled:opacity-50`}
      title={isSubscribed ? 'Disattiva notifiche' : 'Attiva notifiche nuove prenotazioni'}
    >
      {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {isLoading ? '...' : isSubscribed ? 'Notifiche attive' : 'Attiva notifiche'}
    </button>
  )
}
