"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Restart, CheckCircle, ClockCircle } from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReminderSettingsProps {
  itemId: string
  currentSchedule: {
    enabled: boolean
    times: string[]
    timezone: string
    days: number[]
  } | null
}

const timePresets = [
  { id: "morning", label: "Morning", value: "08:00", emoji: "🌅" },
  { id: "afternoon", label: "Afternoon", value: "14:00", emoji: "☀️" },
  { id: "evening", label: "Evening", value: "19:00", emoji: "🌙" },
]

const dayLabels = [
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
  { label: "S", value: 7 },
]

function resolvePreset(times: string[]): string {
  const t = times[0]
  if (!t) return "morning"
  const found = timePresets.find((p) => p.value === t)
  return found ? found.id : "custom"
}

export function ReminderSettings({ itemId, currentSchedule }: ReminderSettingsProps) {
  const initialTime = currentSchedule?.times?.[0] ?? "08:00"
  const [timePreset, setTimePreset] = useState(resolvePreset(currentSchedule?.times ?? []))
  const [customTime, setCustomTime] = useState(
    timePresets.some((p) => p.value === initialTime) ? "09:00" : initialTime
  )
  const [days, setDays] = useState<number[]>(currentSchedule?.days ?? [1, 2, 3, 4, 5, 6, 7])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)

    const reminderTime =
      timePreset === "custom"
        ? customTime
        : (timePresets.find((t) => t.id === timePreset)?.value ?? "08:00")

    const schedule = { enabled: true, times: [reminderTime], timezone, days }

    const { error } = await supabase
      .from("accountability_items")
      .update({ reminder_schedule: schedule })
      .eq("id", itemId)

    setSaving(false)

    if (error) {
      toast.error("Could not save reminder settings")
      return
    }

    setSaved(true)
    toast.success("Reminders updated!")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Time presets */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">
          Remind me
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {timePresets.map((preset) => {
            const selected = timePreset === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => { setTimePreset(preset.id); setSaved(false) }}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 ring-1 transition-all duration-200",
                  selected
                    ? "ring-brand bg-brand/5"
                    : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
                )}
              >
                <span className="text-xs">{preset.emoji}</span>
                <span className={cn("text-[10px] font-medium", selected ? "text-brand" : "text-foreground")}>
                  {preset.label}
                </span>
              </button>
            )
          })}
          <button
            onClick={() => { setTimePreset("custom"); setSaved(false) }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 ring-1 transition-all duration-200",
              timePreset === "custom"
                ? "ring-brand bg-brand/5"
                : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
            )}
          >
            <ClockCircle className={cn("h-3.5 w-3.5", timePreset === "custom" ? "text-brand" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium", timePreset === "custom" ? "text-brand" : "text-foreground")}>
              Custom
            </span>
          </button>
        </div>

        {timePreset === "custom" && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <Input
              type="time"
              value={customTime}
              onChange={(e) => { setCustomTime(e.target.value); setSaved(false) }}
              className="h-9 rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 text-sm text-center"
            />
          </div>
        )}
      </div>

      {/* Day picker */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">
            Which days
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => { setDays([1, 2, 3, 4, 5]); setSaved(false) }}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
                days.length === 5 && days.every((d) => d <= 5)
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
            >
              Weekdays
            </button>
            <button
              onClick={() => { setDays([1, 2, 3, 4, 5, 6, 7]); setSaved(false) }}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
                days.length === 7
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
            >
              Every day
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          {dayLabels.map((day) => (
            <button
              key={day.value}
              onClick={() => toggleDay(day.value)}
              className={cn(
                "h-7 w-7 rounded-full text-[11px] font-semibold transition-all duration-200",
                days.includes(day.value)
                  ? "bg-brand text-white shadow-sm shadow-brand/20"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="gap-1.5 h-8 text-xs rounded-lg"
      >
        {saving ? (
          <Restart className="h-3 w-3 animate-spin" />
        ) : saved ? (
          <CheckCircle className="h-3 w-3" />
        ) : null}
        {saving ? "Saving..." : saved ? "Saved" : "Save"}
      </Button>
    </div>
  )
}
