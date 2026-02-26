export const metadata = {
  title: 'NBL2 Admin',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <head>
        <link rel="manifest" href="/admin-manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NBL2 Admin" />
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
      </head>
      {children}
    </>
  )
}