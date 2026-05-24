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
  Plus,
  Target,
  CheckSquare,
  Repeat,
  Handshake,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react"
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
    icon: Handshake,
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

const TITLE_MAX = 80

export function AddItemForm({ spaceId }: AddItemFormProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [frequency, setFrequency] = useState("")
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

    const { error } = await supabase.from("accountability_items").insert({
      space_id: spaceId,
      user_id: user.id,
      title,
      description: description || null,
      type: type || "goal",
      frequency: frequency || "daily",
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
        <Plus className="h-3.5 w-3.5" />
        Add Goal
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden" showCloseButton={!success}>
        {success ? <SuccessView /> : (
          <>
            <StepHeader step={step} selectedType={selectedType} />
            <StepIndicator current={step} total={3} />

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

function StepHeader({ step, selectedType }: { step: number; selectedType?: typeof typeOptions[number] }) {
  const titles = ["What kind of goal?", "Describe your goal", "How often?"]
  const subtitles = [
    "Pick the type that fits best.",
    "Give it a clear, specific name.",
    "Choose how often you'll check in.",
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
                  <Check className={cn("h-3 w-3", opt.color)} />
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
              {selected && <Check className="h-3 w-3 text-white" />}
            </div>
          </button>
        )
      })}
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
  const isLast = step === 2

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
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
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

function SuccessView() {
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
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
      </div>
      <h3 className="text-lg font-bold">Goal created!</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Your accountability partners can now see it.
      </p>
    </div>
  )
}
