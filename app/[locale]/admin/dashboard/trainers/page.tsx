'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Clock,
  Plus,
  Trash2,
  Palmtree,
  CalendarDays,
  Save,
  User,
} from 'lucide-react'
import { useBooking } from '@/app/contexts/BookingContext'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ALL_TIMES = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30',
  '19:00','19:30','20:00','20:30','21:00',
]

interface ScheduleRow {
  id: number
  trainer_id: string
  weekday: number
  time: string
}

interface VacationRow {
  id: number
  trainer_id: string
  start_date: string
  end_date: string
  note: string | null
}

export default function AdminTrainersPage() {
  const router = useRouter()
  const { trainers } = useBooking()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // ── selected trainer ───────────────────────────────────────────────────────
  const [selectedTrainer, setSelectedTrainer] = useState(() =>
    typeof window !== 'undefined' && trainers.length > 0 ? trainers[0].id : ''
  )

  // ── schedules ──────────────────────────────────────────────────────────────
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [addingSlot, setAddingSlot] = useState<{ weekday: number; time: string } | null>(null)

  // ── vacations ──────────────────────────────────────────────────────────────
  const [vacations, setVacations] = useState<VacationRow[]>([])
  const [newVacation, setNewVacation] = useState({ startDate: '', endDate: '', note: '' })

  // ── tab ────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<'schedule' | 'vacation'>('schedule')

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (auth !== 'true') {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)
    // Fetch data immediately
    const loadData = async () => {
      try {
        const [schedulesRes, vacationsRes] = await Promise.all([
          fetch('/api/admin/schedules'),
          fetch('/api/admin/vacations'),
        ])
        const schedulesData = await schedulesRes.json()
        const vacationsData = await vacationsRes.json()
        setSchedules(schedulesData.schedules ?? [])
        setVacations(vacationsData.vacations ?? [])
      } catch { /* ignore */ }
    }
    loadData()
  }, [router])

  // ── Fetch helpers (for refresh after mutations) ────────────────────────────
  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/schedules')
      const data = await res.json()
      setSchedules(data.schedules ?? [])
    } catch { /* ignore */ }
  }, [])

  const fetchVacations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/vacations')
      const data = await res.json()
      setVacations(data.vacations ?? [])
    } catch { /* ignore */ }
  }, [])

  // Auto-select first trainer when trainers load
  useEffect(() => {
    if (trainers.length > 0 && !selectedTrainer) {
      setSelectedTrainer(trainers[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainers])

  // ── Filtered data for selected trainer ─────────────────────────────────────
  const trainerSchedules = schedules.filter(s => s.trainer_id === selectedTrainer)
  const trainerVacations = vacations.filter(v => v.trainer_id === selectedTrainer)

  // Group schedule by weekday
  const scheduleByDay: Record<number, string[]> = {}
  for (let d = 0; d < 7; d++) scheduleByDay[d] = []
  trainerSchedules.forEach(s => {
    scheduleByDay[s.weekday]?.push(s.time)
  })

  // ── Actions ────────────────────────────────────────────────────────────────
  async function addScheduleSlot(weekday: number, time: string) {
    await fetch('/api/admin/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId: selectedTrainer, weekday, time }),
    })
    setAddingSlot(null)
    fetchSchedules()
  }

  async function removeScheduleSlot(weekday: number, time: string) {
    await fetch('/api/admin/schedules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId: selectedTrainer, weekday, time }),
    })
    fetchSchedules()
  }

  async function addVacation() {
    if (!newVacation.startDate || !newVacation.endDate) return
    await fetch('/api/admin/vacations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainerId: selectedTrainer,
        startDate: newVacation.startDate,
        endDate: newVacation.endDate,
        note: newVacation.note || null,
      }),
    })
    setNewVacation({ startDate: '', endDate: '', note: '' })
    fetchVacations()
  }

  async function removeVacation(id: number) {
    await fetch(`/api/admin/vacations?id=${id}`, { method: 'DELETE' })
    fetchVacations()
  }

  // ── Loading / guard ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#27272a] border-t-[#dc2626] rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return null

  const selectedTrainerData = trainers.find(t => t.id === selectedTrainer)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-[#27272a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#a1a1aa]" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-[#fafafa]">Trainer Management</h1>
                <p className="text-xs text-[#71717a]">Schedules & Vacations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trainer Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {trainers.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTrainer(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                selectedTrainer === t.id
                  ? 'bg-[#dc2626] border-[#dc2626] text-white'
                  : 'bg-[#111111] border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626]/50'
              }`}
            >
              <User className="w-4 h-4" />
              {t.name}
            </button>
          ))}
        </div>

        {selectedTrainerData && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab('schedule')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === 'schedule'
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-[#111111] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                }`}
              >
                <Clock className="w-4 h-4" />
                Weekly Schedule
              </button>
              <button
                onClick={() => setTab('vacation')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === 'vacation'
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-[#111111] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                }`}
              >
                <Palmtree className="w-4 h-4" />
                Vacations
              </button>
            </div>

            {/* ── SCHEDULE TAB ───────────────────────────────────────────── */}
            {tab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] border border-[#27272a] rounded-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-[#27272a]">
                  <h2 className="text-lg font-bold text-[#fafafa]">
                    {selectedTrainerData.name}&apos;s Weekly Schedule
                  </h2>
                  <p className="text-[#71717a] text-sm mt-1">
                    Click + to add time slots, click × to remove them
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-[#27272a]">
                  {WEEKDAYS.map((dayName, dayIdx) => (
                    <div key={dayIdx} className="p-4">
                      <h3 className="text-sm font-semibold text-[#fafafa] mb-3">{dayName}</h3>
                      <div className="space-y-1.5">
                        {(scheduleByDay[dayIdx] ?? []).sort().map(time => (
                          <div
                            key={time}
                            className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-3 py-1.5 group"
                          >
                            <span className="text-sm text-[#a1a1aa]">{time}</span>
                            <button
                              onClick={() => removeScheduleSlot(dayIdx, time)}
                              className="text-[#3f3f46] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add slot */}
                        {addingSlot?.weekday === dayIdx ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={addingSlot.time}
                              onChange={e => setAddingSlot({ ...addingSlot, time: e.target.value })}
                              className="flex-1 bg-[#0a0a0a] border border-[#27272a] rounded-lg px-2 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#dc2626]"
                            >
                              {ALL_TIMES.filter(t => !(scheduleByDay[dayIdx] ?? []).includes(t)).map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => addScheduleSlot(dayIdx, addingSlot.time)}
                              className="p-1.5 bg-[#dc2626] rounded-lg hover:bg-[#b91c1c] transition-colors"
                            >
                              <Save className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const available = ALL_TIMES.filter(t => !(scheduleByDay[dayIdx] ?? []).includes(t))
                              if (available.length > 0) {
                                setAddingSlot({ weekday: dayIdx, time: available[0] })
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1 py-1.5 text-[#3f3f46] hover:text-[#dc2626] text-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── VACATION TAB ───────────────────────────────────────────── */}
            {tab === 'vacation' && (
              <motion.div
                key="vacation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Add vacation form */}
                <div className="bg-[#111111] border border-[#27272a] rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-[#fafafa] mb-4">
                    Add Vacation for {selectedTrainerData.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#71717a] mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newVacation.startDate}
                        onChange={e => setNewVacation(v => ({ ...v, startDate: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none scheme-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#71717a] mb-1">End Date</label>
                      <input
                        type="date"
                        value={newVacation.endDate}
                        onChange={e => setNewVacation(v => ({ ...v, endDate: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none scheme-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#71717a] mb-1">Note (optional)</label>
                      <input
                        type="text"
                        value={newVacation.note}
                        onChange={e => setNewVacation(v => ({ ...v, note: e.target.value }))}
                        placeholder="e.g. Summer break"
                        className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-[#fafafa] focus:border-[#dc2626] focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addVacation}
                    disabled={!newVacation.startDate || !newVacation.endDate}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <Palmtree className="w-4 h-4" />
                    Add Vacation Period
                  </button>
                </div>

                {/* Existing vacations */}
                <div className="bg-[#111111] border border-[#27272a] rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-[#27272a]">
                    <h3 className="text-lg font-bold text-[#fafafa]">Planned Vacations</h3>
                  </div>

                  {trainerVacations.length === 0 ? (
                    <div className="p-8 text-center text-[#71717a] text-sm">
                      No vacations scheduled for {selectedTrainerData.name}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#27272a]">
                      {trainerVacations.map(v => (
                        <div key={v.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#0a0a0a]/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                              <CalendarDays className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-[#fafafa] font-medium text-sm">
                                {v.start_date} → {v.end_date}
                              </p>
                              {v.note && <p className="text-[#71717a] text-xs">{v.note}</p>}
                            </div>
                          </div>
                          <button
                            onClick={() => removeVacation(v.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                          >
                            <Trash2 className="w-4 h-4 text-[#3f3f46] group-hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
