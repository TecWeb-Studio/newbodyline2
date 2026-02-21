'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from 'next-intl'

interface Props {
  value: string        // ISO date  yyyy-mm-dd  or ''
  onChange: (date: string) => void
  minDate?: string     // ISO date  (default: today)
  maxDate?: string     // ISO date  (default: +60 days)
  /** colour theme – 'red' matches the main booking page, 'amber' matches the manage page */
  accent?: 'red' | 'amber'
}

function getDaysShort(locale: string): string[] {
  const base = new Date(2024, 0, 1) // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    return d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2)
  })
}

function getMonthName(month: number, locale: string): string {
  return new Date(2024, month, 1).toLocaleDateString(locale, { month: 'long' })
}

function isoToLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export default function BookingCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  accent = 'red',
}: Props) {
  const locale = useLocale()
  const localeMap: Record<string, string> = { it: 'it-IT', en: 'en-US', de: 'de-DE' }
  const dateLocale = localeMap[locale] || locale
  const DAYS_SHORT = getDaysShort(dateLocale)

  const todayISO = toISO(new Date())
  const min = minDate ?? todayISO
  const max = maxDate ?? (() => {
    const d = new Date(); d.setDate(d.getDate() + 60); return toISO(d)
  })()

  // initialise view to the month of the selected value, min, or today
  const initView = value ? isoToLocal(value) : isoToLocal(min)
  const [viewYear, setViewYear]   = useState(initView.getFullYear())
  const [viewMonth, setViewMonth] = useState(initView.getMonth()) // 0-indexed

  const accentBg    = accent === 'red' ? 'bg-[#dc2626]'                  : 'bg-amber-500'
  const accentHover = accent === 'red' ? 'hover:bg-[#dc2626]/20 hover:text-[#fafafa]' : 'hover:bg-amber-500/20 hover:text-white'
  const accentBorder= accent === 'red' ? 'border-[#dc2626]'              : 'border-amber-500'
  const accentText  = accent === 'red' ? 'text-[#dc2626]'                : 'text-amber-500'
  const bg          = accent === 'red' ? 'bg-[#111111] border-[#27272a]' : 'bg-zinc-900 border-zinc-700'
  const headerText  = accent === 'red' ? 'text-[#fafafa]'                : 'text-white'
  const mutedText   = accent === 'red' ? 'text-[#71717a]'                : 'text-zinc-500'
  const dayBg       = accent === 'red' ? 'bg-[#0a0a0a]'                  : 'bg-zinc-800'

  // ── Navigation ────────────────────────────────────────────────────────────
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // ── Build day grid ────────────────────────────────────────────────────────
  // First day of month (0=Sun … 6=Sat) → convert to Mon-first offset
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const offset   = (firstDay + 6) % 7   // Mon = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // We render 6 rows × 7 cols = 42 cells; empty cells before & after
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function cellISO(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }

  function isDisabled(day: number) {
    const iso = cellISO(day)
    return iso < min || iso > max
  }

  // Prevent navigating past the min/max months
  const minDate_obj = isoToLocal(min)
  const maxDate_obj = isoToLocal(max)
  const canGoPrev = viewYear > minDate_obj.getFullYear() ||
    (viewYear === minDate_obj.getFullYear() && viewMonth > minDate_obj.getMonth())
  const canGoNext = viewYear < maxDate_obj.getFullYear() ||
    (viewYear === maxDate_obj.getFullYear() && viewMonth < maxDate_obj.getMonth())

  return (
    <div className={`rounded-2xl border ${bg} p-4 w-full select-none`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-20 ${dayBg} hover:opacity-80`}
        >
          <ChevronLeft className={`w-4 h-4 ${headerText}`} />
        </button>

        <span className={`font-semibold text-sm ${headerText} capitalize`}>
          {getMonthName(viewMonth, dateLocale)} {viewYear}
        </span>

        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-20 ${dayBg} hover:opacity-80`}
        >
          <ChevronRight className={`w-4 h-4 ${headerText}`} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className={`text-center text-xs font-medium py-1 ${mutedText}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />

          const iso      = cellISO(day)
          const disabled = isDisabled(day)
          const selected = iso === value
          const isToday  = iso === todayISO

          return (
            <button
              key={iso}
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`
                relative flex items-center justify-center rounded-lg h-9 text-sm font-medium transition-all
                ${disabled
                  ? `${mutedText} opacity-30 cursor-not-allowed`
                  : selected
                    ? `${accentBg} text-white shadow-lg`
                    : `${headerText} ${accentHover} cursor-pointer`
                }
              `}
            >
              {day}
              {/* today dot */}
              {isToday && !selected && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${accentBg}`} />
              )}
              {/* selected ring */}
              {selected && (
                <span className={`absolute inset-0 rounded-lg ring-2 ${accentBorder} ring-offset-1 ring-offset-transparent`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date label */}
      {value && (
        <p className={`mt-3 text-xs text-center ${accentText} font-medium capitalize`}>
          {isoToLocal(value).toLocaleDateString(dateLocale, {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>
      )}
    </div>
  )
}
