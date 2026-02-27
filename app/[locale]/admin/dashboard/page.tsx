'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '@/app/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Search,
  Download,
  Plus,
  X,
  Dumbbell,
  Filter,
  Loader2,
  UserPlus,
} from 'lucide-react'
import { useBooking, type TimeSlot } from '@/app/contexts/BookingContext'
import PushToggle from '@/app/components/PushToggle'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { bookings, cancelBooking, trainers, refreshBookings, approveBooking, rejectBooking, getAvailableSlotsForTrainer } = useBooking()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sessionFilter, setSessionFilter] = useState<'pending' | 'total' | 'today' | 'upcoming' | 'all'>('pending')
  const [trainerFilter, setTrainerFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [vacations, setVacations] = useState<{ id: number; trainer_id: string; start_date: string; end_date: string; note: string | null }[]>([])

  // Manual booking modal
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [mbTrainer, setMbTrainer] = useState('')
  const [mbDate, setMbDate] = useState('')
  const [mbSlots, setMbSlots] = useState<TimeSlot[]>([])
  const [mbSlotsLoading, setMbSlotsLoading] = useState(false)
  const [mbSelectedSlot, setMbSelectedSlot] = useState('')
  const [mbClientName, setMbClientName] = useState('')
  const [mbClientEmail, setMbClientEmail] = useState('')
  const [mbClientPhone, setMbClientPhone] = useState('')
  const [mbError, setMbError] = useState('')
  const [mbSubmitting, setMbSubmitting] = useState(false)
  const [mbOnVacation, setMbOnVacation] = useState(false)

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

  // ── Manual booking: load slots when trainer+date change ──
  useEffect(() => {
    if (!mbTrainer || !mbDate) {
      setMbSlots([])
      setMbSelectedSlot('')
      setMbOnVacation(false)
      return
    }
    let cancelled = false
    setMbSlotsLoading(true)
    getAvailableSlotsForTrainer(mbTrainer, mbDate).then(({ slots, onVacation }) => {
      if (!cancelled) {
        setMbSlots(slots)
        setMbOnVacation(onVacation)
        setMbSelectedSlot(slots.length > 0 ? slots[0].time : '')
        setMbSlotsLoading(false)
      }
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mbTrainer, mbDate])

  const resetBookingModal = () => {
    setMbTrainer('')
    setMbDate('')
    setMbSlots([])
    setMbSelectedSlot('')
    setMbClientName('')
    setMbClientEmail('')
    setMbClientPhone('')
    setMbError('')
    setMbSubmitting(false)
    setMbOnVacation(false)
  }

  const handleCreateManualBooking = async () => {
    setMbError('')
    if (!mbTrainer || !mbDate || !mbSelectedSlot || !mbClientName || !mbClientEmail || !mbClientPhone) {
      setMbError('All fields are required')
      return
    }
    setMbSubmitting(true)
    try {
      const trainerData = trainers.find(t => t.id === mbTrainer)
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: mbTrainer,
          trainerName: trainerData?.name ?? mbTrainer,
          date: mbDate,
          time: mbSelectedSlot,
          clientName: mbClientName,
          clientEmail: mbClientEmail,
          clientPhone: mbClientPhone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create booking')
      await refreshBookings()
      setShowBookingModal(false)
      resetBookingModal()
    } catch (err) {
      setMbError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setMbSubmitting(false)
    }
  }

  // ── CSV export ──
  const exportCSV = () => {
    const rows = [
      ['Client', 'Email', 'Phone', 'Trainer', 'Date', 'Time', 'Status', 'Booked At'],
      ...displayedBookings.map(b => [
        b.clientName, b.clientEmail, b.clientPhone, b.trainerName,
        b.date, b.time, b.status, b.bookedAt,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate stats
  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'rejected')
  const upcomingBookings = bookings.filter(b => b.date >= today && b.status !== 'rejected')
  const pendingBookings = bookings.filter(b => b.status === 'pending')

  const displayedBookings = bookings
    .filter(b => {
      // Session filter
      if (sessionFilter === 'pending' && b.status !== 'pending') return false
      if (sessionFilter === 'today' && (b.date !== today || b.status === 'rejected')) return false
      if (sessionFilter === 'upcoming' && (b.date < today || b.status === 'rejected')) return false
      if (sessionFilter === 'total' && b.status === 'rejected') return false
      // Trainer filter
      if (trainerFilter !== 'all' && b.trainerId !== trainerFilter) return false
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesSearch = 
          b.clientName.toLowerCase().includes(q) ||
          b.clientEmail.toLowerCase().includes(q) ||
          b.clientPhone.toLowerCase().includes(q) ||
          b.trainerName.toLowerCase().includes(q) ||
          b.date.includes(q)
        if (!matchesSearch) return false
      }
      return true
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
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <PushToggle />
              <button
                onClick={() => { resetBookingModal(); setShowBookingModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg transition-colors text-white text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">New Booking</span>
              </button>
              <button
                onClick={() => router.push('/admin/dashboard/trainers' as any)}
                className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors text-[#fafafa] text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Trainers</span>
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
                <span className="hidden sm:inline">Logout</span>
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
          <div className="p-6 border-b border-[#27272a] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
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
                <p className="text-[#71717a] text-sm mt-1">
                  {displayedBookings.length} result{displayedBookings.length !== 1 ? 's' : ''}
                  {trainerFilter !== 'all' && ` · ${trainers.find(t => t.id === trainerFilter)?.name}`}
                  {searchQuery && ` · "${searchQuery}"`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors text-[#a1a1aa] text-sm"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
            {/* Filters row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-50 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  placeholder="Search client, email, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-sm text-[#fafafa] placeholder-[#52525b] focus:border-[#dc2626] focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#fafafa]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                value={sessionFilter}
                onChange={e => setSessionFilter(e.target.value as 'pending' | 'total' | 'today' | 'upcoming' | 'all')}
                className="bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none cursor-pointer"
              >
                <option value="pending">Pending ({pendingBookings.length})</option>
                <option value="total">Total Bookings</option>
                <option value="today">Today&apos;s Bookings</option>
                <option value="upcoming">Upcoming</option>
                <option value="all">All (incl. rejected)</option>
              </select>
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#71717a]" />
                <select
                  value={trainerFilter}
                  onChange={e => setTrainerFilter(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Trainers</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trainers.map((trainer) => {
              const trainerBookings = bookings.filter(b => b.trainerId === trainer.id && b.status !== 'rejected')
              const confirmedCount = trainerBookings.filter(b => b.status === 'confirmed').length
              const pendingCount = trainerBookings.filter(b => b.status === 'pending').length
              return (
                <div key={trainer.id} className="bg-[#0a0a0a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-[#dc2626]" />
                    </div>
                    <p className="text-[#fafafa] font-medium text-sm">{trainer.name}</p>
                  </div>
                  <p className="text-2xl font-bold text-[#dc2626]">{trainerBookings.length}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[#71717a] text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />{confirmedCount}
                    </span>
                    {pendingCount > 0 && (
                      <span className="text-[#71717a] text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />{pendingCount}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick insights */}
        {(() => {
          const activeBookings = bookings.filter(b => b.status !== 'rejected')
          if (activeBookings.length === 0) return null
          // Most popular trainer
          const trainerCounts = trainers.map(t => ({
            name: t.name,
            count: activeBookings.filter(b => b.trainerId === t.id).length,
          })).sort((a, b) => b.count - a.count)
          const topTrainer = trainerCounts[0]
          // Busiest day
          const dayCounts: Record<string, number> = {}
          activeBookings.forEach(b => { dayCounts[b.date] = (dayCounts[b.date] || 0) + 1 })
          const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]
          // Today's revenue estimate (sessions count)
          const todayCount = todayBookings.length
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-[#111111] border border-[#27272a] rounded-2xl p-5">
                <p className="text-[#71717a] text-xs font-medium uppercase tracking-wider mb-1">Most Popular Trainer</p>
                <p className="text-[#fafafa] text-lg font-bold">{topTrainer?.name ?? '-'}</p>
                <p className="text-[#52525b] text-xs">{topTrainer?.count ?? 0} bookings</p>
              </div>
              <div className="bg-[#111111] border border-[#27272a] rounded-2xl p-5">
                <p className="text-[#71717a] text-xs font-medium uppercase tracking-wider mb-1">Busiest Day</p>
                <p className="text-[#fafafa] text-lg font-bold">
                  {busiestDay ? new Date(busiestDay[0] + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : '-'}
                </p>
                <p className="text-[#52525b] text-xs">{busiestDay?.[1] ?? 0} sessions</p>
              </div>
              <div className="bg-[#111111] border border-[#27272a] rounded-2xl p-5">
                <p className="text-[#71717a] text-xs font-medium uppercase tracking-wider mb-1">Today&apos;s Sessions</p>
                <p className="text-[#fafafa] text-lg font-bold">{todayCount}</p>
                <p className="text-[#52525b] text-xs">across {new Set(todayBookings.map(b => b.trainerId)).size} trainers</p>
              </div>
            </motion.div>
          )
        })()}
      </main>

      {/* ── Manual Booking Modal ── */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111111] border border-[#27272a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#fafafa]">Create Booking</h2>
                  <p className="text-[#71717a] text-sm mt-0.5">Book on behalf of a client</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#a1a1aa]" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Trainer selection */}
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1.5">Trainer</label>
                  <select
                    value={mbTrainer}
                    onChange={e => setMbTrainer(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none"
                  >
                    <option value="">Select trainer...</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} – {t.specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Date selection */}
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={mbDate}
                    min={today}
                    onChange={e => setMbDate(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none scheme-dark"
                  />
                </div>

                {/* Time slot selection */}
                {mbTrainer && mbDate && (
                  <div>
                    <label className="block text-sm text-[#a1a1aa] mb-1.5">Available Slot</label>
                    {mbSlotsLoading ? (
                      <div className="flex items-center gap-2 py-3 text-[#71717a] text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading slots...
                      </div>
                    ) : mbOnVacation ? (
                      <div className="flex items-center gap-2 py-3 text-orange-400 text-sm">
                        <Palmtree className="w-4 h-4" /> Trainer is on vacation on this date
                      </div>
                    ) : mbSlots.length === 0 ? (
                      <p className="text-[#71717a] text-sm py-3">No available slots for this date</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {mbSlots.map(slot => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setMbSelectedSlot(slot.time)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                              mbSelectedSlot === slot.time
                                ? 'bg-[#dc2626] border-[#dc2626] text-white'
                                : 'bg-[#0a0a0a] border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626]/50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Client details */}
                <div className="border-t border-[#27272a] pt-5 space-y-4">
                  <p className="text-sm font-medium text-[#a1a1aa] flex items-center gap-2">
                    <User className="w-4 h-4" /> Client Details
                  </p>
                  <div>
                    <label className="block text-xs text-[#71717a] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={mbClientName}
                      onChange={e => setMbClientName(e.target.value)}
                      placeholder="e.g. Mario Rossi"
                      className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] focus:border-[#dc2626] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717a] mb-1">Email</label>
                    <input
                      type="email"
                      value={mbClientEmail}
                      onChange={e => setMbClientEmail(e.target.value)}
                      placeholder="client@email.com"
                      className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] focus:border-[#dc2626] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#71717a] mb-1">Phone</label>
                    <input
                      type="tel"
                      value={mbClientPhone}
                      onChange={e => setMbClientPhone(e.target.value)}
                      placeholder="+39 333 1234567"
                      className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] focus:border-[#dc2626] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Error */}
                {mbError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {mbError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleCreateManualBooking}
                  disabled={mbSubmitting || !mbTrainer || !mbDate || !mbSelectedSlot || !mbClientName || !mbClientEmail || !mbClientPhone}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {mbSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Confirmed Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}