"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Target,
  CheckSquare,
  Repeat,
  HandShake,
  ArrowLeft,
  Stars,
  CheckCircle,
  Restart,
} from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useConfetti } from "@/components/effects/confetti"

type ItemType = "goal" | "habit" | "task" | "commitment"

const TYPE_OPTIONS = [
  { value: "goal" as const, label: "Goal", desc: "Set a target for the circle", icon: Target, color: "text-brand", bg: "bg-brand/10", ring: "ring-brand/60", iconBg: "bg-brand/8" },
  { value: "habit" as const, label: "Habit", desc: "Build a regular rhythm together", icon: Repeat, color: "text-green-500", bg: "bg-green-500/10", ring: "ring-green-500/60", iconBg: "bg-green-500/8" },
  { value: "task" as const, label: "Task", desc: "Something to get done as a group", icon: CheckSquare, color: "text-orange-500", bg: "bg-orange-500/10", ring: "ring-orange-500/60", iconBg: "bg-orange-500/8" },
  { value: "commitment" as const, label: "Commitment", desc: "A promise everyone keeps", icon: HandShake, color: "text-purple-500", bg: "bg-purple-500/10", ring: "ring-purple-500/60", iconBg: "bg-purple-500/8" },
]

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "one_time", label: "One-time" },
]

const TITLE_MAX = 80

interface CreateCircleItemProps {
  circleId: string
}

export function CreateCircleItem({ circleId }: CreateCircleItemProps) {
  const [type, setType] = useState<ItemType | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showDescription, setShowDescription] = useState(false)
  const [frequency, setFrequency] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const confetti = useConfetti()

  const valid = !!type && !!title.trim() && !!frequency

  function handleTypeChange(t: ItemType) {
    setType(t)
    if (t === "habit") setFrequency("daily")
    else if (t === "task") setFrequency("one_time")
    else if (t === "commitment") setFrequency(null)
    else setFrequency(null)
  }

  function getButtonLabel(): string {
    if (!type) return "Create"
    return `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`
  }

  function getSummary(): string {
    if (!type) return "What will your circle work on?"
    if (!title.trim()) return "Give it a name to get started."
    const t = title.trim()
    if (!frequency) return `${t} — how often?`
    const freqLabel = FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label?.toLowerCase() ?? frequency
    return `${t} — ${freqLabel}. Everyone can check in.`
  }

  async function handleSubmit() {
    if (!valid) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("circle_goals").insert({
      circle_id: circleId,
      title: title.trim(),
      description: description.trim() || null,
      type,
      frequency,
      created_by: user.id,
    })

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    setSuccess(true)
    confetti()
    setTimeout(() => confetti(), 300)
    setTimeout(() => {
      router.push(`/circles/${circleId}`)
      router.refresh()
    }, 2000)
  }

  const selectedType = TYPE_OPTIONS.find((t) => t.value === type)
  const summary = getSummary()

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 flex flex-col items-center justify-center text-center">
        <div className="animate-success-check relative mb-5">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl animate-reveal" style={{ animationDelay: "200ms" }}>
          You&apos;re all set!
        </h2>
        <p className="text-muted-foreground mt-2 animate-reveal" style={{ animationDelay: "350ms" }}>
          Everyone in the circle can now check in on this.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-56">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground transition-colors active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mt-10 space-y-10">
        {/* Type selector */}
        <div>
          <h1 className="text-2xl tracking-tight">What is your circle working on?</h1>
          <div className="grid grid-cols-2 gap-3 mt-5">
            {TYPE_OPTIONS.map((opt) => {
              const selected = type === opt.value
              const dimmed = type !== null && !selected
              return (
                <button
                  key={opt.value}
                  onClick={() => handleTypeChange(opt.value)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-2xl ring-1 text-left transition-all duration-200 active:scale-[0.97]",
                    selected
                      ? `${opt.ring} ${opt.bg}`
                      : dimmed
                        ? "ring-foreground/[0.04] opacity-50"
                        : "ring-foreground/[0.06] hover:ring-foreground/10 hover:bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200",
                      selected ? opt.bg : dimmed ? "bg-muted/40" : opt.iconBg
                    )}
                  >
                    <opt.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors duration-200",
                        selected || !dimmed ? opt.color : "text-muted-foreground/50"
                      )}
                    />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={cn(
                        "text-sm font-semibold transition-colors duration-200",
                        selected ? "text-foreground" : dimmed ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {opt.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-0.5 transition-colors duration-200",
                        dimmed ? "text-muted-foreground/50" : "text-muted-foreground"
                      )}
                    >
                      {opt.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        {type && (
          <div className="animate-reveal">
            <Input
              autoFocus
              placeholder={
                type === "goal"
                  ? "e.g., Run 5K three times a week"
                  : type === "habit"
                    ? "e.g., Meditate every morning"
                    : type === "task"
                      ? "e.g., Submit quarterly report"
                      : "e.g., Call Mom every Sunday"
              }
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= TITLE_MAX)
                  setTitle(e.target.value)
              }}
              className="h-14 text-lg rounded-2xl bg-muted/30 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/30"
            />
            {title.length > TITLE_MAX - 15 && (
              <p
                className={cn(
                  "text-[10px] tabular-nums mt-1.5 text-right transition-colors",
                  title.length > TITLE_MAX - 5 ? "text-red-500" : "text-muted-foreground/40"
                )}
              >
                {title.length}/{TITLE_MAX}
              </p>
            )}
            {!showDescription ? (
              <button
                onClick={() => setShowDescription(true)}
                className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-2"
              >
                + Add description
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-3">
                <Textarea
                  autoFocus
                  placeholder="Add some context or details for the circle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="text-sm rounded-xl bg-muted/30 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/30 resize-none"
                />
                <button
                  onClick={() => {
                    setShowDescription(false)
                    setDescription("")
                  }}
                  className="text-[11px] text-muted-foreground/30 hover:text-muted-foreground transition-colors mt-1.5"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Frequency */}
        {type && title.trim() && (
          <div className="animate-reveal space-y-4">
            <h2 className="text-xl">How often?</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFrequency(opt.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium ring-1 transition-all duration-200 active:scale-[0.97]",
                    frequency === opt.value
                      ? "ring-brand/60 bg-brand/5 text-brand"
                      : "ring-foreground/[0.06] text-muted-foreground hover:ring-foreground/10 hover:bg-muted/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-56 right-0 z-40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 border-t border-foreground/[0.04] px-5 py-4">
        <div className="max-w-lg mx-auto">
          <p
            key={summary}
            className="font-heading text-[15px] text-center text-foreground/60 mb-3 animate-summary-enter"
          >
            {summary}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!valid || loading}
            className={cn(
              "w-full h-12 rounded-xl text-base gap-2 transition-all duration-300",
              valid && !loading && "shadow-lg shadow-primary/20"
            )}
          >
            {loading ? (
              <>
                <Restart className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Stars className="h-4 w-4" />
                {getButtonLabel()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
