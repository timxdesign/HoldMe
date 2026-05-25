"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, UsersGroupTwoRounded } from "@solar-icons/react"

interface Member {
  id: string
  user_id: string
  role: string
  users: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface MemberListProps {
  members: Member[]
  ownerId: string
}

export function MemberList({ members, ownerId }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <UsersGroupTwoRounded className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No members yet. Invite someone to hold you accountable!
        </p>
      </div>
    )
  }

  const sorted = [...members].sort((a, b) => {
    if (a.user_id === ownerId) return -1
    if (b.user_id === ownerId) return 1
    return 0
  })

  return (
    <div className="space-y-2">
      {sorted.map((member) => {
        const user = member.users
        const initials =
          user?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() ?? "?"
        const isOwner = member.user_id === ownerId

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-foreground/5 bg-card transition-colors hover:bg-muted/50"
          >
            <Avatar>
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs font-medium bg-brand/10 text-brand">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.full_name ?? "Unknown"}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {member.role}
              </p>
            </div>
            {isOwner && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Crown className="h-2.5 w-2.5" />
                Owner
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}
