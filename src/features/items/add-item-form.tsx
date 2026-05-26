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
  ClockCircle,
} from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddItemFormProps {
  spaceId: string
}

const typeOptions = [
  { value: "goal", label: "Goal", icon: Target, color: "text-brand", bg: "bg-brand/10", ring: "ring-brand" },
  { value: "habit", label: "Habit", icon: Repeat, color: "text-green-500", bg: "bg-green-500/10", ring: "ring-green-500" },
  { value: "task", label: "Task", icon: CheckSquare, color: "text-orange-500", bg: "bg-orange-500/10", ring: "ring-orange-500" },
  { value: "commitment", label: "Commitment", icon: HandShake, color: "text-purple-500", bg: "bg-purple-500/10", ring: "ring-purple-500" },
]

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "one_time", label: "Once" },
]

const timePresets = [
  { id: "morning", label: "Morning", sub: "8:00 AM", value: "08:00", emoji: "🌅" },
  { id: "afternoon", label: "Afternoon", sub: "2:00 PM", value: "14:00", emoji: "☀️" },
  { id: "evening", label: "Evening", sub: "7:00 PM", value: "19:00", emoji: "🌙" },
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

export function AddItemForm({ spaceId }: AddItemFormProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")

  const [type, setType] = useState("goal")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showDescription, setShowDescription] = useState(false)

  const [frequency, setFrequency] = useState("daily")
  const [timePreset, setTimePreset] = useState("morning")
  const [customTime, setCustomTime] = useState("09:00")
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function reset() {
    setStep(0)
    setDirection("forward")
    setType("goal")
    setTitle("")
    setDescription("")
    setShowDescription(false)
    setFrequency("daily")
    setTimePreset("morning")
    setCustomTime("09:00")
    setReminderDays([1, 2, 3, 4, 5, 6, 7])
    setLoading(false)
    setSuccess(false)
  }

  function goNext() {
    setDirection("forward")
    setStep(1)
  }

  function goBack() {
    setDirection("back")
    setStep(0)
  }

  function toggleDay(day: number) {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
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
    const reminderTime =
      timePreset === "custom"
        ? customTime
        : (timePresets.find((t) => t.id === timePreset)?.value ?? "08:00")

    const isOneTime = frequency === "one_time"
    const reminderSchedule = !isOneTime
      ? { enabled: true, times: [reminderTime], timezone, days: reminderDays }
      : null

    const { error } = await supabase.from("accountability_items").insert({
      space_id: spaceId,
      user_id: user.id,
      title,
      description: description || null,
      type,
      frequency,
      reminder_schedule: reminderSchedule,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSuccess(true)
    toast.success("Goal created!")
    setTimeout(() => {
      setOpen(false)
      reset()
      router.refresh()
    }, 1000)
  }

  const selectedType = typeOptions.find((t) => t.value === type)
  const showReminder = frequency !== "one_time"
  const showDays = frequency === "daily" || frequency === "weekly"

  const resolvedTime =
    timePreset === "custom"
      ? customTime
      : (timePresets.find((t) => t.id === timePreset)?.label.toLowerCase() ?? "morning")
  const daysLabel =
    reminderDays.length === 7
      ? "every day"
      : reminderDays.length === 5 && reminderDays.every((d) => d <= 5)
        ? "on weekdays"
        : `${reminderDays.length} days/week`

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
        {success ? (
          <SuccessView />
        ) : (
          <>
            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i === step
                      ? "w-6 bg-brand"
                      : i < step
                        ? "w-3 bg-brand/40"
                        : "w-3 bg-foreground/10"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <div
              key={step}
              className={cn(
                "animate-in duration-200",
                direction === "forward"
                  ? "fade-in slide-in-from-right-4"
                  : "fade-in slide-in-from-left-4"
              )}
            >
              {step === 0 ? (
                <div className="space-y-5 py-2">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">
                      What are you working on?
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Give it a clear, specific name.
                    </p>
                  </div>

                  {/* Type pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {typeOptions.map((opt) => {
                      const selected = type === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setType(opt.value)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition-all duration-200",
                            selected
                              ? `${opt.ring} ${opt.bg} ${opt.color}`
                              : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                          )}
                        >
                          <opt.icon className="h-3 w-3" />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                        Title
                      </span>
                      <span
                        className={cn(
                          "text-[10px] tabular-nums transition-colors",
                          title.length > TITLE_MAX - 10
                            ? "text-red-500"
                            : "text-muted-foreground/40"
                        )}
                      >
                        {title.length}/{TITLE_MAX}
                      </span>
                    </div>
                    <Input
                      autoFocus
                      placeholder="e.g., Run 5K three times a week"
                      value={title}
                      onChange={(e) => {
                        if (e.target.value.length <= TITLE_MAX) setTitle(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && title.trim()) {
                          e.preventDefault()
                          goNext()
                        }
                      }}
                      className="h-11 text-sm rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Optional description */}
                  {!showDescription ? (
                    <button
                      onClick={() => setShowDescription(true)}
                      className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      + Add details
                    </button>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Textarea
                        autoFocus
                        placeholder="Any context for your accountability partners..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="text-sm rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/40 resize-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5 py-2">
                  {/* Header with type badge */}
                  <div className="text-center space-y-1">
                    {selectedType && (
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span
                          className={cn(
                            "flex items-center gap-1 text-[11px] font-semibold",
                            selectedType.color
                          )}
                        >
                          <selectedType.icon className="h-3 w-3" />
                          {selectedType.label}
                        </span>
                      </div>
                    )}
                    <h2 className="text-lg font-bold tracking-tight">How often?</h2>
                    <p className="text-xs text-muted-foreground">
                      Set your pace and we&apos;ll remind you.
                    </p>
                  </div>

                  {/* Frequency pills */}
                  <div className="flex items-center justify-center gap-1.5">
                    {frequencyOptions.map((opt) => {
                      const selected = frequency === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setFrequency(opt.value)
                            if (opt.value === "daily")
                              setReminderDays([1, 2, 3, 4, 5, 6, 7])
                            else if (opt.value === "weekly")
                              setReminderDays([1, 2, 3, 4, 5])
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-medium ring-1 transition-all duration-200",
                            selected
                              ? "ring-brand bg-brand/5 text-brand"
                              : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/40"
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Reminder config — always on */}
                  {showReminder && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Time of day */}
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                          Remind me
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {timePresets.map((preset) => {
                            const selected = timePreset === preset.id
                            return (
                              <button
                                key={preset.id}
                                onClick={() => setTimePreset(preset.id)}
                                className={cn(
                                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 ring-1 transition-all duration-200",
                                  selected
                                    ? "ring-brand bg-brand/5"
                                    : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
                                )}
                              >
                                <span className="text-sm">{preset.emoji}</span>
                                <span
                                  className={cn(
                                    "text-[11px] font-medium",
                                    selected ? "text-brand" : "text-foreground"
                                  )}
                                >
                                  {preset.label}
                                </span>
                              </button>
                            )
                          })}
                          <button
                            onClick={() => setTimePreset("custom")}
                            className={cn(
                              "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 ring-1 transition-all duration-200",
                              timePreset === "custom"
                                ? "ring-brand bg-brand/5"
                                : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/40"
                            )}
                          >
                            <ClockCircle
                              className={cn(
                                "h-4 w-4 mt-0.5",
                                timePreset === "custom"
                                  ? "text-brand"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "text-[11px] font-medium",
                                timePreset === "custom" ? "text-brand" : "text-foreground"
                              )}
                            >
                              Custom
                            </span>
                          </button>
                        </div>

                        {timePreset === "custom" && (
                          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <Input
                              type="time"
                              value={customTime}
                              onChange={(e) => setCustomTime(e.target.value)}
                              className="h-10 rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 text-sm text-center"
                            />
                          </div>
                        )}
                      </div>

                      {/* Day picker */}
                      {showDays && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                              Which days
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setReminderDays([1, 2, 3, 4, 5])}
                                className={cn(
                                  "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
                                  reminderDays.length === 5 &&
                                    reminderDays.every((d) => d <= 5)
                                    ? "bg-brand/10 text-brand"
                                    : "text-muted-foreground/40 hover:text-muted-foreground"
                                )}
                              >
                                Weekdays
                              </button>
                              <button
                                onClick={() => setReminderDays([1, 2, 3, 4, 5, 6, 7])}
                                className={cn(
                                  "text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
                                  reminderDays.length === 7
                                    ? "bg-brand/10 text-brand"
                                    : "text-muted-foreground/40 hover:text-muted-foreground"
                                )}
                              >
                                Every day
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-1.5 justify-between">
                            {dayLabels.map((day) => (
                              <button
                                key={day.value}
                                onClick={() => toggleDay(day.value)}
                                className={cn(
                                  "h-9 w-9 rounded-full text-xs font-semibold transition-all duration-200",
                                  reminderDays.includes(day.value)
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

                      {/* Summary */}
                      <div className="rounded-xl bg-brand/5 ring-1 ring-brand/10 px-3.5 py-2.5 flex items-center gap-2">
                        <ClockCircle className="h-3.5 w-3.5 text-brand shrink-0" />
                        <p className="text-[11px] text-brand font-medium">
                          Reminder {resolvedTime}
                          {showDays && <>, {daysLabel}</>}
                        </p>
                      </div>
                    </div>
                  )}

                  {!showReminder && (
                    <div className="rounded-xl bg-muted/40 px-4 py-3 text-center">
                      <p className="text-[11px] text-muted-foreground">
                        One-time goals don&apos;t need reminders — just do it!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nav */}
            <div className="flex items-center gap-2 pt-1">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
              )}
              <div className="flex-1" />
              {step === 0 ? (
                <Button
                  onClick={goNext}
                  disabled={!title.trim()}
                  className="gap-1.5 h-10 rounded-xl"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !frequency}
                  className="gap-2 h-10 px-6 rounded-xl"
                >
                  {loading ? (
                    <>
                      <Restart className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Stars className="h-4 w-4" />
                      Create
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SuccessView() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center transition-all duration-500",
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}
    >
      <div className="relative mb-4">
        <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-green-500" />
        </div>
        <Stars className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold">You&apos;re all set!</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Your accountability partners can now see your goal.
      </p>
    </div>
  )
}
