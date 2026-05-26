"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Target,
  CheckSquare,
  Repeat,
  HandShake,
  ArrowLeft,
  Stars,
  CheckCircle,
  ClockCircle,
  Restart,
} from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  format,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  differenceInDays,
} from "date-fns"
import type { Json } from "@/types"

type ItemType = "goal" | "habit" | "task" | "commitment"
type ReminderCadence = "daily" | "weekly" | "monthly"
type TimeOfDay = "morning" | "afternoon" | "evening" | "custom"
type CommitmentMode = "one_time" | "recurring"

interface FormState {
  type: ItemType | null
  title: string
  goal: { deadline?: string; deadlinePreset?: string }
  habit: {
    frequency?: "daily" | "times_per_week" | "weekly" | "custom"
    timesPerWeek?: number
    days?: number[]
  }
  task: { dueDate?: string }
  commitment: {
    mode?: CommitmentMode
    date?: string
    frequency?: "daily" | "weekly" | "monthly" | "yearly"
  }
  reminder: {
    enabled: boolean
    cadence?: ReminderCadence
    timeOfDay?: TimeOfDay
    customTime?: string
    relativeToDeadline?: "morning_of" | "one_hour_before" | "one_day_before"
  }
}

const TYPE_OPTIONS = [
  { value: "goal" as const, label: "Goal", icon: Target, color: "text-brand", bg: "bg-brand/10", ring: "ring-brand" },
  { value: "habit" as const, label: "Habit", icon: Repeat, color: "text-green-500", bg: "bg-green-500/10", ring: "ring-green-500" },
  { value: "task" as const, label: "Task", icon: CheckSquare, color: "text-orange-500", bg: "bg-orange-500/10", ring: "ring-orange-500" },
  { value: "commitment" as const, label: "Commitment", icon: HandShake, color: "text-purple-500", bg: "bg-purple-500/10", ring: "ring-purple-500" },
]

const TIME_PRESETS = [
  { id: "morning" as const, label: "Morning", value: "08:00", emoji: "\u{1F305}" },
  { id: "afternoon" as const, label: "Afternoon", value: "14:00", emoji: "\u{2600}\u{FE0F}" },
  { id: "evening" as const, label: "Evening", value: "19:00", emoji: "\u{1F319}" },
]

const DAY_LABELS = [
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
  { label: "S", value: 7 },
]

const TITLE_MAX = 80

const INITIAL_FORM: FormState = {
  type: null,
  title: "",
  goal: {},
  habit: {},
  task: {},
  commitment: {},
  reminder: { enabled: true, timeOfDay: "morning" },
}

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function getDeadlineDate(preset: string): string {
  const now = new Date()
  switch (preset) {
    case "this_month": return format(endOfMonth(now), "yyyy-MM-dd")
    case "this_quarter": return format(endOfQuarter(now), "yyyy-MM-dd")
    case "this_year": return format(endOfYear(now), "yyyy-MM-dd")
    default: return ""
  }
}

function getGoalReminderCadence(deadlineStr: string): ReminderCadence {
  const days = differenceInDays(parseDateStr(deadlineStr), new Date())
  if (days <= 14) return "daily"
  if (days <= 90) return "weekly"
  return "monthly"
}

function resolveTime(timeOfDay?: TimeOfDay, customTime?: string): string {
  if (timeOfDay === "custom" && customTime) return customTime
  return TIME_PRESETS.find(p => p.id === timeOfDay)?.value ?? "08:00"
}

function formatDateNice(dateStr: string): string {
  try { return format(parseDateStr(dateStr), "MMM d, yyyy") }
  catch { return dateStr }
}

function formatDateShort(dateStr: string): string {
  try { return format(parseDateStr(dateStr), "MMM d") }
  catch { return dateStr }
}

function generateSummary(form: FormState): string {
  if (!form.type) return "Choose what you want to create."
  if (!form.title.trim()) return "Start by giving it a title."

  const t = form.title.trim()
  const tod = form.reminder.timeOfDay === "custom"
    ? (form.reminder.customTime || "custom time")
    : `${form.reminder.timeOfDay || "morning"}s`

  switch (form.type) {
    case "goal": {
      if (!form.goal.deadline) return "When should this goal be achieved?"
      const d = formatDateNice(form.goal.deadline)
      if (form.reminder.enabled && form.reminder.cadence) {
        return `${t} by ${d} — I’ll check in ${form.reminder.cadence}, ${tod}.`
      }
      return `${t} by ${d}.`
    }
    case "habit": {
      if (!form.habit.frequency) return "How often will you do this?"
      const freq =
        form.habit.frequency === "daily" ? "every day"
        : form.habit.frequency === "weekly" ? "once a week"
        : form.habit.frequency === "times_per_week" ? `${form.habit.timesPerWeek || 3}× a week`
        : "on your schedule"
      if (form.reminder.enabled) return `${t} ${freq} — reminder ${tod}.`
      return `${t} ${freq}.`
    }
    case "task": {
      if (!form.task.dueDate) return "When should this be completed?"
      const d = formatDateShort(form.task.dueDate)
      if (form.reminder.enabled && form.reminder.relativeToDeadline) {
        const rel = { morning_of: "morning of", one_hour_before: "1 hour before", one_day_before: "1 day before" }[form.reminder.relativeToDeadline]
        return `${t} due ${d} — reminder ${rel}.`
      }
      return `${t} due ${d}.`
    }
    case "commitment": {
      if (!form.commitment.mode) return "Is this one-time or recurring?"
      if (form.commitment.mode === "one_time") {
        if (!form.commitment.date) return `${t} — pick a date.`
        return `${t} once on ${formatDateShort(form.commitment.date)}.`
      }
      if (!form.commitment.frequency) return `${t} — how often?`
      if (form.reminder.enabled) return `${t} ${form.commitment.frequency} — reminder ${tod}.`
      return `${t} ${form.commitment.frequency}.`
    }
    default: return ""
  }
}

function isFormValid(form: FormState): boolean {
  if (!form.title.trim()) return false
  switch (form.type) {
    case "goal": return !!form.goal.deadline
    case "habit": return !!form.habit.frequency
    case "task": return !!form.task.dueDate
    case "commitment":
      if (form.commitment.mode === "one_time") return !!form.commitment.date
      if (form.commitment.mode === "recurring") return !!form.commitment.frequency
      return false
    default: return false
  }
}

function getButtonLabel(type: ItemType | null): string {
  if (!type) return "Create"
  return `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`
}

interface CreateItemPageProps {
  spaceId: string
}

export function CreateItemPage({ spaceId }: CreateItemPageProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const todayStr = format(new Date(), "yyyy-MM-dd")

  function handleTypeChange(type: ItemType) {
    setForm(prev => ({
      ...INITIAL_FORM,
      type,
      title: prev.title,
      reminder: { enabled: true, timeOfDay: "morning" },
    }))
  }

  function updateGoal(updates: Partial<FormState["goal"]>) {
    setForm(prev => {
      const next = { ...prev, goal: { ...prev.goal, ...updates } }
      if (updates.deadline) {
        next.reminder = { ...prev.reminder, cadence: getGoalReminderCadence(updates.deadline) }
      }
      return next
    })
  }

  function updateHabit(updates: Partial<FormState["habit"]>) {
    setForm(prev => {
      const next = { ...prev, habit: { ...prev.habit, ...updates } }
      if (updates.frequency) {
        switch (updates.frequency) {
          case "daily":
            next.habit.days = [1, 2, 3, 4, 5, 6, 7]
            break
          case "weekly":
            next.habit.days = prev.habit.days?.length === 1 ? prev.habit.days : [1]
            break
          case "times_per_week":
            next.habit.timesPerWeek = prev.habit.timesPerWeek || 3
            next.habit.days = prev.habit.days || []
            break
          case "custom":
            next.habit.days = prev.habit.days || []
            break
        }
      }
      return next
    })
  }

  function updateTask(updates: Partial<FormState["task"]>) {
    setForm(prev => {
      const next = { ...prev, task: { ...prev.task, ...updates } }
      if (updates.dueDate && !prev.reminder.relativeToDeadline) {
        next.reminder = { ...prev.reminder, relativeToDeadline: "morning_of" }
      }
      return next
    })
  }

  function updateCommitment(updates: Partial<FormState["commitment"]>) {
    setForm(prev => {
      const next = { ...prev, commitment: { ...prev.commitment, ...updates } }
      if (updates.date && !prev.reminder.relativeToDeadline) {
        next.reminder = { ...prev.reminder, relativeToDeadline: "morning_of" }
      }
      return next
    })
  }

  function updateReminder(updates: Partial<FormState["reminder"]>) {
    setForm(prev => ({ ...prev, reminder: { ...prev.reminder, ...updates } }))
  }

  function toggleHabitDay(day: number) {
    setForm(prev => {
      const days = prev.habit.days || []
      const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort()
      return { ...prev, habit: { ...prev.habit, days: next } }
    })
  }

  async function handleSubmit() {
    if (!isFormValid(form) || !form.type) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please log in")
      setLoading(false)
      return
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const time = resolveTime(form.reminder.timeOfDay, form.reminder.customTime)

    let frequency: string = "one_time"
    let dueDate: string | null = null
    let reminderSchedule: Json | null = null

    switch (form.type) {
      case "goal":
        frequency = "one_time"
        dueDate = form.goal.deadline || null
        if (form.reminder.enabled && form.reminder.cadence) {
          reminderSchedule = { enabled: true, cadence: form.reminder.cadence, times: [time], timezone }
        }
        break

      case "habit": {
        const hf = form.habit.frequency
        frequency = hf === "times_per_week" ? "weekly" : (hf || "daily")
        reminderSchedule = {
          enabled: form.reminder.enabled,
          times: [time],
          timezone,
          days: form.habit.days || [1, 2, 3, 4, 5, 6, 7],
          ...(hf === "times_per_week" && form.habit.timesPerWeek ? { times_per_week: form.habit.timesPerWeek } : {}),
        }
        break
      }

      case "task":
        frequency = "one_time"
        dueDate = form.task.dueDate || null
        if (form.reminder.enabled) {
          reminderSchedule = { enabled: true, relative: form.reminder.relativeToDeadline || "morning_of", times: [time], timezone }
        }
        break

      case "commitment":
        if (form.commitment.mode === "one_time") {
          frequency = "one_time"
          dueDate = form.commitment.date || null
          if (form.reminder.enabled) {
            reminderSchedule = { enabled: true, relative: form.reminder.relativeToDeadline || "morning_of", times: [time], timezone }
          }
        } else {
          frequency = form.commitment.frequency || "weekly"
          if (form.reminder.enabled) {
            reminderSchedule = { enabled: true, times: [time], timezone }
          }
        }
        break
    }

    const { error } = await supabase.from("accountability_items").insert({
      space_id: spaceId,
      user_id: user.id,
      title: form.title.trim(),
      type: form.type,
      frequency,
      due_date: dueDate,
      reminder_schedule: reminderSchedule,
    })

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    setSuccess(true)
    toast.success("Created!")
    setTimeout(() => {
      router.push(`/spaces/${spaceId}`)
      router.refresh()
    }, 1500)
  }

  const valid = isFormValid(form)
  const summary = generateSummary(form)

  const showReminderBlock = (() => {
    switch (form.type) {
      case "goal": return !!form.goal.deadline
      case "habit": return !!form.habit.frequency
      case "task": return !!form.task.dueDate
      case "commitment":
        if (form.commitment.mode === "one_time") return !!form.commitment.date
        if (form.commitment.mode === "recurring") return !!form.commitment.frequency
        return false
      default: return false
    }
  })()

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="relative mb-4">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <Stars className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold">You&apos;re all set!</h2>
        <p className="text-sm text-muted-foreground mt-1">Your accountability partners can now see this.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-52">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Held accountable for?</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a type and give it a name.</p>
        </div>

        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(opt => {
            const selected = form.type === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleTypeChange(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ring-1 transition-all duration-200",
                  selected
                    ? `${opt.ring} ${opt.bg} ${opt.color}`
                    : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                )}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Title</label>
            <span className={cn(
              "text-[10px] tabular-nums transition-colors",
              form.title.length > TITLE_MAX - 10 ? "text-red-500" : "text-muted-foreground/40"
            )}>
              {form.title.length}/{TITLE_MAX}
            </span>
          </div>
          <Input
            placeholder={
              form.type === "goal" ? "e.g., Run a marathon"
              : form.type === "habit" ? "e.g., Meditate every morning"
              : form.type === "task" ? "e.g., Submit quarterly report"
              : form.type === "commitment" ? "e.g., Call Mom every Sunday"
              : "e.g., Run 5K three times a week"
            }
            value={form.title}
            onChange={e => {
              if (e.target.value.length <= TITLE_MAX)
                setForm(prev => ({ ...prev, title: e.target.value }))
            }}
            className="h-12 text-base rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* ── Goal Spine ── */}
        {form.type === "goal" && (
          <div key="goal-spine" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h2 className="text-base font-semibold">By when?</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "this_month", label: "This month" },
                { value: "this_quarter", label: "This quarter" },
                { value: "this_year", label: "This year" },
                { value: "custom", label: "Custom date" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === "custom") {
                      updateGoal({ deadlinePreset: "custom", deadline: undefined })
                    } else {
                      updateGoal({ deadlinePreset: opt.value, deadline: getDeadlineDate(opt.value) })
                    }
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all duration-200",
                    form.goal.deadlinePreset === opt.value
                      ? "ring-brand bg-brand/5 text-brand"
                      : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {form.goal.deadlinePreset === "custom" && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                <Input
                  type="date"
                  aria-label="Goal deadline"
                  value={form.goal.deadline || ""}
                  onChange={e => updateGoal({ deadline: e.target.value })}
                  min={todayStr}
                  className="h-11 rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Habit Spine ── */}
        {form.type === "habit" && (
          <div key="habit-spine" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h2 className="text-base font-semibold">How often?</h2>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "daily" as const, label: "Every day" },
                { value: "times_per_week" as const, label: "A few times a week" },
                { value: "weekly" as const, label: "Once a week" },
                { value: "custom" as const, label: "Custom" },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateHabit({ frequency: opt.value })}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all duration-200",
                    form.habit.frequency === opt.value
                      ? "ring-brand bg-brand/5 text-brand"
                      : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {form.habit.frequency === "times_per_week" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">How many times?</p>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => updateHabit({ timesPerWeek: n })}
                      className={cn(
                        "h-10 w-10 rounded-xl text-sm font-semibold ring-1 transition-all duration-200",
                        form.habit.timesPerWeek === n
                          ? "ring-brand bg-brand/5 text-brand"
                          : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Task Spine ── */}
        {form.type === "task" && (
          <div key="task-spine" className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h2 className="text-base font-semibold">When&apos;s it due?</h2>
            <Input
              type="date"
              aria-label="Task due date"
              value={form.task.dueDate || ""}
              onChange={e => updateTask({ dueDate: e.target.value })}
              min={todayStr}
              className="h-11 rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 text-sm"
            />
          </div>
        )}

        {/* ── Commitment Spine ── */}
        {form.type === "commitment" && (
          <div key="commitment-spine" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h2 className="text-base font-semibold">One-time or recurring?</h2>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "one_time" as const, label: "One-time" },
                { value: "recurring" as const, label: "Recurring" },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateCommitment({ mode: opt.value, date: undefined, frequency: undefined })}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all duration-200",
                    form.commitment.mode === opt.value
                      ? "ring-brand bg-brand/5 text-brand"
                      : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {form.commitment.mode === "one_time" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">When?</p>
                <Input
                  type="date"
                  aria-label="Commitment date"
                  value={form.commitment.date || ""}
                  onChange={e => updateCommitment({ date: e.target.value })}
                  min={todayStr}
                  className="h-11 rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 text-sm"
                />
              </div>
            )}

            {form.commitment.mode === "recurring" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">How often?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => updateCommitment({ frequency: f })}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium ring-1 capitalize transition-all duration-200",
                        form.commitment.frequency === f
                          ? "ring-brand bg-brand/5 text-brand"
                          : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reminder Block ── */}
        {showReminderBlock && (
          <div key={`reminder-${form.type}-${form.commitment.mode}`} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h2 className="text-base font-semibold">
              {form.type === "goal" ? "How closely should we keep you on track?"
               : form.type === "habit" ? "When should we remind you?"
               : form.type === "task" ? "Remind me"
               : "Reminder"}
            </h2>

            {!form.reminder.enabled ? (
              <div className="rounded-xl bg-muted/40 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Reminders are off.</p>
                <button onClick={() => updateReminder({ enabled: true })} className="text-xs text-brand font-medium mt-1">
                  Turn on
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Goal: cadence */}
                {form.type === "goal" && (
                  <div className="flex gap-2">
                    {(["daily", "weekly", "monthly"] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => updateReminder({ cadence: c })}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-xl text-sm font-medium ring-1 capitalize transition-all duration-200",
                          form.reminder.cadence === c
                            ? "ring-brand bg-brand/5 text-brand"
                            : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

                {/* Task + Commitment one-time: relative options */}
                {(form.type === "task" || (form.type === "commitment" && form.commitment.mode === "one_time")) && (
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: "morning_of" as const, label: "Morning of" },
                      { value: "one_hour_before" as const, label: "1 hour before" },
                      { value: "one_day_before" as const, label: "1 day before" },
                    ]).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateReminder({ relativeToDeadline: opt.value })}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-medium ring-1 transition-all duration-200",
                          form.reminder.relativeToDeadline === opt.value
                            ? "ring-brand bg-brand/5 text-brand"
                            : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Habit: day picker */}
                {form.type === "habit" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Which days</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setForm(prev => ({ ...prev, habit: { ...prev.habit, days: [1, 2, 3, 4, 5] } }))}
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
                            form.habit.days?.length === 5 && form.habit.days.every(d => d <= 5)
                              ? "bg-brand/10 text-brand"
                              : "text-muted-foreground/40 hover:text-muted-foreground"
                          )}
                        >
                          Weekdays
                        </button>
                        <button
                          onClick={() => setForm(prev => ({ ...prev, habit: { ...prev.habit, days: [1, 2, 3, 4, 5, 6, 7] } }))}
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
                            form.habit.days?.length === 7
                              ? "bg-brand/10 text-brand"
                              : "text-muted-foreground/40 hover:text-muted-foreground"
                          )}
                        >
                          Every day
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-between">
                      {DAY_LABELS.map(day => (
                        <button
                          key={day.value}
                          onClick={() => toggleHabitDay(day.value)}
                          className={cn(
                            "h-9 w-9 rounded-full text-xs font-semibold transition-all duration-200",
                            form.habit.days?.includes(day.value)
                              ? "bg-brand text-white shadow-sm shadow-brand/20"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time of day (goal, habit, commitment recurring) */}
                {(form.type === "goal" || form.type === "habit" || (form.type === "commitment" && form.commitment.mode === "recurring")) && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Time of day</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TIME_PRESETS.map(preset => {
                        const selected = form.reminder.timeOfDay === preset.id
                        return (
                          <button
                            key={preset.id}
                            onClick={() => updateReminder({ timeOfDay: preset.id })}
                            className={cn(
                              "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 ring-1 transition-all duration-200",
                              selected
                                ? "ring-brand bg-brand/5"
                                : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
                            )}
                          >
                            <span className="text-sm">{preset.emoji}</span>
                            <span className={cn("text-[11px] font-medium", selected ? "text-brand" : "text-foreground")}>
                              {preset.label}
                            </span>
                          </button>
                        )
                      })}
                      <button
                        onClick={() => updateReminder({ timeOfDay: "custom" })}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 ring-1 transition-all duration-200",
                          form.reminder.timeOfDay === "custom"
                            ? "ring-brand bg-brand/5"
                            : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
                        )}
                      >
                        <ClockCircle className={cn("h-4 w-4 mt-0.5", form.reminder.timeOfDay === "custom" ? "text-brand" : "text-muted-foreground")} />
                        <span className={cn("text-[11px] font-medium", form.reminder.timeOfDay === "custom" ? "text-brand" : "text-foreground")}>
                          Custom
                        </span>
                      </button>
                    </div>
                    {form.reminder.timeOfDay === "custom" && (
                      <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Input
                          type="time"
                          aria-label="Custom reminder time"
                          value={form.reminder.customTime || "09:00"}
                          onChange={e => updateReminder({ customTime: e.target.value })}
                          className="h-10 rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 text-sm text-center"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => updateReminder({ enabled: false })}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Don&apos;t remind me
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-56 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t px-4 py-3">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="rounded-xl bg-muted/40 ring-1 ring-foreground/[0.04] px-4 py-2.5">
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!valid || loading}
            className="w-full h-12 rounded-xl text-base gap-2"
          >
            {loading ? (
              <>
                <Restart className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Stars className="h-4 w-4" />
                {getButtonLabel(form.type)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
