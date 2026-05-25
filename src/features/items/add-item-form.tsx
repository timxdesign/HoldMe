"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AddCircle,
  Target,
  CheckSquare,
  Repeat,
  HandShake,
  Restart,
  ArrowLeft,
  ArrowRight,
  Stars,
  CheckCircle,
  Bell,
  BellOff,
  ClockCircle,
} from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddItemFormProps {
  spaceId: string
}

const typeOptions = [
  {
    value: "goal",
    label: "Goal",
    description: "A milestone you want to hit",
    icon: Target,
    color: "text-brand",
    bg: "bg-brand/10",
    ring: "ring-brand",
  },
  {
    value: "habit",
    label: "Habit",
    description: "Something to do regularly",
    icon: Repeat,
    color: "text-green-500",
    bg: "bg-green-500/10",
    ring: "ring-green-500",
  },
  {
    value: "task",
    label: "Task",
    description: "A specific thing to complete",
    icon: CheckSquare,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    ring: "ring-orange-500",
  },
  {
    value: "commitment",
    label: "Commitment",
    description: "A promise you're making",
    icon: HandShake,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    ring: "ring-purple-500",
  },
]

const frequencyOptions = [
  { value: "daily", label: "Every day", sub: "Daily check-ins" },
  { value: "weekly", label: "Every week", sub: "Weekly progress" },
  { value: "monthly", label: "Every month", sub: "Monthly review" },
  { value: "one_time", label: "Just once", sub: "One-time goal" },
]

const presetTimes = [
  { label: "Morning", value: "08:00", icon: "🌅" },
  { label: "Afternoon", value: "14:00", icon: "☀️" },
  { label: "Evening", value: "19:00", icon: "🌙" },
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

const TITLE_MAX = 80
const TOTAL_STEPS = 4

export function AddItemForm({ spaceId }: AddItemFormProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [frequency, setFrequency] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTimes, setReminderTimes] = useState<string[]>(["08:00"])
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const router = useRouter()
  const supabase = createClient()

  function reset() {
    setStep(0)
    setTitle("")
    setDescription("")
    setType("")
    setFrequency("")
    setReminderEnabled(false)
    setReminderTimes(["08:00"])
    setReminderDays([1, 2, 3, 4, 5])
    setLoading(false)
    setSuccess(false)
    setDirection("forward")
  }

  function goNext() {
    setDirection("forward")
    setStep((s) => s + 1)
  }

  function goBack() {
    setDirection("back")
    setStep((s) => s - 1)
  }

  async function handleSubmit() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in")
      setLoading(false)
      return
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const reminderSchedule = reminderEnabled
      ? { enabled: true, times: reminderTimes, timezone, days: reminderDays }
      : null

    const { error } = await supabase.from("accountability_items").insert({
      space_id: spaceId,
      user_id: user.id,
      title,
      description: description || null,
      type: type || "goal",
      frequency: frequency || "daily",
      reminder_schedule: reminderSchedule,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSuccess(true)
    toast.success("Goal added!")
    setTimeout(() => {
      setOpen(false)
      reset()
      router.refresh()
    }, 1200)
  }

  const selectedType = typeOptions.find((t) => t.value === type)

  const canProceedFromStep: Record<number, boolean> = {
    0: !!type,
    1: !!title.trim(),
    2: !!frequency,
    3: true,
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger
        render={<Button size="sm" variant="outline" className="gap-1.5 rounded-lg" />}
      >
        <AddCircle className="h-3.5 w-3.5" />
        Add Goal
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden" showCloseButton={!success}>
        {success ? <SuccessView reminderEnabled={reminderEnabled} /> : (
          <>
            <StepHeader step={step} selectedType={selectedType} frequency={frequency} />
            <StepIndicator current={step} total={TOTAL_STEPS} />

            <div
              key={step}
              className={cn(
                "animate-in duration-200",
                direction === "forward"
                  ? "fade-in slide-in-from-right-4"
                  : "fade-in slide-in-from-left-4"
              )}
            >
              {step === 0 && (
                <StepType type={type} onSelect={(v) => { setType(v); goNext() }} />
              )}
              {step === 1 && (
                <StepDetails
                  title={title}
                  description={description}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                />
              )}
              {step === 2 && (
                <StepFrequency frequency={frequency} onSelect={setFrequency} />
              )}
              {step === 3 && (
                <StepReminder
                  enabled={reminderEnabled}
                  times={reminderTimes}
                  days={reminderDays}
                  frequency={frequency}
                  onToggle={setReminderEnabled}
                  onTimesChange={setReminderTimes}
                  onDaysChange={setReminderDays}
                />
              )}
            </div>

            <StepNav
              step={step}
              canProceed={canProceedFromStep[step]}
              loading={loading}
              onBack={goBack}
              onNext={goNext}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StepHeader({ step, selectedType, frequency }: { step: number; selectedType?: typeof typeOptions[number]; frequency: string }) {
  const titles = ["What kind of goal?", "Describe your goal", "How often?", "Set reminders"]
  const subtitles = [
    "Pick the type that fits best.",
    "Give it a clear, specific name.",
    "Choose how often you'll check in.",
    "Get nudged so you never forget.",
  ]
  return (
    <div className="text-center space-y-1 pt-1">
      {selectedType && step > 0 && (
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className={cn("rounded-md p-1", selectedType.bg)}>
            <selectedType.icon className={cn("h-3 w-3", selectedType.color)} />
          </div>
          <span className={cn("text-[11px] font-semibold uppercase tracking-wide", selectedType.color)}>
            {selectedType.label}
          </span>
          {step >= 3 && frequency && (
            <>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] text-muted-foreground font-medium capitalize">
                {frequency === "one_time" ? "One-time" : frequency}
              </span>
            </>
          )}
        </div>
      )}
      <h2 className="text-lg font-bold tracking-tight">{titles[step]}</h2>
      <p className="text-xs text-muted-foreground">{subtitles[step]}</p>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i === current ? "w-6 bg-brand" : i < current ? "w-3 bg-brand/40" : "w-3 bg-foreground/10"
          )}
        />
      ))}
    </div>
  )
}

function StepType({ type, onSelect }: { type: string; onSelect: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 py-2">
      {typeOptions.map((opt) => {
        const selected = type === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl p-4 text-left ring-1 transition-all duration-200",
              selected
                ? `${opt.ring} ${opt.bg} shadow-sm`
                : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
            )}
          >
            {selected && (
              <div className="absolute top-2.5 right-2.5">
                <div className={cn("rounded-full p-0.5", opt.bg)}>
                  <CheckCircle className={cn("h-3 w-3", opt.color)} />
                </div>
              </div>
            )}
            <div className={cn("rounded-lg p-2", opt.bg)}>
              <opt.icon className={cn("h-5 w-5", selected ? opt.color : "text-muted-foreground")} />
            </div>
            <div>
              <p className={cn("text-sm font-semibold", selected ? opt.color : "text-foreground")}>
                {opt.label}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                {opt.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function StepDetails({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string
  description: string
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}) {
  const titleRef = (el: HTMLInputElement | null) => {
    if (el && !title) el.focus()
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="goal-title" className="text-sm font-medium">
            Title
          </label>
          <span
            className={cn(
              "text-[10px] tabular-nums",
              title.length > TITLE_MAX - 10 ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <Input
          ref={titleRef}
          id="goal-title"
          placeholder="e.g., Run 5K three times a week"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= TITLE_MAX) onTitleChange(e.target.value)
          }}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="goal-desc" className="text-sm font-medium">
          Details{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="goal-desc"
          placeholder="Add any context your accountability partners should know..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  )
}

function StepFrequency({ frequency, onSelect }: { frequency: string; onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2 py-2">
      {frequencyOptions.map((opt) => {
        const selected = frequency === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              "w-full flex items-center justify-between rounded-xl px-4 py-3 ring-1 transition-all duration-200 text-left",
              selected
                ? "ring-brand bg-brand/5 shadow-sm"
                : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
            )}
          >
            <div>
              <p className={cn("text-sm font-semibold", selected && "text-brand")}>
                {opt.label}
              </p>
              <p className="text-[11px] text-muted-foreground">{opt.sub}</p>
            </div>
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                selected ? "border-brand bg-brand" : "border-foreground/20"
              )}
            >
              {selected && <CheckCircle className="h-3 w-3 text-white" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function StepReminder({
  enabled,
  times,
  days,
  frequency,
  onToggle,
  onTimesChange,
  onDaysChange,
}: {
  enabled: boolean
  times: string[]
  days: number[]
  frequency: string
  onToggle: (v: boolean) => void
  onTimesChange: (v: string[]) => void
  onDaysChange: (v: number[]) => void
}) {
  function toggleTime(time: string) {
    onTimesChange(
      times.includes(time) ? times.filter((t) => t !== time) : [...times, time]
    )
  }

  function toggleDay(day: number) {
    onDaysChange(
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort()
    )
  }

  const isOneTime = frequency === "one_time"

  return (
    <div className="space-y-4 py-2">
      {/* Toggle */}
      <button
        onClick={() => onToggle(!enabled)}
        className={cn(
          "flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-left ring-1 transition-all duration-200",
          enabled
            ? "ring-brand bg-brand/5"
            : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
        )}
      >
        <div className={cn(
          "rounded-xl p-2",
          enabled ? "bg-brand/10" : "bg-muted/60"
        )}>
          {enabled ? (
            <Bell className={cn("h-4 w-4", enabled ? "text-brand" : "text-muted-foreground")} />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className={cn("text-sm font-semibold", enabled && "text-brand")}>
            {enabled ? "Reminders on" : "Enable reminders"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isOneTime
              ? "Get a one-time nudge before your deadline"
              : "Get notified when it's time to check in"}
          </p>
        </div>
        <div
          className={cn(
            "h-5 w-9 rounded-full transition-all duration-200 relative shrink-0",
            enabled ? "bg-brand" : "bg-foreground/15"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
              enabled ? "left-[18px]" : "left-0.5"
            )}
          />
        </div>
      </button>

      {/* Reminder config */}
      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Time presets */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              When to remind
            </p>
            <div className="grid grid-cols-3 gap-2">
              {presetTimes.map((preset) => {
                const selected = times.includes(preset.value)
                return (
                  <button
                    key={preset.value}
                    onClick={() => toggleTime(preset.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-3 py-3 ring-1 transition-all duration-200",
                      selected
                        ? "ring-brand bg-brand/5"
                        : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
                    )}
                  >
                    <span className="text-base">{preset.icon}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      selected ? "text-brand" : "text-foreground"
                    )}>
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{preset.value}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Day picker - hide for one_time */}
          {!isOneTime && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Which days
              </p>
              <div className="flex gap-1.5 justify-between">
                {dayLabels.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "h-9 w-9 rounded-full text-xs font-semibold transition-all duration-200",
                      days.includes(day.value)
                        ? "bg-brand text-white shadow-sm shadow-brand/20"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {/* Quick select */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onDaysChange([1, 2, 3, 4, 5])}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors",
                    days.length === 5 && days.every((d) => d <= 5)
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Weekdays
                </button>
                <button
                  onClick={() => onDaysChange([1, 2, 3, 4, 5, 6, 7])}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors",
                    days.length === 7
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Every day
                </button>
                <button
                  onClick={() => onDaysChange([6, 7])}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors",
                    days.length === 2 && days[0] === 6
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Weekends
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          {times.length > 0 && (
            <div className="rounded-xl bg-brand/5 ring-1 ring-brand/10 px-3.5 py-2.5 flex items-center gap-2">
              <ClockCircle className="h-3.5 w-3.5 text-brand shrink-0" />
              <p className="text-[11px] text-brand font-medium">
                {isOneTime ? "You'll get a reminder " : "Reminders "}
                {times.map((t) => presetTimes.find((p) => p.value === t)?.label.toLowerCase() ?? t).join(" & ")}
                {!isOneTime && days.length < 7 && days.length > 0 && (
                  <> on {days.length === 5 && days.every((d) => d <= 5) ? "weekdays" : `${days.length} days/week`}</>
                )}
                {!isOneTime && days.length === 7 && " every day"}
              </p>
            </div>
          )}
        </div>
      )}

      {!enabled && (
        <div className="rounded-xl bg-muted/40 px-4 py-3 text-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            You can always set up reminders later from the goal card.
          </p>
        </div>
      )}
    </div>
  )
}

function StepNav({
  step,
  canProceed,
  loading,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number
  canProceed: boolean
  loading: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}) {
  const isLast = step === TOTAL_STEPS - 1

  return (
    <div className="flex items-center gap-2 pt-1">
      {step > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      )}
      <div className="flex-1" />
      {isLast ? (
        <Button
          onClick={onSubmit}
          disabled={!canProceed || loading}
          className="gap-2 h-10 px-6"
        >
          {loading ? (
            <>
              <Restart className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Stars className="h-4 w-4" />
              Create Goal
            </>
          )}
        </Button>
      ) : step > 0 ? (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="gap-1.5 h-10"
        >
          Continue
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  )
}

function SuccessView({ reminderEnabled }: { reminderEnabled: boolean }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center transition-all duration-500",
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}
    >
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <Stars className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold">Goal created!</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {reminderEnabled
          ? "Reminders set. Your partners can now see it."
          : "Your accountability partners can now see it."}
      </p>
    </div>
  )
}
