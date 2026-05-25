"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Restart, CheckCircle } from "@solar-icons/react"
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

const presetTimes = [
  { label: "Morning", value: "08:00" },
  { label: "Afternoon", value: "14:00" },
  { label: "Evening", value: "19:00" },
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

export function ReminderSettings({ itemId, currentSchedule }: ReminderSettingsProps) {
  const [enabled, setEnabled] = useState(currentSchedule?.enabled ?? false)
  const [times, setTimes] = useState<string[]>(currentSchedule?.times ?? ["08:00"])
  const [days, setDays] = useState<number[]>(currentSchedule?.days ?? [1, 2, 3, 4, 5])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  function toggleTime(time: string) {
    setTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
    setSaved(false)
  }

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)

    const schedule = enabled
      ? { enabled: true, times, timezone, days }
      : { enabled: false, times: [], timezone, days: [] }

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
    toast.success(enabled ? "Reminders set!" : "Reminders disabled")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          setEnabled(!enabled)
          setSaved(false)
        }}
        className={cn(
          "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm transition-all ring-1",
          enabled
            ? "ring-brand bg-brand/5 text-brand"
            : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20"
        )}
      >
        {enabled ? (
          <Bell className="h-3.5 w-3.5" />
        ) : (
          <BellOff className="h-3.5 w-3.5" />
        )}
        <span className="font-medium">
          {enabled ? "Reminders on" : "Set reminders"}
        </span>
      </button>

      {enabled && (
        <div className="space-y-3 pl-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              When
            </p>
            <div className="flex gap-1.5">
              {presetTimes.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => toggleTime(preset.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-all",
                    times.includes(preset.value)
                      ? "ring-brand bg-brand/10 text-brand"
                      : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Which days
            </p>
            <div className="flex gap-1">
              {dayLabels.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "h-7 w-7 rounded-full text-[11px] font-semibold transition-all",
                    days.includes(day.value)
                      ? "bg-brand text-white"
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
            disabled={saving || times.length === 0}
            className="gap-1.5 h-8 text-xs"
          >
            {saving ? (
              <Restart className="h-3 w-3 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-3 w-3" />
            ) : null}
            {saving ? "Saving..." : saved ? "Saved" : "Save reminders"}
          </Button>
        </div>
      )}
    </div>
  )
}
