import type { Metadata } from 'next'
import IOSInstallPrompt from '@/app/components/IOSInstallPrompt'

export const metadata: Metadata = {
  title: 'NBL2 Admin',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NBL2 Admin',
  },
  icons: {
    apple: '/images/logo.jpg',
  },
  other: {
    'theme-color': '#dc2626',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <IOSInstallPrompt />
    </>
  )
}