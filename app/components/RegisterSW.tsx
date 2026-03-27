'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function RegisterSW() {
  const pathname = usePathname()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Use admin-sw.js for admin pages, regular sw.js otherwise
      const swPath = pathname?.includes('/admin') ? '/admin-sw.js' : '/sw.js'
      
      navigator.serviceWorker.register(swPath).catch(() => {
        // SW registration failed – non-critical
      })
    }
  }, [pathname])

  return null
}
