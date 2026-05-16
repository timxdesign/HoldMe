"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
      <p className="text-sm text-muted-foreground text-center py-8">
        No members yet. Invite someone to hold you accountable!
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const user = member.users
        const initials = user?.full_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() ?? "?"

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.full_name ?? "Unknown"}
              </p>
            </div>
            {member.user_id === ownerId && (
              <Badge variant="secondary" className="text-[10px]">
                Owner
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}
