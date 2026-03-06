'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // On admin pages the admin-sw.js is registered instead (via PushToggle).
      // Registering the generic sw.js here would take over the same scope and
      // kill the push handler → skip it on /admin paths.
      if (window.location.pathname.includes('/admin')) return

      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed – non-critical
      })
    }
  }, [])

  return null
}
