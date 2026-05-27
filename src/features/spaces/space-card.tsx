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
} from "@solar-icons/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

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

  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function handleNavigate() {
    router.push(`/spaces/${space.id}`)
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
      className="group relative rounded-xl ring-1 ring-foreground/[0.06] hover:ring-foreground/15 hover:bg-muted/30 cursor-pointer transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
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
          </div>

          {isOwner && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 rounded-lg text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors data-popup-open:bg-muted data-popup-open:text-foreground">
                  <MenuDots className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                  <DropdownMenuItem onClick={() => router.push(`/spaces/${space.id}/edit`)}>
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
      </div>
    </div>
  )
}
