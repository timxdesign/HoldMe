"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FadeIn } from "@/components/ui/fade-in"
import { ArrowLeft, Restart, Target } from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const statusOptions = [
  { value: "active", label: "Active", color: "text-brand", bg: "bg-brand/8", ring: "ring-brand" },
  { value: "paused", label: "Paused", color: "text-orange-500", bg: "bg-orange-500/8", ring: "ring-orange-500" },
  { value: "completed", label: "Completed", color: "text-green-500", bg: "bg-green-500/8", ring: "ring-green-500" },
  { value: "archived", label: "Archived", color: "text-muted-foreground", bg: "bg-muted/50", ring: "ring-foreground/20" },
]

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  one_time: "Once",
}

interface EditGoalFormProps {
  spaceId: string
  goalId: string
  title: string
  description: string | null
  status: string
  frequency: string
  type: string
  dueDate: string | null
  goalOwnerName: string
}

export function EditGoalForm({
  spaceId,
  goalId,
  title,
  description,
  status,
  frequency,
  type,
  dueDate,
  goalOwnerName,
}: EditGoalFormProps) {
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description ?? "")
  const [editStatus, setEditStatus] = useState(status)
  const [editDueDate, setEditDueDate] = useState(dueDate ?? "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    if (!editTitle.trim()) {
      toast.error("Title can't be empty")
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from("accountability_items")
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        status: editStatus,
        due_date: editDueDate || null,
      })
      .eq("id", goalId)

    setSaving(false)
    if (error) {
      toast.error("Failed to update")
      return
    }

    toast.success("Goal updated!")
    router.push(`/spaces/${spaceId}/goals/${goalId}`)
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <FadeIn>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      </FadeIn>

      <FadeIn delay={75}>
        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-foreground/[0.04] p-2.5 shrink-0">
            <Target className="h-4 w-4 text-foreground/60" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit goal</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {goalOwnerName} &middot; {frequencyLabels[frequency] ?? frequency} &middot; {type}
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="mt-8 space-y-8">
        {/* Title */}
        <FadeIn delay={150}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="goal-title" className="text-sm font-medium">
                Title
              </label>
              <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                {editTitle.length}/80
              </span>
            </div>
            <Input
              id="goal-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Goal title"
              maxLength={80}
              className="h-11 rounded-xl"
              autoFocus
            />
          </div>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={200}>
          <div className="space-y-2">
            <label htmlFor="goal-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="goal-desc"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add some details or context..."
              rows={3}
              className="rounded-xl resize-none text-sm"
            />
          </div>
        </FadeIn>

        {/* Status */}
        <FadeIn delay={250}>
          <div className="space-y-3">
            <label className="text-sm font-medium">Status</label>
            <div className="grid grid-cols-2 gap-2.5">
              {statusOptions.map((option) => {
                const isSelected = editStatus === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEditStatus(option.value)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium ring-1 transition-all duration-200 active:scale-[0.97]",
                      isSelected
                        ? `${option.ring} ${option.bg} ${option.color}`
                        : "ring-foreground/[0.06] text-muted-foreground hover:ring-foreground/10 hover:bg-muted/30"
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Due date */}
        <FadeIn delay={300}>
          <div className="space-y-2">
            <label htmlFor="goal-due" className="text-sm font-medium">
              Due date <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="goal-due"
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="h-11 rounded-xl"
            />
            {editDueDate && (
              <button
                onClick={() => setEditDueDate("")}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Clear date
              </button>
            )}
          </div>
        </FadeIn>

        {/* Save */}
        <FadeIn delay={350}>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl gap-2"
              onClick={handleSave}
              disabled={saving || !editTitle.trim()}
            >
              {saving && <Restart className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
