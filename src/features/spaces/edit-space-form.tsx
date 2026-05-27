"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FadeIn } from "@/components/ui/fade-in"
import { ArrowLeft, Lock, Restart, UsersGroupTwoRounded } from "@solar-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const visibilityOptions = [
  {
    value: "private",
    label: "Private",
    description: "Only people you invite can see and join",
    icon: Lock,
  },
  {
    value: "members_only",
    label: "Members Only",
    description: "Visible to all members, invite to join",
    icon: UsersGroupTwoRounded,
  },
]

interface EditSpaceFormProps {
  spaceId: string
  name: string
  description: string | null
  visibility: string
}

export function EditSpaceForm({ spaceId, name, description, visibility }: EditSpaceFormProps) {
  const [editName, setEditName] = useState(name)
  const [editDesc, setEditDesc] = useState(description ?? "")
  const [editVisibility, setEditVisibility] = useState(visibility)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    if (!editName.trim()) {
      toast.error("Name can't be empty")
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from("spaces")
      .update({
        name: editName.trim(),
        description: editDesc.trim() || null,
        visibility: editVisibility,
      })
      .eq("id", spaceId)

    setSaving(false)
    if (error) {
      toast.error("Failed to update space")
      return
    }

    toast.success("Space updated!")
    router.push(`/spaces/${spaceId}`)
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
        <h1 className="text-2xl font-bold tracking-tight mt-6">Edit space</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your space details
        </p>
      </FadeIn>

      <div className="mt-8 space-y-8">
        {/* Name */}
        <FadeIn delay={150}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="space-name" className="text-sm font-medium">
                Space name
              </label>
              <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                {editName.length}/60
              </span>
            </div>
            <Input
              id="space-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g., 30 Day Discipline Challenge"
              maxLength={60}
              className="h-11 rounded-xl"
              autoFocus
            />
          </div>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={200}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="space-desc" className="text-sm font-medium">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              {editDesc.length > 0 && (
                <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                  {editDesc.length}/200
                </span>
              )}
            </div>
            <Textarea
              id="space-desc"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="What are you working toward together?"
              rows={3}
              maxLength={200}
              className="rounded-xl resize-none text-sm"
            />
          </div>
        </FadeIn>

        {/* Visibility */}
        <FadeIn delay={250}>
          <div className="space-y-3">
            <label className="text-sm font-medium">Visibility</label>
            <div className="grid gap-3">
              {visibilityOptions.map((option) => {
                const isSelected = editVisibility === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEditVisibility(option.value)}
                    className={cn(
                      "relative flex items-start gap-3 rounded-xl p-4 text-left ring-1 transition-all duration-200 active:scale-[0.99]",
                      isSelected
                        ? "ring-brand bg-brand/5"
                        : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg p-2 shrink-0",
                        isSelected ? "bg-brand/15" : "bg-muted"
                      )}
                    >
                      <option.icon
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-brand" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-sm font-medium", isSelected && "text-brand")}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Save */}
        <FadeIn delay={300}>
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
              disabled={saving || !editName.trim()}
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
