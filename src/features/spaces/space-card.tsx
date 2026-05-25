"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Users,
  ChevronRight,
  Heart,
  Target,
  Lock,
  Globe,
  Crown,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SpaceCardProps {
  space: {
    id: string
    name: string
    description: string | null
    visibility: string
    space_members: { count: number }[] | null
    accountability_items?: { count: number }[] | null
  }
  strengthCount?: number
  ownerName?: string
}

export function SpaceCard({ space, strengthCount = 0, ownerName }: SpaceCardProps) {
  const memberCount = space.space_members?.[0]?.count ?? 0
  const itemCount = space.accountability_items?.[0]?.count ?? 0
  const isPrivate = space.visibility === "private"
  const isJoined = !!ownerName
  const isOwner = !isJoined

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(space.name)
  const [editDesc, setEditDesc] = useState(space.description ?? "")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function handleNavigate() {
    if (!editing) {
      router.push(`/spaces/${space.id}`)
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim()) {
      toast.error("Name can't be empty")
      return
    }
    setSavingEdit(true)
    const { error } = await supabase
      .from("spaces")
      .update({ name: editName.trim(), description: editDesc.trim() || null })
      .eq("id", space.id)

    setSavingEdit(false)
    if (error) {
      toast.error("Failed to update")
      return
    }
    setEditing(false)
    toast.success("Space updated")
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from("spaces").delete().eq("id", space.id)
    setDeleting(false)
    if (error) {
      toast.error("Failed to delete space")
      return
    }
    setDeleted(true)
    toast.success("Space deleted")
    router.refresh()
  }

  if (deleted) return null

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card ring-1 transition-all duration-300",
        editing
          ? "ring-brand/30 shadow-lg"
          : isJoined
            ? "ring-foreground/8 hover:ring-purple-500/25 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5 cursor-pointer"
            : "ring-foreground/10 hover:ring-brand/25 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-0.5 cursor-pointer"
      )}
    >
      {/* Gradient accent bar */}
      <div
        className={cn(
          "h-[3px] transition-opacity duration-300",
          isJoined
            ? "bg-gradient-to-r from-purple-500/40 via-pink-500/30 to-purple-500/40 opacity-60 group-hover:opacity-100"
            : "bg-gradient-to-r from-brand/40 via-brand-secondary/30 to-brand/40 opacity-60 group-hover:opacity-100"
        )}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            {editing ? (
              <div className="space-y-3 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Name
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={60}
                    className="w-full rounded-lg ring-1 ring-foreground/10 bg-card px-3 py-2 text-sm font-semibold outline-none focus:ring-brand transition-colors"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg ring-1 ring-foreground/10 bg-card px-3 py-2 text-xs outline-none focus:ring-brand transition-colors resize-none"
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={savingEdit || !editName.trim()}
                    className="gap-1.5 rounded-lg h-8 text-xs"
                  >
                    {savingEdit ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    {savingEdit ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setEditing(false); setEditName(space.name); setEditDesc(space.description ?? "") }}
                    className="rounded-lg h-8 text-xs text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[15px] truncate group-hover:text-brand transition-colors">
                    {space.name}
                  </h3>
                  {isOwner && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                      <Crown className="h-2.5 w-2.5" />
                      Owner
                    </span>
                  )}
                </div>

                {ownerName && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0">
                      <span className="text-[7px] font-bold text-white">
                        {ownerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      by <span className="font-medium text-foreground/70">{ownerName}</span>
                    </span>
                  </div>
                )}

                {space.description && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                    {space.description}
                  </p>
                )}
              </>
            )}
          </div>

          {!editing && (
            <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
              {isOwner && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors data-popup-open:bg-muted data-popup-open:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                      <DropdownMenuItem onClick={() => { setEditing(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit space
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {deleting ? "Deleting..." : "Delete space"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {strengthCount > 0 && (
                <div className="flex items-center gap-1 bg-pink-500/10 text-pink-500 rounded-full px-2 py-1 shadow-sm shadow-pink-500/10">
                  <Heart className="h-3 w-3 fill-current animate-pulse" />
                  <span className="text-[10px] font-bold">{strengthCount}</span>
                </div>
              )}
              {!isOwner && (
                <div className="h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center transition-all duration-300 group-hover:bg-brand/10">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-300 group-hover:text-brand group-hover:translate-x-0.5" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats row */}
        {!editing && (
          <div className="flex items-center gap-2 pt-1 border-t border-foreground/5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/8 px-2.5 py-1 text-[11px]">
              <Users className="h-3 w-3 text-green-500" />
              <span className="font-semibold text-green-600">{memberCount}</span>
              <span className="text-muted-foreground">member{memberCount !== 1 ? "s" : ""}</span>
            </span>

            {itemCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/8 px-2.5 py-1 text-[11px]">
                <Target className="h-3 w-3 text-orange-500" />
                <span className="font-semibold text-orange-600">{itemCount}</span>
                <span className="text-muted-foreground">goal{itemCount !== 1 ? "s" : ""}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
              {isPrivate ? (
                <Lock className="h-2.5 w-2.5" />
              ) : (
                <Globe className="h-2.5 w-2.5" />
              )}
              <span className="font-medium">{isPrivate ? "Private" : "Open"}</span>
            </span>

            {strengthCount > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-pink-500 font-medium">
                <Sparkles className="h-2.5 w-2.5" />
                Active support
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
