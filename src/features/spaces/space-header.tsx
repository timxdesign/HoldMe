"use client"

import Link from "next/link"
import { ArrowLeft, Users, Target, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SpaceHeaderProps {
  spaceId: string
  name: string
  description: string | null
  memberCount: number
  itemCount: number
  isOwner: boolean
}

export function SpaceHeader({
  spaceId,
  name,
  description,
  memberCount,
  itemCount,
  isOwner,
}: SpaceHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/spaces"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Spaces
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/8 via-transparent to-brand-secondary/8 ring-1 ring-foreground/10 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                {name}
              </h1>
              {isOwner && (
                <Badge variant="secondary" className="text-[10px] shrink-0 gap-1">
                  <Crown className="h-2.5 w-2.5" />
                  Owner
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          <Link
            href={`/spaces/${spaceId}/members`}
            className="relative shrink-0 rounded-xl bg-card ring-1 ring-foreground/10 p-3 transition-all hover:ring-brand/30 hover:shadow-sm group/members"
          >
            <Users className="h-5 w-5 text-muted-foreground group-hover/members:text-brand transition-colors" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-brand text-[10px] font-bold text-white">
              {memberCount}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-foreground/5">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="rounded-md bg-orange-500/10 p-1">
              <Target className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span className="font-medium">{itemCount}</span>
            <span className="text-muted-foreground text-xs">goal{itemCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
