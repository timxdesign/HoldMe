"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  UsersGroupTwoRounded,
  Heart,
  Target,
  Crown,
  MenuDots,
  Pen2,
  TrashBinTrash,
  Restart,
  CheckCircle,
} from "@solar-icons/react"
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    space_members: any[] | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accountability_items?: any[] | null
  }
  strengthCount?: number
  ownerName?: string
  isOwner?: boolean
}

export function SpaceCard({ space, strengthCount = 0, ownerName, isOwner = false }: SpaceCardProps) {
  const firstMember = space.space_members?.[0]
  const memberCount = typeof firstMember?.count === "number"
    ? firstMember.count
    : space.space_members?.length ?? 0
  const firstItem = space.accountability_items?.[0]
  const itemCount = typeof firstItem?.count === "number"
    ? firstItem.count
    : space.accountability_items?.length ?? 0

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
        "group relative rounded-xl ring-1 transition-all duration-200",
        editing
          ? "ring-brand/30 bg-card"
          : "ring-foreground/[0.06] hover:ring-foreground/15 hover:bg-muted/30 cursor-pointer"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
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
                      <Restart className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
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
                  <h3 className="font-semibold text-[15px] truncate group-hover:text-foreground transition-colors">
                    {space.name}
                  </h3>
                  {isOwner && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                      <Crown className="h-2.5 w-2.5" />
                      Owner
                    </span>
                  )}
                </div>

                {space.description && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mt-1">
                    {space.description}
                  </p>
                )}
              </>
            )}
          </div>

          {!editing && isOwner && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 rounded-lg text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors data-popup-open:bg-muted data-popup-open:text-foreground">
                  <MenuDots className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                  <DropdownMenuItem onClick={() => { setEditing(true) }}>
                    <Pen2 className="h-3.5 w-3.5" />
                    Edit space
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Restart className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <TrashBinTrash className="h-3.5 w-3.5" />
                    )}
                    {deleting ? "Deleting..." : "Delete space"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-foreground/[0.04] text-xs text-muted-foreground">
            {ownerName ? (
              <span className="text-muted-foreground">
                by <span className="font-medium text-foreground/70">{ownerName}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <UsersGroupTwoRounded className="h-3 w-3" />
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
            )}
            {itemCount > 0 && (
              <>
                <span className="text-foreground/10">&middot;</span>
                <span className="inline-flex items-center gap-1.5">
                  <Target className="h-3 w-3" />
                  {itemCount} goal{itemCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
            {strengthCount > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 text-pink-500">
                <Heart className="h-3 w-3 fill-current" />
                <span className="text-[11px] font-medium">{strengthCount}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
