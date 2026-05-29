"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM"
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display} ${period}`
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:${m.toString().padStart(2, "0")} ${period}`
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

  const [h, m] = (value || "09:00").split(":").map(Number)

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        hourRef.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "center", behavior: "instant" })
        minuteRef.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "center", behavior: "instant" })
      }, 50)
    }
  }, [open])

  function setHour(hour: number) {
    onChange(`${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
  }

  function setMinute(min: number) {
    onChange(`${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-11 rounded-xl bg-muted/30 ring-1 ring-foreground/[0.06] px-4 text-left text-sm transition-all",
          "hover:ring-foreground/10 focus-visible:ring-brand/40 focus-visible:outline-none",
          "text-foreground"
        )}
      >
        {formatTime(value || "09:00")}
      </button>

      {open && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-150"
        >
          <div className="w-full max-w-[280px] mx-4 mb-4 sm:mb-0 rounded-2xl bg-card shadow-2xl ring-1 ring-foreground/10 overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-4 pt-3.5 pb-2">
              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Select time</p>
              <p className="text-2xl font-semibold tabular-nums mt-1">
                {formatTime(value || "09:00")}
              </p>
            </div>

            <div className="flex h-[200px] border-t border-foreground/[0.04]">
              {/* Hours */}
              <div ref={hourRef} className="flex-1 overflow-y-auto py-1 overscroll-contain">
                {HOURS.map((hour) => {
                  const selected = hour === h
                  return (
                    <button
                      key={hour}
                      type="button"
                      data-selected={selected || undefined}
                      onClick={() => setHour(hour)}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm text-center transition-colors active:scale-95",
                        selected
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-foreground/70 hover:bg-muted/50"
                      )}
                    >
                      {formatHour(hour)}
                    </button>
                  )
                })}
              </div>

              <div className="w-px bg-foreground/[0.06]" />

              {/* Minutes */}
              <div ref={minuteRef} className="flex-1 overflow-y-auto py-1 overscroll-contain">
                {MINUTES.map((min) => {
                  const selected = min === m
                  return (
                    <button
                      key={min}
                      type="button"
                      data-selected={selected || undefined}
                      onClick={() => setMinute(min)}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm text-center transition-colors active:scale-95",
                        selected
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-foreground/70 hover:bg-muted/50"
                      )}
                    >
                      :{min.toString().padStart(2, "0")}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-foreground/[0.04] px-4 py-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand hover:text-brand/80 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
