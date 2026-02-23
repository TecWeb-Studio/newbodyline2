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
  Settings,
  Palmtree,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useBooking } from '@/app/contexts/BookingContext'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { bookings, cancelBooking, trainers, refreshBookings, approveBooking, rejectBooking } = useBooking()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sessionFilter, setSessionFilter] = useState<'pending' | 'total' | 'today' | 'upcoming' | 'all'>('pending')
  const [vacations, setVacations] = useState<{ id: number; trainer_id: string; start_date: string; end_date: string; note: string | null }[]>([])

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (auth !== 'true') {
      router.push('/admin' as any)
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
      // Fetch vacations
      fetch('/api/admin/vacations')
        .then(r => r.json())
        .then(d => setVacations(d.vacations ?? []))
        .catch(() => {})
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

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await approveBooking(bookingId)
      await refreshBookings()
    } catch (err) {
      console.error('Failed to approve booking:', err)
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to reject this booking request?')) {
      try {
        await rejectBooking(bookingId)
        await refreshBookings()
      } catch (err) {
        console.error('Failed to reject booking:', err)
      }
    }
  }

  const handleRefresh = useCallback(async () => {
    await refreshBookings()
    setRefreshKey(prev => prev + 1)
  }, [refreshBookings])

  // Calculate stats
  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'rejected')
  const upcomingBookings = bookings.filter(b => b.date >= today && b.status !== 'rejected')
  const pendingBookings = bookings.filter(b => b.status === 'pending')

  const displayedBookings = bookings
    .filter(b => {
      if (sessionFilter === 'pending') return b.status === 'pending'
      if (sessionFilter === 'today') return b.date === today && b.status !== 'rejected'
      if (sessionFilter === 'upcoming') return b.date >= today && b.status !== 'rejected'
      if (sessionFilter === 'total') return b.status !== 'rejected'
      return true // 'all'
    })
    .sort((a, b) => {
      // Pending first, then by date/time
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#111111] border rounded-2xl p-6 cursor-pointer transition-all ${sessionFilter === 'pending' ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : pendingBookings.length > 0 ? 'border-amber-500/30' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
            onClick={() => setSessionFilter('pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#71717a] text-sm mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-amber-400">{pendingBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`bg-[#111111] border rounded-2xl p-6 cursor-pointer transition-all ${sessionFilter === 'total' ? 'border-[#dc2626]/50 shadow-lg shadow-[#dc2626]/10' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
            onClick={() => setSessionFilter('total')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#71717a] text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-[#fafafa]">{bookings.filter(b => b.status !== 'rejected').length}</p>
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
            className={`bg-[#111111] border rounded-2xl p-6 cursor-pointer transition-all ${sessionFilter === 'today' ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
            onClick={() => setSessionFilter('today')}
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
            className={`bg-[#111111] border rounded-2xl p-6 cursor-pointer transition-all ${sessionFilter === 'upcoming' ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-[#27272a] hover:border-[#3f3f46]'}`}
            onClick={() => setSessionFilter('upcoming')}
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

        {/* Active / Upcoming Vacations */}
        {(() => {
          const todayISO = new Date().toISOString().split('T')[0]
          const activeOrUpcoming = vacations.filter(v => v.end_date >= todayISO)
          if (activeOrUpcoming.length === 0) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8 bg-orange-900/20 border border-orange-700/40 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Palmtree className="w-5 h-5 text-orange-400" />
                <h3 className="text-orange-300 font-semibold text-sm">Trainer Vacations</h3>
              </div>
              <div className="space-y-2">
                {activeOrUpcoming.map(v => {
                  const trainer = trainers.find(t => t.id === v.trainer_id)
                  const isActive = todayISO >= v.start_date && todayISO <= v.end_date
                  return (
                    <div key={v.id} className="flex items-center gap-3 text-sm">
                      {isActive ? (
                        <span className="text-[10px] bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full font-semibold uppercase w-16 text-center">Active</span>
                      ) : (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold uppercase w-16 text-center">Upcoming</span>
                      )}
                      <span className="text-[#fafafa] font-medium">{trainer?.name ?? v.trainer_id}</span>
                      <span className="text-[#71717a]">
                        {new Date(v.start_date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {new Date(v.end_date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </span>
                      {v.note && <span className="text-[#52525b] italic">{v.note}</span>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })()}

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
                {{
                  pending: 'Pending Requests',
                  total: 'Total Bookings',
                  today: "Today's Bookings",
                  upcoming: 'Upcoming Sessions',
                  all: 'All Sessions',
                }[sessionFilter]}
              </h2>
              <p className="text-[#71717a] text-sm mt-1">Manage personal training sessions</p>
            </div>
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value as 'pending' | 'total' | 'today' | 'upcoming' | 'all')}
              className="bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none cursor-pointer"
            >
              <option value="pending">Pending Requests ({pendingBookings.length})</option>
              <option value="total">Total Bookings</option>
              <option value="today">Today&apos;s Bookings</option>
              <option value="upcoming">Upcoming Sessions</option>
              <option value="all">All Sessions (incl. past &amp; rejected)</option>
            </select>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-[#3f3f46] mx-auto mb-4" />
              <p className="text-[#a1a1aa]">
                {{
                  pending: 'No pending requests',
                  total: 'No bookings found',
                  today: 'No bookings for today',
                  upcoming: 'No upcoming sessions',
                  all: 'No bookings found',
                }[sessionFilter]}
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
                    <th className="text-left px-6 py-4 text-[#71717a] text-sm font-medium">Status</th>
                    <th className="text-right px-6 py-4 text-[#71717a] text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {displayedBookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors ${booking.status === 'pending' ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-[#0a0a0a]/50'}`}
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
                        {booking.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {booking.status === 'confirmed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Confirmed
                          </span>
                        )}
                        {booking.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveBooking(booking.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium"
                                title="Approve request"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
                                title="Reject request"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                              title="Cancel booking"
                            >
                              <Trash2 className="w-5 h-5 text-[#71717a] group-hover:text-red-500" />
                            </button>
                          )}
                        </div>
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