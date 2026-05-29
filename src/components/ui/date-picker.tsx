"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
} from "date-fns"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  min?: string
  placeholder?: string
  className?: string
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function DatePicker({ value, onChange, min, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return startOfMonth(parseISO(value))
    return startOfMonth(new Date())
  })
  const backdropRef = useRef<HTMLDivElement>(null)

  const minDate = min ? startOfDay(parseISO(min)) : undefined
  const selectedDate = value ? parseISO(value) : undefined

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function selectDay(day: Date) {
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-12 rounded-xl bg-muted/30 ring-1 ring-foreground/[0.06] px-4 text-left text-sm transition-all",
          "hover:ring-foreground/10 focus-visible:ring-brand/40 focus-visible:outline-none",
          value ? "text-foreground" : "text-muted-foreground/40"
        )}
      >
        {value ? format(parseISO(value), "MMM d, yyyy") : placeholder}
      </button>

      {open && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-in fade-in duration-150"
        >
          <div className="w-full max-w-[340px] mx-4 mb-4 sm:mb-0 rounded-2xl bg-card shadow-2xl ring-1 ring-foreground/10 p-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span className="text-sm font-semibold">
                {format(viewMonth, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/50 py-1.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day) => {
                const inMonth = isSameMonth(day, viewMonth)
                const selected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)
                const disabled = minDate ? isBefore(day, minDate) : false

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !disabled && selectDay(day)}
                    disabled={disabled}
                    className={cn(
                      "aspect-square rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-90",
                      !inMonth && "text-muted-foreground/20",
                      inMonth && !selected && !disabled && "text-foreground hover:bg-brand/5 hover:text-brand",
                      isTodayDate && !selected && "ring-1 ring-brand/30",
                      selected && "bg-brand text-white shadow-sm shadow-brand/25",
                      disabled && "text-muted-foreground/20 cursor-not-allowed"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-foreground/[0.04]">
              <button
                type="button"
                onClick={() => {
                  const t = new Date()
                  if (!minDate || !isBefore(t, minDate)) selectDay(t)
                }}
                className="flex-1 text-xs font-medium text-muted-foreground hover:text-brand py-2 rounded-lg hover:bg-brand/5 transition-colors"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false) }}
                  className="flex-1 text-xs font-medium text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 text-xs font-medium text-brand py-2 rounded-lg hover:bg-brand/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
