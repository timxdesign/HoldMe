"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Target, CheckSquare, Repeat, Handshake, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddItemFormProps {
  spaceId: string
}

const typeOptions = [
  { value: "goal", label: "Goal", icon: Target },
  { value: "task", label: "Task", icon: CheckSquare },
  { value: "habit", label: "Habit", icon: Repeat },
  { value: "commitment", label: "Commitment", icon: Handshake },
]

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "one_time", label: "One time" },
]

export function AddItemForm({ spaceId }: AddItemFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("goal")
  const [frequency, setFrequency] = useState("daily")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      type,
      frequency,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Goal added!")
    setTitle("")
    setDescription("")
    setType("goal")
    setFrequency("daily")
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" variant="outline" className="gap-1.5 rounded-lg" />}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Goal
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new goal</DialogTitle>
          <DialogDescription>
            What do you want to be held accountable for?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="goal-title" className="text-sm font-medium">
              What&apos;s the goal?
            </label>
            <Input
              id="goal-title"
              placeholder="e.g., Wake up at 5AM, Read 20 pages..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-desc" className="text-sm font-medium">
              Details{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="goal-desc"
              placeholder="Add context your partners should know..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-medium">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {typeOptions.map((opt) => {
                const isSelected = type === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center ring-1 transition-all ${
                      isSelected
                        ? "ring-brand bg-brand/5 shadow-sm"
                        : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/50"
                    }`}
                  >
                    <opt.icon
                      className={`h-4 w-4 ${isSelected ? "text-brand" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`text-[11px] font-medium ${isSelected ? "text-brand" : "text-muted-foreground"}`}
                    >
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-medium">How often?</label>
            <div className="flex flex-wrap gap-2">
              {frequencyOptions.map((opt) => {
                const isSelected = frequency === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 transition-all ${
                      isSelected
                        ? "ring-brand bg-brand/10 text-brand"
                        : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 gap-2"
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Goal"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
