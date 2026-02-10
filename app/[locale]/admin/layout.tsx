import { BookingProvider } from '../../contexts/BookingContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BookingProvider>
      {children}
    </BookingProvider>
  )
}