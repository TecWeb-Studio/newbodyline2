'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@/app/i18n/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Trash2, 
  RefreshCw, 
  LogOut, 
  Users,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Settings
} from 'lucide-react'
import { useBooking } from '@/app/contexts/BookingContext'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { bookings, cancelBooking, trainers, refreshBookings } = useBooking()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sessionFilter, setSessionFilter] = useState<'upcoming' | 'all'>('upcoming')

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (auth !== 'true') {
      router.push('/admin' as any)
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    router.push('/admin' as any)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(bookingId)
      await refreshBookings()
    }
  }

  const handleRefresh = useCallback(async () => {
    await refreshBookings()
    setRefreshKey(prev => prev + 1)
  }, [refreshBookings])

  // Calculate stats
  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === today)
  const upcomingBookings = bookings.filter(b => b.date >= today)

  const displayedBookings = bookings
    .filter(b => sessionFilter === 'all' || b.date >= today)
    .sort((a, b) => {
      const dtA = `${a.date} ${a.time}`
      const dtB = `${b.date} ${b.time}`
      return dtA.localeCompare(dtB)
    })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#27272a] border-t-[#dc2626] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-[#27272a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#fafafa]">Admin Dashboard</h1>
                <p className="text-xs text-[#71717a]">NEWBODYLINE2</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dashboard/trainers' as any)}
                className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors text-[#fafafa] text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Manage Trainers
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-[#a1a1aa]" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#dc2626] rounded-lg transition-colors text-[#fafafa] text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-[#27272a] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#71717a] text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-[#fafafa]">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#dc2626]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#dc2626]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] border border-[#27272a] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#71717a] text-sm mb-1">Today's Bookings</p>
                <p className="text-3xl font-bold text-[#fafafa]">{todayBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111111] border border-[#27272a] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#71717a] text-sm mb-1">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-[#fafafa]">{upcomingBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111111] border border-[#27272a] rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-[#27272a] flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#fafafa]">
                {sessionFilter === 'upcoming' ? 'Today & Upcoming Sessions' : 'All Sessions'}
              </h2>
              <p className="text-[#71717a] text-sm mt-1">Manage personal training sessions</p>
            </div>
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value as 'upcoming' | 'all')}
              className="bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none cursor-pointer"
            >
              <option value="upcoming">Today &amp; Upcoming</option>
              <option value="all">All Sessions (incl. past)</option>
            </select>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-[#3f3f46] mx-auto mb-4" />
              <p className="text-[#a1a1aa]">
                {sessionFilter === 'upcoming' ? 'No upcoming sessions' : 'No bookings found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a]">
                  <tr>
                    <th className="text-left px-6 py-4 text-[#71717a] text-sm font-medium">Client</th>
                    <th className="text-left px-6 py-4 text-[#71717a] text-sm font-medium">Trainer</th>
                    <th className="text-left px-6 py-4 text-[#71717a] text-sm font-medium">Date & Time</th>
                    <th className="text-left px-6 py-4 text-[#71717a] text-sm font-medium">Contact</th>
                    <th className="text-left px-6 py-4 text-[#71717a] text-sm font-medium">Booked</th>
                    <th className="text-right px-6 py-4 text-[#71717a] text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {displayedBookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#0a0a0a]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#71717a]" />
                          </div>
                          <span className="text-[#fafafa] font-medium">{booking.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                          <span className="text-[#a1a1aa]">{booking.trainerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#fafafa]">
                            <Calendar className="w-4 h-4 text-[#dc2626]" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-2 text-[#a1a1aa] text-sm">
                            <Clock className="w-4 h-4" />
                            {booking.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-[#a1a1aa]">
                            <Mail className="w-4 h-4" />
                            {booking.clientEmail}
                          </div>
                          <div className="flex items-center gap-2 text-[#71717a]">
                            <Phone className="w-4 h-4" />
                            {booking.clientPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#71717a] text-sm">
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                          title="Cancel booking"
                        >
                          <Trash2 className="w-5 h-5 text-[#71717a] group-hover:text-red-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Trainers Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-[#111111] border border-[#27272a] rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-[#fafafa] mb-4">Trainer Bookings Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trainers.map((trainer) => {
              const trainerBookings = bookings.filter(b => b.trainerId === trainer.id)
              return (
                <div key={trainer.id} className="bg-[#0a0a0a] rounded-xl p-4">
                  <p className="text-[#fafafa] font-medium mb-1">{trainer.name}</p>
                  <p className="text-2xl font-bold text-[#dc2626]">{trainerBookings.length}</p>
                  <p className="text-[#71717a] text-xs">bookings</p>
                </div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}