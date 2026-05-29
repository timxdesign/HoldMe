"use client"

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react"
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
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)

  const [h, m] = (value || "09:00").split(":").map(Number)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (triggerRef.current?.contains(e.target as Node)) return
    if (pickerRef.current?.contains(e.target as Node)) return
    setOpen(false)
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, handleClickOutside])

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const pickerHeight = 270
      const top = spaceBelow >= pickerHeight
        ? rect.bottom + 8
        : rect.top - pickerHeight - 8
      setPos({ top: Math.max(8, top), left: rect.left, width: rect.width })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const hourEl = hourRef.current?.querySelector("[data-selected]")
        hourEl?.scrollIntoView({ block: "center", behavior: "instant" })
        const minEl = minuteRef.current?.querySelector("[data-selected]")
        minEl?.scrollIntoView({ block: "center", behavior: "instant" })
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
        ref={triggerRef}
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
          ref={pickerRef}
          className="fixed z-[60] animate-in fade-in zoom-in-95 duration-150"
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 240) }}
        >
          <div className="rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10 overflow-hidden">
            <div className="flex h-[220px]">
              {/* Hours */}
              <div ref={hourRef} className="flex-1 overflow-y-auto py-2 scrollbar-thin">
                {HOURS.map((hour) => {
                  const selected = hour === h
                  return (
                    <button
                      key={hour}
                      type="button"
                      data-selected={selected || undefined}
                      onClick={() => setHour(hour)}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-center transition-colors",
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
              <div ref={minuteRef} className="flex-1 overflow-y-auto py-2 scrollbar-thin">
                {MINUTES.map((min) => {
                  const selected = min === m
                  return (
                    <button
                      key={min}
                      type="button"
                      data-selected={selected || undefined}
                      onClick={() => setMinute(min)}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-center transition-colors",
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

            <div className="border-t border-foreground/[0.04] px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {formatTime(value || "09:00")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-brand hover:underline transition-colors"
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
